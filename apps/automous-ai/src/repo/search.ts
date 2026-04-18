import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

const IGNORE_DIRS = new Set(
  env.IGNORE_DIRECTORIES.split(',').map((s) => s.trim()),
);
const ALLOWED_EXTS = new Set(
  env.INDEX_FILE_EXTENSIONS.split(',').map((s) => s.trim()),
);

// ─── File Walking ─────────────────────────────────────────────────────────────

export function walkRepo(repoPath: string): string[] {
  const files: string[] = [];

  function walk(dir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).slice(1);
        if (!ALLOWED_EXTS.has(ext)) continue;
        try {
          const { size } = fs.statSync(fullPath);
          if (size <= env.MAX_FILE_SIZE_BYTES) files.push(fullPath);
        } catch {
          // skip unreadable files
        }
      }
    }
  }

  walk(repoPath);
  return files;
}

// ─── Content helpers ──────────────────────────────────────────────────────────

export function readFileContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function getRelativePath(repoPath: string, filePath: string): string {
  return path.relative(repoPath, filePath);
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function searchFilesByKeyword(
  repoPath: string,
  keyword: string,
): string[] {
  const files = walkRepo(repoPath);
  const lower = keyword.toLowerCase();
  return files
    .filter((f) => {
      try {
        return readFileContent(f).toLowerCase().includes(lower);
      } catch {
        return false;
      }
    })
    .map((f) => getRelativePath(repoPath, f));
}

export function findFilesByName(repoPath: string, pattern: string): string[] {
  const files = walkRepo(repoPath);
  const lower = pattern.toLowerCase();
  return files
    .filter((f) => path.basename(f).toLowerCase().includes(lower))
    .map((f) => getRelativePath(repoPath, f));
}
