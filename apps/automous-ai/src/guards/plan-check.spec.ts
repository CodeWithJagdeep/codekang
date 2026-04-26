// Isolated unit tests for the plan-check guard.
// We mock `db` and `createIssueComment` to avoid real DB/GitHub calls.

jest.mock('../config/env', () => ({
  env: {
    GITHUB_APP_ID: '',
    GITHUB_PRIVATE_KEY: '',
    GITHUB_WEBHOOK_SECRET: 'test-secret',
    GITHUB_TOKEN: 'ghp_test',
    NODE_ENV: 'test',
    PORT: 4000,
    ANTHROPIC_API_KEY: 'test-key',
    ANTHROPIC_MODEL_AGENT: 'claude-sonnet-4-6',
    AGENT_MAX_STEPS: 10,
    AGENT_MAX_TOKENS: 4096,
    AGENT_TEMPERATURE: 0.3,
    WEBHOOK_PATH: '/webhook/github',
    DATABASE_URL: 'postgresql://localhost/test',
    REDIS_URL: 'redis://localhost:6379',
  },
}));
jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock('../config/database', () => ({
  db: { query: jest.fn() },
}));

jest.mock('../github/api', () => ({
  createIssueComment: jest.fn().mockResolvedValue(undefined),
}));

// Must import AFTER mocks are registered
import { db } from '../config/database';
import { createIssueComment } from '../github/api';
import {
  checkAutonomousFix,
  checkPRReview,
  consumeFixCredits,
  consumeReviewCredits,
} from './plan-check';

const mockQuery = db.query as jest.Mock;
const mockComment = createIssueComment as jest.Mock;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeUserRow = (plan = 'pro', creditsUsed = 0, isInstalled = true) => ({
  rows: [
    {
      user_id: 'user-uuid-1',
      is_installed: isInstalled,
      plan,
      credits_used: creditsUsed,
      credits_reset: new Date(Date.now() + 86400000 * 30),
      is_active: true,
    },
  ],
});

// ─── checkAutonomousFix ───────────────────────────────────────────────────────

describe('checkAutonomousFix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows fix for pro user with credits available', async () => {
    mockQuery.mockResolvedValue(makeUserRow('pro', 100));

    const result = await checkAutonomousFix('acme', 'backend', 1);

    expect(result.allowed).toBe(true);
    expect(result.userId).toBe('user-uuid-1');
  });

  it('allows fix for team user regardless of credits (unlimited)', async () => {
    mockQuery.mockResolvedValue(makeUserRow('team', 99999));

    const result = await checkAutonomousFix('acme', 'backend', 1);

    expect(result.allowed).toBe(true);
  });

  it('allows fix for enterprise user', async () => {
    mockQuery.mockResolvedValue(makeUserRow('enterprise', 0));

    const result = await checkAutonomousFix('acme', 'backend', 1);

    expect(result.allowed).toBe(true);
  });

  it('blocks and posts comment for free plan (no autonomous fix)', async () => {
    mockQuery.mockResolvedValue(makeUserRow('free', 0));

    const result = await checkAutonomousFix('acme', 'backend', 5, 123);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('plan_limit');
    expect(mockComment).toHaveBeenCalledWith(
      'acme',
      'backend',
      5,
      expect.stringContaining('Starter'),
      123,
    );
  });

  it('blocks and posts comment for starter plan (no autonomous fix)', async () => {
    mockQuery.mockResolvedValue(makeUserRow('starter', 0));

    const result = await checkAutonomousFix('acme', 'backend', 3);

    expect(result.allowed).toBe(false);
    expect(mockComment).toHaveBeenCalledWith(
      'acme',
      'backend',
      3,
      expect.stringContaining('Pro'),
      undefined,
    );
  });

  it('blocks and posts comment when credits exhausted', async () => {
    mockQuery.mockResolvedValue(makeUserRow('pro', 1500)); // all 1500 used

    const result = await checkAutonomousFix('acme', 'backend', 1);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('no_credits');
    expect(mockComment).toHaveBeenCalledWith(
      'acme',
      'backend',
      1,
      expect.stringContaining('Team'),
      undefined,
    );
  });

  it('denies when repo is not connected to CodeKang', async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const result = await checkAutonomousFix('unknown', 'repo', 1);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('repo_not_connected');
    expect(mockComment).not.toHaveBeenCalled();
  });

  it('denies when repo is not installed (isInstalled=false)', async () => {
    mockQuery.mockResolvedValue(makeUserRow('pro', 0, false));

    const result = await checkAutonomousFix('acme', 'backend', 1);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('repo_not_installed');
  });

  it('denies when user account is not active', async () => {
    mockQuery.mockResolvedValue({
      rows: [{ ...makeUserRow('pro').rows[0], is_active: false }],
    });

    const result = await checkAutonomousFix('acme', 'backend', 1);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('user_inactive');
  });

  it('denies gracefully on DB error (fail-safe)', async () => {
    mockQuery.mockRejectedValue(new Error('DB connection failed'));

    const result = await checkAutonomousFix('acme', 'backend', 1);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('check_error');
  });

  it('resets credits and allows if monthly reset date has passed', async () => {
    // credits_reset in the past → should reset to 0
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            user_id: 'user-uuid-1',
            is_installed: true,
            plan: 'pro',
            credits_used: 1500,
            credits_reset: new Date(Date.now() - 86400000), // yesterday
            is_active: true,
          },
        ],
      })
      .mockResolvedValue({ rows: [] }); // UPDATE query

    const result = await checkAutonomousFix('acme', 'backend', 1);

    expect(result.allowed).toBe(true);
    expect(mockQuery).toHaveBeenCalledTimes(2); // SELECT + UPDATE
  });
});

