import { Ollama } from 'ollama';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// nomic-embed-text is optimized for code retrieval (768d, trained on code + text)
// Switch to nomic-embed-text-v1.5 for better quality (same dim, matryoshka representations)
// Set OLLAMA_EMBED_MODEL=nomic-embed-text-v1.5 in your env to upgrade
export const EMBEDDING_DIM = 768;

const MODEL = env.OLLAMA_EMBED_MODEL; // default: nomic-embed-text

const ollama = new Ollama({ host: env.OLLAMA_URL });

// ─── Batch config ─────────────────────────────────────────────────────────────
// Ollama handles up to 512 texts/batch before memory pressure; 128 is safe default.
const EMBED_BATCH_SIZE = 128;

async function ollamaEmbed(inputs: string[]): Promise<number[][]> {
  const { embeddings } = await ollama.embed({ model: MODEL, input: inputs });
  return embeddings;
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Prefix search queries with the nomic retrieval instruction for best results
export async function generateQueryEmbedding(text: string): Promise<number[]> {
  const [embedding] = await ollamaEmbed([`search_query: ${text}`]);
  return embedding;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const [embedding] = await ollamaEmbed([text]);
  return embedding;
}

// Batch with automatic chunking to stay within Ollama memory limits
export async function generateBatchEmbeddings(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) return [];

  logger.info('Batch embedding', { count: texts.length, model: MODEL });

  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBED_BATCH_SIZE);
    const embeddings = await ollamaEmbed(batch);
    results.push(...embeddings);
  }
  return results;
}

export async function shutdownEmbedder(): Promise<void> {
  logger.info('Embedder released (Ollama stateless — no-op)');
}
