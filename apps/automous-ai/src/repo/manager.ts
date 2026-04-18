import fs from 'fs';
import path from 'path';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { cloneRepo } from './git';
import { sanitizeFilename } from '../utils/helper';
import { DockerError } from '../utils/errors';

const execAsync = promisify(execCallback);

// ─── Active container registry ────────────────────────────────────────────────
// Tracks every container started in this process so shutdown can wipe them all.

const activeContainers = new Set<string>();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RepoContext {
  repoPath: string;
  owner: string;
  repo: string;
  containerId?: string;
}

// ─── Repository setup ─────────────────────────────────────────────────────────

export async function setupRepo(
  owner: string,
  repo: string,
  cloneUrl: string,
  token: string,
): Promise<RepoContext> {
  const dirName = sanitizeFilename(`${owner}-${repo}-${Date.now()}`);
  const repoPath = path.join(env.TEMP_REPOS_DIR, dirName);

  fs.mkdirSync(repoPath, { recursive: true });
  await cloneRepo(cloneUrl, repoPath, token);

  logger.info('Repo ready', { repoPath });
  return { repoPath, owner, repo };
}

// ─── Docker container management ─────────────────────────────────────────────

export async function startDockerContainer(ctx: RepoContext): Promise<string> {
  const { repoPath, owner, repo } = ctx;
  const name = sanitizeFilename(`codekang-${owner}-${repo}-${Date.now()}`);
  const image = detectDockerImage(repoPath);

  try {
    const { stdout } = await execAsync(
      `docker run -d --rm --name ${name} ` +
        `-v "${repoPath}":/workspace -w /workspace ` +
        `--network=none --memory=512m --cpus=1 ` +
        `${image} tail -f /dev/null`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
    );
    const id = stdout.trim();
    activeContainers.add(id);
    logger.info('Docker container started', { name, id });
    return id;
  } catch (err: unknown) {
    const e = err as { message: string };
    throw new DockerError(`Failed to start container: ${e.message}`);
  }
}

export async function runInContainer(
  containerId: string,
  command: string,
): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(
      `docker exec ${containerId} sh -c ${JSON.stringify(command)}`,
      { encoding: 'utf8', timeout: 10 * 60_000, maxBuffer: 20 * 1024 * 1024 },
    );
    return `${stdout ?? ''}${stderr ?? ''}`;
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message: string };
    return (e.stdout ?? '') + (e.stderr ?? e.message);
  }
}

// Install dependencies on the host before the container starts so that
// node_modules (or equivalent) is present in the mounted volume.
// The container runs with --network=none for security, so this must happen first.
export async function installDependenciesOnHost(
  repoPath: string,
): Promise<string> {
  const pm = detectPackageManager(repoPath);
  const cmd =
    pm === 'yarn'
      ? 'yarn install --frozen-lockfile 2>&1 || yarn install 2>&1'
      : pm === 'pnpm'
        ? 'pnpm install --frozen-lockfile 2>&1 || pnpm install 2>&1'
        : 'npm install 2>&1';
  logger.info('Installing dependencies on host', { pm, repoPath });
  try {
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: repoPath,
      encoding: 'utf8',
      timeout: 3 * 60_000,
      maxBuffer: 10 * 1024 * 1024,
    });
    return `${stdout ?? ''}${stderr ?? ''}`;
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message: string };
    return (e.stdout ?? '') + (e.stderr ?? e.message);
  }
}

export async function installDependencies(
  containerId: string,
  repoPath: string,
): Promise<string> {
  const pm = detectPackageManager(repoPath);
  // node_modules should already exist from installDependenciesOnHost; this
  // verifies / installs any packages the host might have missed (e.g. optional
  // native modules that need the container's libc).
  const cmd =
    pm === 'yarn'
      ? 'yarn install --frozen-lockfile 2>&1 || yarn install 2>&1'
      : pm === 'pnpm'
        ? 'pnpm install --frozen-lockfile 2>&1 || pnpm install 2>&1'
        : 'npm install 2>&1';
  logger.info('Verifying dependencies inside container', { pm });
  return await runInContainer(containerId, cmd);
}

