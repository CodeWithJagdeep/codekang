import { openTable, deleteByRepo, tryCreateVectorIndex, TABLE } from './tables';
import { generateBatchEmbeddings } from '../embeddings';
import { chunkRepository } from '../chunker';
import { logger } from '../../utils/logger';
import { chunkArray } from '../../utils/helper';
import { IndexingError } from '../../utils/errors';
import type { ParsedFile } from '../../parser/analyzer';
import type { IndexingStats } from '../../types/vector';

// ─── Batch config ─────────────────────────────────────────────────────────────
const INSERT_BATCH = 1000;
const INSERT_PARALLEL = 4;

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function indexCodeInLance(
  repoId: number,
  owner: string,
  repoName: string,
  files: ParsedFile[],
): Promise<IndexingStats> {
  const startedAt = Date.now();

  await deleteByRepo(TABLE.CODE, repoId);

  const chunks = chunkRepository(files, repoId);
  logger.info('Lance code chunks created', {
    repoId,
    files: files.length,
    chunks: chunks.length,
  });

  if (chunks.length === 0)
    return buildStats(repoId, files.length, 0, startedAt);

  const embedTexts = chunks.map((c) => c.embedText);
  let embeddings: number[][];

  try {
    embeddings = await generateBatchEmbeddings(embedTexts);
  } catch (err: unknown) {
    throw new IndexingError(`Embedding failed: ${(err as Error).message}`);
  }

  if (embeddings.length !== chunks.length) {
    throw new IndexingError(
      `Embedding mismatch: ${embeddings.length} vs ${chunks.length}`,
    );
  }

  const tbl = await openTable(TABLE.CODE);
  const batches = chunkArray(
    chunks.map((c, i) => ({ chunk: c, embedding: embeddings[i] })),
    INSERT_BATCH,
  );

  let inserted = 0;
  for (let i = 0; i < batches.length; i += INSERT_PARALLEL) {
    const group = batches.slice(i, i + INSERT_PARALLEL);
    await Promise.all(
      group.map(async (batch) => {
        const records = batch.map(({ chunk, embedding }) => ({
          id: `${repoId}:${chunk.filePath}:${chunk.startLine}`,
          repo_id: repoId,
          owner,
          repo_name: repoName,
          file_path: chunk.filePath,
          start_line: chunk.startLine,
          end_line: chunk.endLine,
          content: chunk.content,
          language: chunk.language,
          token_count: chunk.tokenCount,
          chunk_type: chunk.chunkType,
          symbol_name: chunk.symbolName ?? '',
          vector: embedding,
        }));
        await tbl.add(records);
      }),
    );
    inserted += group.reduce((s, b) => s + b.length, 0);
  }

  // Best-effort: create ANN index when enough rows exist
  await tryCreateVectorIndex(TABLE.CODE);

  logger.info('Lance code indexing complete', {
    repoId,
    files: files.length,
    chunks: inserted,
    durationMs: Date.now() - startedAt,
  });

  return buildStats(repoId, files.length, inserted, startedAt);
}

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
