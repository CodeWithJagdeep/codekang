import fs from 'fs';
import path from 'path';
import { openTable, deleteByRepo, TABLE } from './tables';
import { generateBatchEmbeddings } from '../embeddings';
import { db } from '../../config/database';
import { logger } from '../../utils/logger';

export interface CodingStandard {
  content: string;
  source:
    | 'CLAUDE.md'
    | 'coderabbit.yaml'
    | '.cursorrules'
    | 'custom'
    | 'implicit';
}

// ─── Index team coding standards for a repo ───────────────────────────────────

export async function indexStandardsInLance(
  repoId: number,
  owner: string,
  repoName: string,
  standards: CodingStandard[],
): Promise<void> {
  if (standards.length === 0) return;

  try {
    await deleteByRepo(TABLE.STANDARDS, repoId);

    const texts = standards.map((s) => `[${s.source}]\n${s.content}`);
    const embeddings = await generateBatchEmbeddings(texts);

    const tbl = await openTable(TABLE.STANDARDS);
    await tbl.add(
      standards.map((s, i) => ({
        id: `${repoId}:std:${s.source}:${i}`,
        repo_id: repoId,
        owner,
        repo_name: repoName,
        content: s.content.slice(0, 3000),
        source: s.source,
        vector: embeddings[i],
      })),
    );

    logger.info('Standards indexed', {
      owner,
      repoName,
      count: standards.length,
    });
  } catch (err) {
    logger.warn('Failed to index standards (non-fatal)', {
      error: (err as Error).message,
    });
  }
}

// ─── Extract standards files from a cloned repo ───────────────────────────────

export function extractStandardsFromRepo(repoPath: string): CodingStandard[] {
  const candidates: Array<{ file: string; source: CodingStandard['source'] }> =
    [
      { file: 'CLAUDE.md', source: 'CLAUDE.md' },
      { file: '.coderabbit.yaml', source: 'coderabbit.yaml' },
      { file: '.coderabbit.yml', source: 'coderabbit.yaml' },
      { file: '.cursorrules', source: '.cursorrules' },
      { file: 'CONTRIBUTING.md', source: 'custom' },
      { file: 'docs/CONTRIBUTING.md', source: 'custom' },
    ];

  const found: CodingStandard[] = [];
  for (const { file, source } of candidates) {
    const abs = path.join(repoPath, file);
    if (fs.existsSync(abs)) {
      const content = fs.readFileSync(abs, 'utf8').trim();
      if (content.length > 50) found.push({ content, source });
    }
  }
  return found;
}

// ─── Gap 3: Fallback — build implicit standards from past fixes ───────────────
// If no standards files exist, synthesize "implicit standards" from the 3 most
// recent successful fixes in this repo. These encode what the team has accepted.

export async function buildImplicitStandards(
  owner: string,
  repoName: string,
): Promise<CodingStandard[]> {
  try {
    const { rows } = await db.query<{
      category: string;
      strategy: string;
      files_changed: string[];
      summary: string;
      approach: string;
    }>(
      `SELECT category, strategy, files_changed, summary, approach
       FROM fix_history
       WHERE owner = $1 AND repo = $2
       ORDER BY created_at DESC
       LIMIT 3`,
      [owner, repoName],
    );

    if (rows.length === 0) return [];

    const content =
      `Implicit team standards inferred from recent accepted fixes in ${owner}/${repoName}:\n\n` +
      rows
        .map(
          (r, i) =>
            `Fix ${i + 1} (${r.category}/${r.strategy}):\n` +
            `- Files: ${r.files_changed.join(', ')}\n` +
            `- Approach: ${r.approach.slice(0, 300)}\n` +
            `- Outcome: ${r.summary.slice(0, 200)}`,
        )
        .join('\n\n');

    return [{ content, source: 'implicit' }];
  } catch {
    return [];
  }
}

// ─── Orchestrator: extract + fallback + index ─────────────────────────────────
// Called from indexer.ts. Reads files first; falls back to past-fix synthesis.

export async function indexStandardsWithFallback(
  repoId: number,
  owner: string,
  repoName: string,
  repoPath: string,
): Promise<void> {
  let standards = extractStandardsFromRepo(repoPath);

  if (standards.length === 0) {
    logger.info(
      'No standards files found — using implicit standards from fix history',
      {
        owner,
        repoName,
      },
    );
    standards = await buildImplicitStandards(owner, repoName);
  }

  await indexStandardsInLance(repoId, owner, repoName, standards);
}
