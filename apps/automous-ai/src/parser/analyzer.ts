import fs from 'fs';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { walkDirectory } from './walker';
import { extractSymbols, countTokens } from './typescript';
import type { CodeSymbol } from './typescript';

// Max concurrent file reads. Keeps OS fd usage bounded on large repos.
const READ_CONCURRENCY = 64;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedFile {
  relativePath: string;
  absolutePath: string;
  extension: string;
  content: string;
  sizeBytes: number;
  tokenCount: number;
  symbols: CodeSymbol[];
  language: string;
}

// ─── Extension → language map ─────────────────────────────────────────────────

const EXT_LANGUAGE: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  mts: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  go: 'go',
  rs: 'rust',
  java: 'java',
  rb: 'ruby',
  php: 'php',
  cs: 'csharp',
  cpp: 'cpp',
  c: 'c',
  md: 'markdown',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  sh: 'shell',
  sql: 'sql',
};

// ─── Main analysis entry point ────────────────────────────────────────────────

export async function analyzeRepository(
  repoPath: string,
): Promise<ParsedFile[]> {
  const allowedExtensions = new Set(
    env.INDEX_FILE_EXTENSIONS.split(',').map((s) =>
      s.trim().replace(/^\./, ''),
    ),
  );
  const ignoreDirs = new Set(
    env.IGNORE_DIRECTORIES.split(',').map((s) => s.trim()),
  );

  const fileEntries = walkDirectory(
    repoPath,
    allowedExtensions,
    ignoreDirs,
    env.MAX_FILE_SIZE_BYTES,
  );

  // Read all files in parallel, bounded by READ_CONCURRENCY to avoid fd exhaustion.
  const parsed: ParsedFile[] = [];
  for (let i = 0; i < fileEntries.length; i += READ_CONCURRENCY) {
    const batch = fileEntries.slice(i, i + READ_CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (entry) => {
        const content = await fs.promises.readFile(entry.absolutePath, 'utf8');
        const symbols = extractSymbols(content, entry.extension);
        return {
          relativePath: entry.relativePath,
          absolutePath: entry.absolutePath,
          extension: entry.extension,
          content,
          sizeBytes: entry.sizeBytes,
          tokenCount: countTokens(content),
          symbols,
          language: EXT_LANGUAGE[entry.extension] ?? entry.extension,
        } satisfies ParsedFile;
      }),
    );

    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === 'fulfilled') {
        parsed.push(r.value);
      } else {
        logger.warn('Skipping unreadable file', {
          path: batch[j].relativePath,
          error: r.reason?.message,
        });
      }
    }
  }

  logger.info('Repository analyzed', {
    repoPath,
    files: parsed.length,
    totalTokens: parsed.reduce((s, f) => s + f.tokenCount, 0),
  });

  return parsed;
}
