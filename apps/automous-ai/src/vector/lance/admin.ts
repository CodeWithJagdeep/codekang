import { openTable, TABLE } from './tables';
import { db } from '../../config/database';
import { logger } from '../../utils/logger';

// ─── Delete all LanceDB embeddings for a repo ─────────────────────────────────
// Call this when a user requests data deletion (GDPR right to erasure).
// Also deletes the repo record from Postgres so repoId is freed.

export async function deleteRepoEmbeddings(
  owner: string,
  repoName: string,
): Promise<void> {
  // Look up repoId
  const { rows } = await db.query<{ id: number }>(
    `SELECT id FROM repos WHERE full_name = $1`,
    [`${owner}/${repoName}`],
  );

  if (!rows[0]) {
    logger.info('deleteRepoEmbeddings: repo not found', { owner, repoName });
    return;
  }

  const repoId = rows[0].id;

  // Delete from all 5 LanceDB tables in parallel
  const tables = [
    TABLE.CODE,
    TABLE.PR,
    TABLE.ISSUE,
    TABLE.STANDARDS,
    TABLE.CHAT,
  ];

  await Promise.allSettled(
    tables.map(async (tableName) => {
      try {
        const tbl = await openTable(tableName);
        const count = await tbl.countRows();
        if (count === 0) return;
        await tbl.delete(`repo_id = ${repoId}`);
        logger.debug('Lance table cleared', { table: tableName, repoId });
      } catch (err) {
        logger.warn('Lance table delete failed', {
          table: tableName,
          error: (err as Error).message,
        });
      }
    }),
  );

  // Remove relational data (cascades to fix_jobs via FK)
  await db.query(`DELETE FROM repos WHERE id = $1`, [repoId]);

  logger.info('Repo embeddings deleted', {
    owner,
    repoName,
    repoId,
    tables: tables.length,
  });
}

// ─── Compact a table after many deletes (reclaim disk space) ─────────────────

export async function compactTable(tableName: string): Promise<void> {
  try {
    const tbl = await openTable(tableName);
    await tbl.optimize();
    logger.info('LanceDB table compacted', { table: tableName });
  } catch (err) {
    logger.warn('LanceDB compact failed', {
      table: tableName,
      error: (err as Error).message,
    });
  }
}
