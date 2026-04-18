import { db, toVector } from '../config/database';
import { logger } from '../utils/logger';
import { chunkRepository } from './chunker';
import { generateBatchEmbeddings } from './embeddings';
import type { ParsedFile } from '../parser/analyzer';
import type { IndexingStats } from '../types/vector';
import { chunkArray } from '../utils/helper';
import { IndexingError } from '../utils/errors';

// ─── Bulk-insert config ───────────────────────────────────────────────────────
// pg max parameters = 65535, 10 columns → max 6553 rows/batch. 500 is safe.
const INSERT_BATCH = 500;
// How many INSERT batches to run in parallel against Postgres.
// 4 is safe for a default pg pool of 10 connections.
const INSERT_PARALLEL = 4;

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function indexRepository(
  repoId: number,
  files: ParsedFile[],
): Promise<IndexingStats> {
  const startedAt = Date.now();

  // Drop stale chunks for this repo
  await db.query('DELETE FROM code_chunks WHERE repo_id = $1', [repoId]);

  const chunks = chunkRepository(files, repoId);
  logger.info('Chunks created', {
    repoId,
    files: files.length,
    chunks: chunks.length,
    byType: countByType(chunks),
  });

  if (chunks.length === 0) {
    return buildStats(repoId, files.length, 0, startedAt);
  }

  // ── Generate embeddings ────────────────────────────────────────────────────
  // We embed the enriched embedText (path + symbol + content), not raw content,
  // for much better retrieval quality.
  const embedTexts = chunks.map((c) => c.embedText);
  let embeddings: number[][];

  try {
    embeddings = await generateBatchEmbeddings(embedTexts);
  } catch (err: unknown) {
    const e = err as { message: string };
    throw new IndexingError(`Embedding generation failed: ${e.message}`);
  }

  if (embeddings.length !== chunks.length) {
    throw new IndexingError(
      `Embedding count mismatch: got ${embeddings.length}, expected ${chunks.length}`,
    );
  }

  // ── Bulk insert in parallel batches ──────────────────────────────────────
  let inserted = 0;
  const batches = chunkArray(
    chunks.map((c, i) => ({ chunk: c, embedding: embeddings[i] })),
    INSERT_BATCH,
  );

  for (let i = 0; i < batches.length; i += INSERT_PARALLEL) {
    const group = batches.slice(i, i + INSERT_PARALLEL);
    await Promise.all(group.map((b) => bulkInsert(repoId, b)));
    inserted += group.reduce((s, b) => s + b.length, 0);
    logger.debug('Insert progress', { inserted, total: chunks.length });
  }

  logger.info('Indexing complete', {
    repoId,
    files: files.length,
    chunks: inserted,
    durationMs: Date.now() - startedAt,
  });

  return buildStats(repoId, files.length, inserted, startedAt);
}

// ─── Bulk INSERT using multi-row VALUES ───────────────────────────────────────
// Drastically faster than N individual INSERTs.
// Also populates the `fts` tsvector column inline.

async function bulkInsert(
  repoId: number,
  batch: Array<{ chunk: import('./chunker').RawChunk; embedding: number[] }>,
): Promise<void> {
  const COLS = 10; // number of params per row
  const valueClauses: string[] = [];
  const params: unknown[] = [];

  batch.forEach(({ chunk, embedding }, i) => {
    const base = i * COLS;
    valueClauses.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, ` +
        `$${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, ` +
        `$${base + 10}::vector)`,
    );
    params.push(
      repoId, // $1 repo_id
      chunk.filePath, // $2 file_path
      chunk.startLine, // $3 start_line
      chunk.endLine, // $4 end_line
      chunk.content, // $5 content
      chunk.language, // $6 language
      chunk.tokenCount, // $7 token_count
      chunk.chunkType, // $8 chunk_type
      chunk.symbolName ?? null, // $9 symbol_name
      toVector(embedding), // $10 embedding
    );
  });

  await db.query(
    `INSERT INTO code_chunks
       (repo_id, file_path, start_line, end_line, content,
        language, token_count, chunk_type, symbol_name, embedding)
     VALUES ${valueClauses.join(',')}`,
    params,
  );

  // Update fts in a single UPDATE — faster than computing per-row at insert time
  // because we can reference the just-inserted rows via a CTE or a simple range.
  // For simplicity we batch-update by the rows we just inserted.
  await db.query(
    `UPDATE code_chunks
     SET fts = to_tsvector('english',
       COALESCE(symbol_name,'') || ' ' || content)
     WHERE repo_id = $1
       AND fts IS NULL`,
    [repoId],
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildStats(
  repoId: number,
  totalFiles: number,
  totalChunks: number,
  startedAt: number,
): IndexingStats {
  return {
    repoId: String(repoId),
    totalFiles,
    skippedFiles: 0,
    totalChunks,
    durationMs: Date.now() - startedAt,
    completedAt: new Date().toISOString(),
  };
}

function countByType(
  chunks: import('./chunker').RawChunk[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of chunks) counts[c.chunkType] = (counts[c.chunkType] ?? 0) + 1;
  return counts;
}
