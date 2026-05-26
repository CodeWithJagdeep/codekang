import {
  lanceSearchCode,
  lanceSearchByFile,
  lanceSearchBySymbol,
  multiSourceSearch,
} from './lance/search';
import type { VectorSearchResult } from '../types/vector';

// ─── Backward-compatible wrappers (same signatures as before) ─────────────────

export async function searchSimilarCode(
  query: string,
  repoId: number,
  limit?: number,
): Promise<VectorSearchResult[]> {
  return lanceSearchCode(query, repoId, limit ?? 5);
}

export async function searchByFilePath(
  pathFragment: string,
  repoId: number,
  limit = 10,
): Promise<VectorSearchResult[]> {
  return lanceSearchByFile(pathFragment, repoId, limit);
}

export async function searchBySymbol(
  symbolName: string,
  repoId: number,
  limit = 10,
): Promise<VectorSearchResult[]> {
  return lanceSearchBySymbol(symbolName, repoId, limit);
}

// ─── Multi-query search (merges N queries with RRF) ───────────────────────────

export async function searchMultiQuery(
  queries: string[],
  repoId: number,
  limit?: number,
): Promise<VectorSearchResult[]> {
  if (queries.length === 0) return [];
  if (queries.length === 1) return searchSimilarCode(queries[0], repoId, limit);

  const results = await Promise.all(
    queries.map((q) => searchSimilarCode(q, repoId, limit)),
  );
  const seen = new Set<string>();
  return results.flat().filter((r) => {
    if (seen.has(r.chunk.id)) return false;
    seen.add(r.chunk.id);
    return true;
  });
}

// ─── Re-export multi-source search for agent tools ────────────────────────────

export { multiSourceSearch };
