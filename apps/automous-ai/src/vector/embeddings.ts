import { Ollama } from 'ollama';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const EMBEDDING_DIM = 768;

const MODEL = 'nomic-embed-text';

const ollama = new Ollama({ host: env.OLLAMA_URL });

async function ollamaEmbed(inputs: string[]): Promise<number[][]> {
  const { embeddings } = await ollama.embed({ model: MODEL, input: inputs });
  return embeddings;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateQueryEmbedding(text: string): Promise<number[]> {
  const [embedding] = await ollamaEmbed([`search_query: ${text}`]);
  return embedding;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const [embedding] = await ollamaEmbed([text]);
  return embedding;
}

export async function generateBatchEmbeddings(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) return [];

  logger.info('Batch embedding via Ollama', {
    count: texts.length,
    model: MODEL,
  });
  return ollamaEmbed(texts);
}

// kept for API compatibility — no persistent resource to release
export async function shutdownEmbedder(): Promise<void> {
  logger.info('Embedder released (Ollama — no-op)');
}