// ─── checkPRReview ────────────────────────────────────────────────────────────

describe('checkPRReview', () => {
  beforeEach(() => jest.clearAllMocks());

  it('allows review for starter plan', async () => {
    mockQuery.mockResolvedValue(makeUserRow('starter', 10));

    const result = await checkPRReview('acme', 'backend');

    expect(result.allowed).toBe(true);
  });

  it('allows review for pro plan', async () => {
    mockQuery.mockResolvedValue(makeUserRow('pro', 50));

    const result = await checkPRReview('acme', 'backend');

    expect(result.allowed).toBe(true);
  });

  it('blocks review for free plan', async () => {
    mockQuery.mockResolvedValue(makeUserRow('free', 0));

    const result = await checkPRReview('acme', 'backend');

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('plan_limit');
  });

  it('blocks when repo not connected', async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const result = await checkPRReview('unknown', 'repo');

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('repo_not_connected');
  });

  it('blocks review when credits exhausted', async () => {
    mockQuery.mockResolvedValue(makeUserRow('starter', 400)); // all 400 used

    const result = await checkPRReview('acme', 'backend');

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('no_credits');
  });
});

// ─── consumeFixCredits / consumeReviewCredits ─────────────────────────────────

describe('consumeFixCredits', () => {
  beforeEach(() => jest.clearAllMocks());

  it('increments credits by 10 (fix cost)', async () => {
    mockQuery.mockResolvedValue({});

    await consumeFixCredits('user-uuid-1');

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users'),
      [10, 'user-uuid-1'],
    );
  });

  it('does not throw if DB update fails (non-blocking)', async () => {
    mockQuery.mockRejectedValue(new Error('DB error'));

    await expect(consumeFixCredits('user-uuid-1')).resolves.not.toThrow();
  });
});

describe('consumeReviewCredits', () => {
  beforeEach(() => jest.clearAllMocks());

  it('increments credits by 5 (review cost)', async () => {
    mockQuery.mockResolvedValue({});

    await consumeReviewCredits('user-uuid-1');

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users'),
      [5, 'user-uuid-1'],
    );
  });
});
