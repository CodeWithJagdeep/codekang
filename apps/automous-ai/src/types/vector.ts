// ─── Vector / Embedding Types ─────────────────────────────────────────────────

export interface CodeChunk {
  id: string;
  repoId: string; // "{owner}/{repo}"
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  language: string;
  tokenCount: number;
}

export interface EmbeddedChunk extends CodeChunk {
  embedding: number[];
}

export interface VectorSearchResult {
  chunk: CodeChunk;
  similarity: number; // 0-1
}

export interface IndexingStats {
  repoId: string;
  totalFiles: number;
  skippedFiles: number;
  totalChunks: number;
  durationMs: number;
  completedAt: string;
}
