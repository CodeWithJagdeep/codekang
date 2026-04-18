import { db, toVector } from '../config/database';
import { generateQueryEmbedding } from './embeddings';
import { setSearchEffort } from './schema';
import { env } from '../config/env';
import type { VectorSearchResult } from '../types/vector';

// ─── Search configuration ─────────────────────────────────────────────────────

// Reciprocal Rank Fusion constant (higher = less weight on top ranks)
const RRF_K = 60;

// How many candidates to pull from each sub-search before merging
const CANDIDATE_MULTIPLIER = 4;

// ─── Main hybrid search ───────────────────────────────────────────────────────
//
// Strategy: Reciprocal Rank Fusion (RRF) over two ranked lists:
//   1. Vector similarity (semantic / meaning)
//   2. Full-text search  (BM25-like / exact keywords)
//
// RRF score = Σ  1 / (k + rank_i)
//
// This outperforms either search alone on code retrieval tasks because:
//   - Vector search finds conceptually related code even with different identifiers
//   - FTS finds exact function/variable names, error messages, comments
//   - RRF fusion is parameter-free and robust to scale differences

export async function searchSimilarCode(
  query: string,
  repoId: number,
  limit?: number,
): Promise<VectorSearchResult[]> {
  const finalLimit = limit ?? env.VECTOR_SEARCH_LIMIT;
  const candidates = finalLimit * CANDIDATE_MULTIPLIER;

  // Tune HNSW search depth at query time for better recall
  await setSearchEffort(Math.max(100, candidates));

  const [vectorResults, ftsResults] = await Promise.all([
    vectorSearch(query, repoId, candidates),
    fulltextSearch(query, repoId, candidates),
  ]);

  return fuseRRF(vectorResults, ftsResults, finalLimit);
}

// ─── File-path search ─────────────────────────────────────────────────────────
// Find chunks by file path (trigram search — handles partial paths).

export async function searchByFilePath(
  pathFragment: string,
  repoId: number,
  limit = 10,
): Promise<VectorSearchResult[]> {
  type Row = ChunkRow;
  const result = await db.query<Row>(
    `SELECT id, repo_id, file_path, start_line, end_line,
            content, language, token_count,
            1.0 AS similarity
     FROM   code_chunks
     WHERE  repo_id = $1
       AND  file_path ILIKE $2
     ORDER  BY file_path, start_line
     LIMIT  $3`,
    [repoId, `%${pathFragment}%`, limit],
  );
  return result.rows.map(rowToResult);
}

// ─── Symbol search ────────────────────────────────────────────────────────────
// Find chunks by exact or partial symbol name.

export async function searchBySymbol(
  symbolName: string,
  repoId: number,
  limit = 10,
): Promise<VectorSearchResult[]> {
  type Row = ChunkRow;
  const result = await db.query<Row>(
    `SELECT id, repo_id, file_path, start_line, end_line,
            content, language, token_count,
            1.0 AS similarity
     FROM   code_chunks
     WHERE  repo_id = $1
       AND  symbol_name ILIKE $2
     ORDER  BY chunk_type = 'symbol' DESC, file_path, start_line
     LIMIT  $3`,
    [repoId, `%${symbolName}%`, limit],
  );
  return result.rows.map(rowToResult);
}

// ─── Multi-query search ───────────────────────────────────────────────────────
// Run several queries, merge with RRF. Useful for complex issues that touch
// multiple concepts.

export async function searchMultiQuery(
  queries: string[],
  repoId: number,
  limit?: number,
): Promise<VectorSearchResult[]> {
  if (queries.length === 0) return [];
  if (queries.length === 1) return searchSimilarCode(queries[0], repoId, limit);

  const finalLimit = limit ?? env.VECTOR_SEARCH_LIMIT;
  const perQuery = Math.ceil(finalLimit * 1.5);

  const allResults = await Promise.all(
    queries.map((q) => searchSimilarCode(q, repoId, perQuery)),
  );

  // Merge all ranked lists with RRF
  const scoreMap = new Map<
    string,
    { score: number; result: VectorSearchResult }
  >();
  for (const results of allResults) {
    for (let rank = 0; rank < results.length; rank++) {
      const r = results[rank];
      const key = r.chunk.id;
      const rrfScore = 1 / (RRF_K + rank + 1);
      const existing = scoreMap.get(key);
      if (existing) {
        existing.score += rrfScore;
      } else {
        scoreMap.set(key, { score: rrfScore, result: r });
      }
    }
  }

  return [...scoreMap.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, finalLimit)
    .map(({ score, result }) => ({ ...result, similarity: score }));
}

