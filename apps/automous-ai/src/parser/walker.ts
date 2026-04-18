import fs from 'fs';
import path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FileEntry {
  absolutePath: string;
  relativePath: string;
  extension: string;
  sizeBytes: number;
}

// ─── Recursive walker ─────────────────────────────────────────────────────────

export function walkDirectory(
  rootPath: string,
  allowedExtensions: Set<string>,
  ignoreDirs: Set<string>,
  maxFileSizeBytes: number,
): FileEntry[] {
  const entries: FileEntry[] = [];

  function traverse(dir: string): void {
    let items: fs.Dirent[];
    try {
      items = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const item of items) {
      if (ignoreDirs.has(item.name)) continue;
      const absolute = path.join(dir, item.name);

      if (item.isDirectory()) {
        traverse(absolute);
      } else if (item.isFile()) {
        const ext = path.extname(item.name).slice(1);
        if (!allowedExtensions.has(ext)) continue;

        let sizeBytes: number;
        try {
          sizeBytes = fs.statSync(absolute).size;
        } catch {
          continue;
        }

        if (sizeBytes > maxFileSizeBytes) continue;

        entries.push({
          absolutePath: absolute,
          relativePath: path.relative(rootPath, absolute),
          extension: ext,
          sizeBytes,
        });
      }
    }
  }

  traverse(rootPath);
  return entries;
}