export async function runTests(
  containerId: string,
  repoPath: string,
): Promise<{ output: string; passed: boolean }> {
  const pm = detectPackageManager(repoPath);
  const cmd =
    pm === 'yarn'
      ? 'yarn test --passWithNoTests 2>&1 || true'
      : pm === 'pnpm'
        ? 'pnpm test --passWithNoTests 2>&1 || true'
        : 'npm test -- --passWithNoTests 2>&1 || true';

  const output = await runInContainer(containerId, cmd);
  // Heuristic: look for common failure signatures across Jest, Mocha, Vitest, pytest
  const failPatterns = [
    ' FAIL ', // Jest
    'Tests failed', // generic
    'FAILED', // pytest / Rust
    'npm ERR!', // npm script error
    'AssertionError', // Node assert / chai
    '× ', // Vitest failed test marker
  ];
  const passed = !failPatterns.some((p) => output.includes(p));
  return { output, passed };
}

export async function stopAndRemoveContainer(
  containerId: string,
): Promise<void> {
  try {
    // --rm on docker run means the container auto-removes when stopped.
    // `docker rm -f` is a no-op on already-removed containers but acts as a
    // safety net for any container started without --rm.
    await execAsync(
      `docker stop ${containerId} 2>/dev/null; docker rm -f ${containerId} 2>/dev/null; true`,
      {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
      },
    );
    activeContainers.delete(containerId);
    logger.info('Container removed', { containerId });
  } catch {
    // ignore cleanup failures
  }
}

// Stop and remove every codekang container — both in-process tracked ones and
// any docker-level orphans left from a previous crash.
// Safe to call on startup, shutdown, and signal handlers.
export async function cleanupAllContainers(): Promise<void> {
  // 1. Kill every container this process started (fast path)
  const tracked = [...activeContainers];
  if (tracked.length > 0) {
    try {
      await execAsync(`docker rm -f ${tracked.join(' ')} 2>/dev/null; true`, {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
      });
      tracked.forEach((id) => activeContainers.delete(id));
    } catch {
      /* ignore */
    }
  }

  // 2. Also sweep Docker for any codekang-* containers not in our registry
  //    (orphans from a previous crash or a parallel process)
  try {
    const { stdout } = await execAsync(
      `docker ps -aq --filter "name=codekang-" 2>/dev/null`,
      { encoding: 'utf8', maxBuffer: 1024 * 1024 },
    );
    const orphans = stdout.trim().split('\n').filter(Boolean);
    if (orphans.length > 0) {
      await execAsync(`docker rm -f ${orphans.join(' ')} 2>/dev/null; true`, {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
      });
    }
    const total = tracked.length + orphans.length;
    if (total > 0) logger.info('All codekang containers cleaned up', { total });
  } catch {
    // non-fatal — Docker may not be available in all environments
  }
}

export function cleanupRepo(repoPath: string): void {
  try {
    fs.rmSync(repoPath, { recursive: true, force: true });
    logger.info('Repo cleaned up', { repoPath });
  } catch {
    // ignore
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectPackageManager(repoPath: string): 'npm' | 'yarn' | 'pnpm' {
  if (fs.existsSync(path.join(repoPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(repoPath, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

function detectDockerImage(repoPath: string): string {
  if (fs.existsSync(path.join(repoPath, 'package.json')))
    return 'node:22-alpine';
  if (fs.existsSync(path.join(repoPath, 'requirements.txt')))
    return 'python:3.12-slim';
  if (fs.existsSync(path.join(repoPath, 'go.mod'))) return 'golang:1.22-alpine';
  if (fs.existsSync(path.join(repoPath, 'Cargo.toml'))) return 'rust:1.77-slim';
  return 'ubuntu:22.04';
}
