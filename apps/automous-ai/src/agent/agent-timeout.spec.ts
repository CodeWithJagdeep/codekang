// Tests that the per-step Claude API timeout fires when the API hangs.
// Uses jest fake timers so we don't actually wait 5 minutes.

jest.mock('../config/env', () => ({
  env: {
    ANTHROPIC_API_KEY: 'test-key',
    ANTHROPIC_MODEL_AGENT: 'claude-sonnet-4-6',
    AGENT_MAX_STEPS: 5,
    AGENT_MAX_TOKENS: 4096,
    AGENT_TEMPERATURE: 0.3,
  },
}));

// Capture the mock so we can control what create() does per test
const mockCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: { create: mockCreate },
    })),
  };
});

jest.mock('./tools', () => ({
  getActiveTools: jest.fn().mockReturnValue([]),
  executeTool: jest.fn(),
  closeBrowserSession: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../config/ai/index', () => ({
  getCostStats: jest.fn().mockReturnValue({ totalCostUsd: 0 }),
  resetFixCost: jest.fn(),
}));
jest.mock('../config/observability', () => ({
  createAgentTrace: jest.fn().mockReturnValue({
    startGeneration: jest.fn().mockReturnValue({ end: jest.fn() }),
    startSpan: jest.fn().mockReturnValue({ end: jest.fn() }),
    setOutput: jest.fn(),
    setMetadata: jest.fn(),
    flush: jest.fn().mockResolvedValue(undefined),
  }),
}));
jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { runAgent } from './index';

const FIVE_MINUTES = 5 * 60 * 1000;

const fixContext = {
  issueNumber: 1,
  issueTitle: 'Test issue',
  issueBody: 'Something is broken',
  repoOwner: 'acme',
  repoName: 'backend',
  branchName: 'fix/issue-1',
  classification: {
    category: 'bug',
    strategy: 'targeted_fix',
    confidence: 0.9,
    reasoning: '',
    isActionable: true,
    estimatedComplexity: 'low',
    needsEnvironment: false,
    responseType: 'fix' as const,
  },
};

const toolContext = {
  owner: 'acme',
  repo: 'backend',
  token: 'ghp_test',
  defaultBranch: 'main',
  cloneReady: false,
  sandboxReady: false,
};

describe('runAgent — per-step timeout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fails with timeout error when Claude API hangs past STEP_TIMEOUT_MS', async () => {
    // messages.create never resolves — simulates a hung API call
    mockCreate.mockImplementation(() => new Promise(() => {}));

    const resultPromise = runAgent(fixContext as any, toolContext as any, 'fix');

    // Advance past the 5-minute step timeout
    jest.advanceTimersByTime(FIVE_MINUTES + 100);

    // Flush microtasks so Promise.race resolves
    await Promise.resolve();
    await Promise.resolve();

    const result = await resultPromise;

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/timed out/i);
  });

  it('succeeds normally when Claude API responds before timeout', async () => {
    // messages.create returns a valid end_turn response immediately
    mockCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Fix applied.' }],
      usage: { input_tokens: 100, output_tokens: 50 },
    });

    const resultPromise = runAgent(fixContext as any, toolContext as any, 'fix');

    // Don't advance time — should complete on its own
    const result = await resultPromise;

    expect(result.error).toBeUndefined();
  });
});
