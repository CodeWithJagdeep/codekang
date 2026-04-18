import { db } from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { setupRepo, cleanupRepo } from '../repo/manager';
import { analyzeRepository } from '../parser/analyzer';
import { indexRepository } from '../vector/indexer';
import { getInstallationToken } from '../github/api';
import type { IndexJobData, JobResult } from '../types/queue';

// ─── BullMQ job handler ───────────────────────────────────────────────────────

export async function indexRepoJob(data: IndexJobData): Promise<JobResult> {
  const { owner, repo, installationId } = data;
  logger.info('Indexing repo', { owner, repo });

  let repoPath: string | undefined;

  try {
    const token = installationId
      ? await getInstallationToken(installationId)
      : env.GITHUB_TOKEN;

    const cloneUrl = `https://github.com/${owner}/${repo}.git`;
    const ctx = await setupRepo(owner, repo, cloneUrl, token);
    repoPath = ctx.repoPath;

    // Upsert repo record
    const { rows } = await db.query<{ id: number }>(
      `INSERT INTO repos (owner, name, full_name, default_branch)
       VALUES ($1, $2, $3, 'main')
       ON CONFLICT (full_name)
       DO UPDATE SET indexed_at = NOW()
       RETURNING id`,
      [owner, repo, `${owner}/${repo}`],
    );
    const repoId = rows[0].id;

    const files = await analyzeRepository(repoPath);
    const stats = await indexRepository(repoId, files);

    logger.info('Repo indexed', { owner, repo, ...stats });

    return {
      success: true,
      message: `Indexed ${stats.totalFiles} files → ${stats.totalChunks} chunks in ${stats.durationMs}ms`,
      data: stats as unknown as Record<string, unknown>,
    };
  } catch (err: unknown) {
    const e = err as { message: string };
    logger.error('Index job failed', { owner, repo, error: e.message });
    return { success: false, message: e.message };
  } finally {
    if (repoPath && env.CLEANUP_TEMP_FILES_AFTER_DAYS === 0) {
      cleanupRepo(repoPath);
    }
  }
}
