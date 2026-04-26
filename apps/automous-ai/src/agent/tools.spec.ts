// Unit tests for executeTool — specifically the run_command workdir validation fix.
// All external I/O is mocked so no DB, Docker, or GitHub calls happen.

jest.mock('../repo/manager', () => ({
  runInContainer: jest.fn().mockResolvedValue('command output'),
}));
jest.mock('../vector/search', () => ({
  searchSimilarCode: jest.fn().mockResolvedValue([]),
  searchByFilePath: jest.fn().mockResolvedValue([]),
  searchBySymbol: jest.fn().mockResolvedValue([]),
}));
jest.mock('../browser/playwright', () => ({
  createPage: jest.fn(),
}));
jest.mock('../github/api', () => ({
  createIssueComment: jest.fn().mockResolvedValue(undefined),
  createPullRequest: jest.fn(),
  githubListDir: jest.fn().mockResolvedValue([]),
  githubGetTree: jest.fn().mockResolvedValue(''),
  githubSearchCode: jest.fn().mockResolvedValue([]),
  githubCreateBranch: jest.fn().mockResolvedValue(undefined),
  githubCommitFiles: jest.fn().mockResolvedValue({ url: 'https://github.com/commit/abc' }),
  getFileContent: jest.fn().mockResolvedValue(null),
}));
jest.mock('../services/pr-service', () => ({
  createPullRequestForFix: jest.fn(),
}));
jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { executeTool } from './tools';
import { runInContainer } from '../repo/manager';

const mockRunInContainer = runInContainer as jest.Mock;

function makeCtx(overrides = {}) {
  return {
    owner: 'acme',
    repo: 'backend',
    token: 'ghp_test',
    defaultBranch: 'main',
    cloneReady: true,
    sandboxReady: true,
    containerId: 'container-abc123',
    ...overrides,
  };
}

// ─── run_command ──────────────────────────────────────────────────────────────

describe('run_command', () => {
  beforeEach(() => jest.clearAllMocks());

  it('blocks workdir with .. (path traversal)', async () => {
    const { result } = await executeTool(
      'run_command',
      { command: 'cat /etc/passwd', workdir: '../../etc' },
      makeCtx() as any,
    );

    expect(result.output).toContain('path traversal not allowed');
    expect(mockRunInContainer).not.toHaveBeenCalled();
  });

  it('blocks nested .. traversal', async () => {
    const { result } = await executeTool(
      'run_command',
      { command: 'ls', workdir: '/workspace/../../../root' },
      makeCtx() as any,
    );

    expect(result.output).toContain('path traversal not allowed');
    expect(mockRunInContainer).not.toHaveBeenCalled();
  });

  it('allows /workspace workdir', async () => {
    await executeTool(
      'run_command',
      { command: 'npm test', workdir: '/workspace' },
      makeCtx() as any,
    );

    expect(mockRunInContainer).toHaveBeenCalledWith(
      'container-abc123',
      'cd /workspace && npm test',
    );
  });

  it('allows /workspace/src workdir', async () => {
    await executeTool(
      'run_command',
      { command: 'ls', workdir: '/workspace/src' },
      makeCtx() as any,
    );

    expect(mockRunInContainer).toHaveBeenCalledWith(
      'container-abc123',
      'cd /workspace/src && ls',
    );
  });

  it('defaults workdir to /workspace when not provided', async () => {
    await executeTool(
      'run_command',
      { command: 'npm run build' },
      makeCtx() as any,
    );

    expect(mockRunInContainer).toHaveBeenCalledWith(
      'container-abc123',
      'cd /workspace && npm run build',
    );
  });

  it('returns error when no containerId (no sandbox)', async () => {
    const { result } = await executeTool(
      'run_command',
      { command: 'ls' },
      makeCtx({ containerId: undefined, sandboxReady: false }) as any,
    );

    expect(result.output).toContain('request_sandbox');
    expect(mockRunInContainer).not.toHaveBeenCalled();
  });
});
