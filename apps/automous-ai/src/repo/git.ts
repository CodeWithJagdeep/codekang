import { execSync } from 'child_process';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import { promises as fs } from 'fs';
import { logger } from '../utils/logger';
import { GitError } from '../utils/errors';

const execAsync = promisify(execCallback);

// ─── Low-level git wrapper ────────────────────────────────────────────────────

export function execGit(args: string[], cwd: string): string {
  // Use JSON.stringify for each arg so spaces, quotes, and special chars are
  // properly shell-escaped (JSON.stringify wraps in "" with backslash escapes).
  const safeArgs = args.map((a) => JSON.stringify(a));
  try {
    return execSync(`git ${safeArgs.join(' ')}`, {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (err: unknown) {
    const e = err as { stderr?: string; message: string };
    throw new GitError(`git ${args[0]} failed: ${e.stderr ?? e.message}`);
  }
}

// ─── Clone ────────────────────────────────────────────────────────────────────

export async function cloneRepo(
  cloneUrl: string,
  destPath: string,
  token: string,
): Promise<void> {
  // If testing with public repos anonymously, just use the raw URL
  if (token === 'public' || token === 'public_repo') {
    logger.info('🌍 [PUBLIC MODE] Cloning public repository anonymously.', {
      destPath,
      cloneUrl,
    });
    try {
      await execAsync(`git clone --depth 1 "${cloneUrl}" "${destPath}"`);
      return;
    } catch (err: unknown) {
      const e = err as { stderr?: string; message: string };
      throw new GitError(`Public clone failed: ${e.stderr ?? e.message}`);
    }
  }

  // If testing with fake tokens, skip GitHub API and just copy your local folder so the AI has code to read!
  if (token.includes('xxxx')) {
    logger.info(
      '🧪 [TEST MODE] Bypassed GitHub Clone. Copying local demo folder so AI can work.',
      { destPath },
    );
    try {
      // cleanly copy the demo playground directory to mimic a fresh git clone using native fs
      await fs.cp(`${process.cwd()}/demo`, destPath, {
        recursive: true,
        filter: (src) => !src.match(/node_modules|\.git|dist|build/),
      });
      // Since it's not a git repo anymore, initialize a fresh one just to keep Git tools happy
      await execAsync(`git init`, { cwd: destPath });
      await execAsync(
        `git config user.email "test@codekang" && git config user.name "test"`,
        { cwd: destPath },
      );
      await execAsync(`git add -A && git commit -m "init"`, { cwd: destPath });
      return;
    } catch (err) {
      throw new GitError(`Local test copy failed: ${err}`);
    }
  }

  // Inject token for HTTPS auth for private repos
  const authUrl = cloneUrl.replace(
    'https://',
    `https://x-access-token:${token}@`,
  );
  try {
    await execAsync(`git clone --depth 1 "${authUrl}" "${destPath}"`);
    logger.info('Repo cloned', { destPath });
  } catch (err: unknown) {
    const e = err as { stderr?: string; message: string };
    throw new GitError(`Clone failed: ${e.stderr ?? e.message}`);
  }
}

// ─── Branch management ────────────────────────────────────────────────────────

export function createBranch(
  repoPath: string,
  branchName: string,
  baseBranch: string,
): void {
  try {
    execGit(['fetch', 'origin', baseBranch], repoPath);
  } catch {
    // no remote – just branch from HEAD
  }
  execGit(['checkout', '-b', branchName], repoPath);
  logger.info('Branch created', { branchName });
}

// ─── Staging & committing ─────────────────────────────────────────────────────

export function stageAll(repoPath: string): void {
  execGit(['add', '-A'], repoPath);
}

export function commit(repoPath: string, message: string): void {
  execGit(['config', 'user.email', 'codekang-bot@codekang.app'], repoPath);
  execGit(['config', 'user.name', 'CodeKang Bot'], repoPath);
  execGit(['commit', '-m', message], repoPath);
}

export function pushBranch(repoPath: string, branchName: string): void {
  execGit(['push', 'origin', branchName], repoPath);
  logger.info('Branch pushed', { branchName });
}

export function rebaseOnMain(repoPath: string, baseBranch: string): void {
  try {
    execGit(['fetch', 'origin', baseBranch], repoPath);
    execGit(['rebase', `origin/${baseBranch}`], repoPath);
    logger.info('Rebased on base branch', { baseBranch });
  } catch (err) {
    // Abort partial rebase so the repo is left in a clean state
    try {
      execGit(['rebase', '--abort'], repoPath);
    } catch {
      /* ignore */
    }
    throw err;
  }
}

export function pushBranchWithRetry(
  repoPath: string,
  branchName: string,
  baseBranch: string,
): void {
  try {
    pushBranch(repoPath, branchName);
  } catch (pushErr: unknown) {
    const msg = (pushErr as { message: string }).message ?? '';
    // Only retry on rejection errors (conflict / non-fast-forward)
    if (!msg.includes('rejected') && !msg.includes('non-fast-forward'))
      throw pushErr;
    logger.warn('Push rejected — rebasing on base and retrying', {
      branchName,
      baseBranch,
    });
    rebaseOnMain(repoPath, baseBranch);
    pushBranch(repoPath, branchName);
  }
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export function hasChanges(repoPath: string): boolean {
  const output = execGit(['status', '--porcelain'], repoPath);
  return output.trim().length > 0;
}

export function getDiff(repoPath: string): string {
  return execGit(['diff'], repoPath);
}
