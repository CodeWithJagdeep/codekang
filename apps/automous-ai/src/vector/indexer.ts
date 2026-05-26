import { indexCodeInLance } from './lance/code-indexer';
import { indexStandardsWithFallback } from './lance/standards-indexer';
import { logger } from '../utils/logger';
import type { ParsedFile } from '../parser/analyzer';
import type { IndexingStats } from '../types/vector';

export async function indexRepository(
  repoId: number,
  files: ParsedFile[],
  options: { owner?: string; repoName?: string; repoPath?: string } = {},
): Promise<IndexingStats> {
  const { owner = '', repoName = '', repoPath } = options;

  const stats = await indexCodeInLance(repoId, owner, repoName, files);

  // Index standards (with fallback to past fixes if no standards files exist)
  if (repoPath && owner && repoName) {
    await indexStandardsWithFallback(repoId, owner, repoName, repoPath).catch(
      (err: Error) =>
        logger.warn('Standards indexing failed (non-fatal)', {
          error: err.message,
        }),
    );
  }

  return stats;
}