// ─── Internal: vector similarity search ──────────────────────────────────────

type ChunkRow = {
  id: number;
  repo_id: number;
  file_path: string;
  start_line: number;
  end_line: number;
  content: string;
  language: string;
  token_count: number;
  similarity: number;
};

interface RankedResult {
  id: number;
  rank: number;
  row: ChunkRow;
}

async function vectorSearch(
  query: string,
  repoId: number,
  limit: number,
): Promise<RankedResult[]> {
  const embedding = await generateQueryEmbedding(query);
  const vectorStr = toVector(embedding);
  const threshold = env.VECTOR_SIMILARITY_THRESHOLD;

  const result = await db.query<ChunkRow & { rank: number }>(
    `SELECT id, repo_id, file_path, start_line, end_line,
            content, language, token_count,
            1 - (embedding <=> $1::vector) AS similarity,
            ROW_NUMBER() OVER (ORDER BY embedding <=> $1::vector) AS rank
     FROM   code_chunks
     WHERE  repo_id = $2
       AND  embedding IS NOT NULL
       AND  1 - (embedding <=> $1::vector) >= $3
     ORDER  BY embedding <=> $1::vector
     LIMIT  $4`,
    [vectorStr, repoId, threshold, limit],
  );

  return result.rows.map((r) => ({ id: r.id, rank: r.rank, row: r }));
}

// ─── Internal: full-text (BM25-like) search ───────────────────────────────────

async function fulltextSearch(
  query: string,
  repoId: number,
  limit: number,
): Promise<RankedResult[]> {
  // plainto_tsquery is safe and handles free-form text well.
  // websearch_to_tsquery supports "quoted phrases" and -exclusions if needed.
  const result = await db.query<ChunkRow & { rank: number }>(
    `SELECT id, repo_id, file_path, start_line, end_line,
            content, language, token_count,
            ts_rank_cd(fts, plainto_tsquery('english', $1)) AS similarity,
            ROW_NUMBER() OVER (
              ORDER BY ts_rank_cd(fts, plainto_tsquery('english', $1)) DESC
            ) AS rank
     FROM   code_chunks
     WHERE  repo_id = $2
       AND  fts @@ plainto_tsquery('english', $1)
     ORDER  BY similarity DESC
     LIMIT  $3`,
    [query, repoId, limit],
  );

  return result.rows.map((r) => ({ id: r.id, rank: r.rank, row: r }));
}

// ─── RRF fusion ───────────────────────────────────────────────────────────────

function fuseRRF(
  vectorResults: RankedResult[],
  ftsResults: RankedResult[],
  limit: number,
): VectorSearchResult[] {
  const scores = new Map<number, { score: number; row: ChunkRow }>();

  function addResults(results: RankedResult[], weight: number): void {
    for (const { id, rank, row } of results) {
      const rrfScore = weight / (RRF_K + rank);
      const existing = scores.get(id);
      if (existing) {
        existing.score += rrfScore;
      } else {
        scores.set(id, { score: rrfScore, row });
      }
    }
  }

  // Equal weight for both signals; adjust if one is more important
  addResults(vectorResults, 1.0);
  addResults(ftsResults, 1.0);

  // Boost symbol chunks and file-header chunks for better precision
  // (We can't easily do this without joining back to chunk_type, so we leave it
  //  for now — the HNSW index already surfaces them well)

  return [...scores.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, limit)
    .map(([, { score, row }]) => rowToResult({ ...row, similarity: score }));
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function rowToResult(row: ChunkRow): VectorSearchResult {
  return {
    chunk: {
      id: String(row.id),
      repoId: String(row.repo_id),
      filePath: row.file_path,
      startLine: row.start_line,
      endLine: row.end_line,
      content: row.content,
      language: row.language,
      tokenCount: row.token_count,
    },
    similarity: row.similarity,
  };
}
