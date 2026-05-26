// Tests that executeApprovedFix marks the proposal as 'rejected' when the agent throws,
// preventing it from staying stuck in 'executing' forever.

jest.mock('../config/database', () => ({ db: { query: jest.fn() } }));
jest.mock('../config/env', () => ({
  env: {
    GITHUB_TOKEN: 'ghp_test',
    NODE_ENV: 'test',
    AGENT_MAX_STEPS: 10,
    AGENT_MAX_TOKENS: 4096,
    AGENT_TEMPERATURE: 0.3,
    ANTHROPIC_MODEL_AGENT: 'claude-sonnet-4-6',
    ANTHROPIC_API_KEY: 'test-key',
  },
}));
jest.mock('../repo/manager', () => ({
  setupRepo: jest.fn(),
  startDockerContainer: jest.fn(),
  installDependenciesOnHost: jest.fn().mockResolvedValue(''),
  installDependencies: jest.fn().mockResolvedValue(''),
  runTests: jest.fn(),
  stopAndRemoveContainer: jest.fn().mockResolvedValue(undefined),
  cleanupRepo: jest.fn(),
}));
jest.mock('../parser/analyzer', () => ({
  analyzeRepository: jest.fn().mockResolvedValue([]),
}));
jest.mock('../vector/indexer', () => ({
  indexRepository: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../agent/classifier', () => ({ classifyIssue: jest.fn() }));
jest.mock('../agent/index', () => ({ runAgent: jest.fn() }));
jest.mock('./pr-service', () => ({ createPullRequestForFix: jest.fn() }));
jest.mock('./comment-service', () => ({
  postFixComment: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('./guidance-service', () => ({
  postGuidanceResponse: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('./proposal-service', () => ({
  extractStructuredProposal: jest.fn(),
  loadPendingProposal: jest.fn(),
  markProposalStatus: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('./learning-service', () => ({
  recordSuccessfulFix: jest.fn().mockResolvedValue(undefined),
  findSimilarFixes: jest.fn().mockResolvedValue([]),
  buildLearningContext: jest.fn().mockReturnValue(''),
}));
jest.mock('../github/api', () => ({
  getInstallationToken: jest.fn().mockResolvedValue('token-123'),
  createIssueComment: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../utils/helper', () => ({
  generateBranchName: jest.fn().mockReturnValue('fix/issue-1'),
}));
jest.mock('../guards/plan-check', () => ({
  checkAutonomousFix: jest.fn(),
  consumeFixCredits: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { db } from '../config/database';
import {
  setupRepo,
  startDockerContainer,
  installDependencies,
} from '../repo/manager';
import { runAgent } from '../agent/index';
import { loadPendingProposal, markProposalStatus } from './proposal-service';
import { checkAutonomousFix } from '../guards/plan-check';
import { executeApprovedFix } from './fix-service';

const mockDb = db as unknown as { query: jest.Mock };
const mockSetupRepo = setupRepo as jest.Mock;
const mockStartDocker = startDockerContainer as jest.Mock;
const mockInstallDeps = installDependencies as jest.Mock;
const mockRunAgent = runAgent as jest.Mock;
const mockLoadPending = loadPendingProposal as jest.Mock;
const mockMarkStatus = markProposalStatus as jest.Mock;
const mockPlanCheck = checkAutonomousFix as jest.Mock;

const PENDING_PROPOSAL = {
  id: 42,
  owner: 'acme',
  repo: 'backend',
  issueNumber: 1,
  issueTitle: 'Bug: crash on login',
  issueBody: 'App crashes when logging in',
  installationId: 12345,
  category: 'bug',
  strategy: 'targeted_fix',
  confidence: 0.9,
  complexity: 'medium',
  needsEnvironment: true,
  analysis: 'Root cause found in auth.ts',
};

function setupHappyPath() {
  mockPlanCheck.mockResolvedValue({ allowed: true, userId: 'user-1' });
  mockLoadPending.mockResolvedValue(PENDING_PROPOSAL);
  mockDb.query.mockResolvedValue({ rows: [{ id: 99 }] });
  mockSetupRepo.mockResolvedValue({ repoPath: '/tmp/repo-test' });
  mockStartDocker.mockResolvedValue('container-xyz');
  mockInstallDeps.mockResolvedValue('');
}

describe('executeApprovedFix — proposal stuck state fix', () => {
  beforeEach(() => jest.clearAllMocks());

  it('marks proposal as rejected when runAgent throws', async () => {
    setupHappyPath();
    mockRunAgent.mockRejectedValue(new Error('Claude API unavailable'));

    const result = await executeApprovedFix({
      owner: 'acme',
      repo: 'backend',
      issueNumber: 1,
      installationId: 12345,
    } as any);

    expect(result.success).toBe(false);

    // Must have been marked 'executing' first
    expect(mockMarkStatus).toHaveBeenCalledWith(42, 'executing');
    // Then must be marked 'rejected' in the catch block — prevents stuck state
    expect(mockMarkStatus).toHaveBeenCalledWith(42, 'rejected');
  });

  it('marks proposal as rejected when Docker setup throws', async () => {
    setupHappyPath();
    mockStartDocker.mockRejectedValue(new Error('Docker daemon not running'));

    const result = await executeApprovedFix({
      owner: 'acme',
      repo: 'backend',
      issueNumber: 1,
      installationId: 12345,
    } as any);

    expect(result.success).toBe(false);
    expect(mockMarkStatus).toHaveBeenCalledWith(42, 'executing');
    expect(mockMarkStatus).toHaveBeenCalledWith(42, 'rejected');
  });

  it('does NOT mark rejected if no proposal was loaded (nothing to unstick)', async () => {
    mockPlanCheck.mockResolvedValue({ allowed: true, userId: 'user-1' });
    mockLoadPending.mockResolvedValue(null); // no pending proposal

    const result = await executeApprovedFix({
      owner: 'acme',
      repo: 'backend',
      issueNumber: 999,
      installationId: 12345,
    } as any);

    expect(result.success).toBe(false);
    expect(result.message).toContain('No pending proposal');
    // markProposalStatus should never have been called
    expect(mockMarkStatus).not.toHaveBeenCalled();
  });

  it('marks proposal done on successful fix', async () => {
    setupHappyPath();
    mockRunAgent.mockResolvedValue({
      success: true,
      filesModified: ['src/auth.ts'],
      summary: 'Fixed null check in login',
      steps: [],
      totalCost: 0.05,
    });
    // runTests passes
    const { runTests } = require('../repo/manager');
    (runTests as jest.Mock).mockResolvedValue({ output: 'PASS', passed: true });
    // createPullRequestForFix returns a PR
    const { createPullRequestForFix } = require('./pr-service');
    (createPullRequestForFix as jest.Mock).mockResolvedValue({
      html_url: 'https://github.com/acme/backend/pull/5',
    });

    const result = await executeApprovedFix({
      owner: 'acme',
      repo: 'backend',
      issueNumber: 1,
      installationId: 12345,
    } as any);

    expect(result.success).toBe(true);
    expect(mockMarkStatus).toHaveBeenCalledWith(42, 'executing');
    expect(mockMarkStatus).toHaveBeenCalledWith(42, 'done');
    // rejected should NOT have been called
    const calls = mockMarkStatus.mock.calls.map((c: any[]) => c[1]);
    expect(calls).not.toContain('rejected');
  });
});
