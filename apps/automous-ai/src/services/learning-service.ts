import { db } from '../config/database';
import { logger } from '../utils/logger';
import type { ClassificationResult } from '../types/agent';

// ─── Past fix pattern ─────────────────────────────────────────────────────────

export interface FixPattern {
  category: string;
  strategy: string;
  filesChanged: string[];
  summary: string;
  approach: string;
  prUrl?: string;
}

// ─── Store a successful fix in history ───────────────────────────────────────

export async function recordSuccessfulFix(
  owner: string,
  repo: string,
  issueNumber: number,
  classification: ClassificationResult,
  filesChanged: string[],
  summary: string,
  approach: string,
  prUrl?: string,
): Promise<void> {
  try {
    await db.query(
      `INSERT INTO fix_history
         (owner, repo, issue_number, category, strategy, files_changed, summary, approach, pr_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        owner,
        repo,
        issueNumber,
        classification.category,
        classification.strategy,
        filesChanged,
        summary,
        approach,
        prUrl ?? null,
      ],
    );
    logger.info('Fix pattern recorded', {
      owner,
      repo,
      issueNumber,
      category: classification.category,
    });
  } catch (err) {
    // Non-fatal — learning failure should not block the main flow
    logger.warn('Failed to record fix pattern', {
      error: (err as Error).message,
    });
  }
}

// ─── Find similar past fixes to inject into agent context ─────────────────────

export async function findSimilarFixes(
  category: string,
  strategy: string,
  limit = 3,
): Promise<FixPattern[]> {
  try {
    const { rows } = await db.query<{
      category: string;
      strategy: string;
      files_changed: string[];
      summary: string;
      approach: string;
      pr_url: string | null;
    }>(
      `SELECT category, strategy, files_changed, summary, approach, pr_url
       FROM fix_history
       WHERE category = $1
         AND strategy = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [category, strategy, limit],
    );

    if (rows.length === 0) {
      // Broaden to same category if no exact match
      const { rows: broader } = await db.query<{
        category: string;
        strategy: string;
        files_changed: string[];
        summary: string;
        approach: string;
        pr_url: string | null;
      }>(
        `SELECT category, strategy, files_changed, summary, approach, pr_url
         FROM fix_history
         WHERE category = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [category, limit],
      );
      return broader.map((r) => ({
        category: r.category,
        strategy: r.strategy,
        filesChanged: r.files_changed,
        summary: r.summary,
        approach: r.approach,
        prUrl: r.pr_url ?? undefined,
      }));
    }

    return rows.map((r) => ({
      category: r.category,
      strategy: r.strategy,
      filesChanged: r.files_changed,
      summary: r.summary,
      approach: r.approach,
      prUrl: r.pr_url ?? undefined,
    }));
  } catch (err) {
    logger.warn('Failed to retrieve similar fixes', {
      error: (err as Error).message,
    });
    return [];
  }
}

// ─── Build context block to inject into agent system prompt ───────────────────

export function buildLearningContext(patterns: FixPattern[]): string {
  if (patterns.length === 0) return '';

  const entries = patterns.map((p, i) =>
    [
      `**Past fix ${i + 1}** (${p.category}/${p.strategy}):`,
      `- Files changed: ${p.filesChanged.join(', ') || 'unknown'}`,
      `- Approach: ${p.approach}`,
      `- Summary: ${p.summary.slice(0, 200)}`,
    ].join('\n'),
  );

  return [
    `SIMILAR PAST FIXES — learn from these patterns:`,
    ``,
    entries.join('\n\n'),
    ``,
    `Apply the same patterns if they fit. Don't blindly copy — adapt to this specific issue.`,
  ].join('\n');
}
