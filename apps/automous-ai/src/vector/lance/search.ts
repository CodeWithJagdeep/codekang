import { openTable, TABLE } from './tables';
import { generateQueryEmbedding } from '../embeddings';
import { logger } from '../../utils/logger';
import type { VectorSearchResult } from '../../types/vector';

// ─── Config ───────────────────────────────────────────────────────────────────

const RRF_K = 60;
const CANDIDATES = 20;
// Rough chars-per-token for budget estimation
const CHARS_PER_TOKEN = 4;
const MAX_CONTEXT_TOKENS = 8000;

// ─── Source types ─────────────────────────────────────────────────────────────

export type SearchSource =
  | 'code'
  | 'pr_history'
  | 'issue'
  | 'standards'
  | 'chat';

// ─── Code search — backward-compatible return type ────────────────────────────

export async function lanceSearchCode(
  query: string,
  repoId: number,
  limit: number,
): Promise<VectorSearchResult[]> {
  const rows = await searchVectors(TABLE.CODE, query, repoId, limit * 2);
  return rows.slice(0, limit).map((r) => ({
    chunk: {
      id: String(r['id'] ?? ''),
      repoId: String(repoId),
      filePath: String(r['file_path'] ?? ''),
      startLine: Number(r['start_line'] ?? 0),
      endLine: Number(r['end_line'] ?? 0),
      content: String(r['content'] ?? ''),
      language: String(r['language'] ?? ''),
      tokenCount: Number(r['token_count'] ?? 0),
    },
    similarity: 1 - Number(r['_distance'] ?? 0),
  }));
}

// ─── File-path search (scalar filter — no ANN) ───────────────────────────────

export async function lanceSearchByFile(
  pathFragment: string,
  repoId: number,
  limit: number,
): Promise<VectorSearchResult[]> {
  try {
    const tbl = await openTable(TABLE.CODE);
    const rows = (await tbl
      .query()
      .where(
        `repo_id = '${repoId}' AND file_path LIKE '%${escapeSql(pathFragment)}%'`,
      )
      .limit(limit)
      .toArray()) as Record<string, unknown>[];

    return rows.map((r) => ({
      chunk: {
        id: String(r['id'] ?? ''),
        repoId: String(repoId),
        filePath: String(r['file_path'] ?? ''),
        startLine: Number(r['start_line'] ?? 0),
        endLine: Number(r['end_line'] ?? 0),
        content: String(r['content'] ?? ''),
        language: String(r['language'] ?? ''),
        tokenCount: Number(r['token_count'] ?? 0),
      },
      similarity: 1.0,
    }));
  } catch {
    return [];
  }
}

// ─── Symbol search (scalar filter — no ANN) ──────────────────────────────────

export async function lanceSearchBySymbol(
  symbolName: string,
  repoId: number,
  limit: number,
): Promise<VectorSearchResult[]> {
  try {
    const tbl = await openTable(TABLE.CODE);
    const rows = (await tbl
      .query()
      .where(
        `repo_id = '${repoId}' AND symbol_name != '' AND symbol_name LIKE '%${escapeSql(symbolName)}%'`,
      )
      .limit(limit)
      .toArray()) as Record<string, unknown>[];

    return rows.map((r) => ({
      chunk: {
        id: String(r['id'] ?? ''),
        repoId: String(repoId),
        filePath: String(r['file_path'] ?? ''),
        startLine: Number(r['start_line'] ?? 0),
        endLine: Number(r['end_line'] ?? 0),
        content: String(r['content'] ?? ''),
        language: String(r['language'] ?? ''),
        tokenCount: Number(r['token_count'] ?? 0),
      },
      similarity: 1.0,
    }));
  } catch {
    return [];
  }
}

// ─── Multi-source search ──────────────────────────────────────────────────────
// Searches code + PR history + issues + standards in parallel.
// Merges via RRF, assembles a token-budgeted context string for LLM prompts.

export async function multiSourceSearch(
  query: string,
  repoId: number,
  options: {
    includePR?: boolean;
    includeIssues?: boolean;
    includeStandards?: boolean;
    includeChat?: boolean;
    limit?: number;
  } = {},
): Promise<string> {
  const {
    includePR = true,
    includeIssues = true,
    includeStandards = true,
    includeChat = false,
    limit = 10,
  } = options;

  // Fan-out: search all sources in parallel
  const searches: Array<{
    source: SearchSource;
    promise: Promise<Record<string, unknown>[]>;
  }> = [
    {
      source: 'code',
      promise: searchVectors(TABLE.CODE, query, repoId, CANDIDATES),
    },
  ];
  if (includePR)
    searches.push({
      source: 'pr_history',
      promise: searchVectors(TABLE.PR, query, repoId, CANDIDATES),
    });
  if (includeIssues)
    searches.push({
      source: 'issue',
      promise: searchVectors(TABLE.ISSUE, query, repoId, CANDIDATES),
    });
  if (includeStandards)
    searches.push({
      source: 'standards',
      promise: searchVectors(TABLE.STANDARDS, query, repoId, CANDIDATES),
    });
  if (includeChat)
    searches.push({
      source: 'chat',
      promise: searchVectors(TABLE.CHAT, query, repoId, CANDIDATES),
    });

  // Always include chat for feedback weighting (even if not shown in final context)
  const chatPromise = searchVectors(TABLE.CHAT, query, repoId, CANDIDATES);

  const settled = await Promise.allSettled(searches.map((s) => s.promise));
  const chatRows = await chatPromise.catch(
    () => [] as Record<string, unknown>[],
  );

  // Build feedback index from chat_learnings: contentKey → multiplier
  // accepted/helpful = boost; dismissed/unhelpful/false_positive = penalize
  const feedbackMultiplier = buildFeedbackMultiplier(chatRows);

  // RRF: merge across sources with rank-based scoring
  const rrfMap = new Map<
    string,
    { score: number; source: SearchSource; row: Record<string, unknown> }
  >();

  for (let si = 0; si < searches.length; si++) {
    const result = settled[si];
    if (result.status !== 'fulfilled') continue;
    const rows = result.value;
    const source = searches[si].source;

    for (let rank = 0; rank < rows.length; rank++) {
      const row = rows[rank];
      const id = String(row['id'] ?? `${source}:${rank}`);
      const rrfScore = 1 / (RRF_K + rank + 1);
      const existing = rrfMap.get(id);
      if (existing) {
        existing.score += rrfScore;
      } else {
        rrfMap.set(id, { score: rrfScore, source, row });
      }
    }
  }

  // ── Re-ranking: apply score multipliers ──────────────────────────────────
  // Gap 2+4: feedback weighting + chunk-type boost (no cross-encoder needed)
  for (const entry of rrfMap.values()) {
    // Chat feedback: accepted content scores high, dismissed scores low
    if (entry.source === 'chat') {
      const ft = String(entry.row['feedback_type'] ?? '');
      if (ft === 'accepted' || ft === 'helpful') entry.score *= 2.0;
      else if (ft === 'dismissed' || ft === 'unhelpful') entry.score *= 0.2;
      else if (ft === 'false_positive') entry.score *= 0.05;
    }

    // Code chunk type: symbol boundaries are more precise than sliding windows
    if (entry.source === 'code') {
      if (String(entry.row['chunk_type']) === 'symbol') entry.score *= 1.3;
      if (String(entry.row['chunk_type']) === 'file-header') entry.score *= 0.8;
    }

    // Feedback index: if any past feedback matched this content, apply its signal
    const contentKey = String(entry.row['content'] ?? '').slice(0, 60);
    const multiplier = feedbackMultiplier.get(contentKey);
    if (multiplier !== undefined) entry.score *= multiplier;
  }

  // Add chat rows as source if includeChat requested
  if (includeChat) {
    for (let rank = 0; rank < chatRows.length; rank++) {
      const row = chatRows[rank];
      const id = String(row['id'] ?? `chat:${rank}`);
      if (!rrfMap.has(id)) {
        rrfMap.set(id, { score: 1 / (RRF_K + rank + 1), source: 'chat', row });
      }
    }
  }

  const ranked = [...rrfMap.values()].sort((a, b) => b.score - a.score);

  return assembleContext(ranked, limit);
}

// ─── Dedicated search for review-service ─────────────────────────────────────
// Returns standards + similar past PRs — focused context for code review prompts.

export async function searchForReview(
  query: string,
  repoId: number,
): Promise<string> {
  return multiSourceSearch(query, repoId, {
    includePR: true,
    includeIssues: false,
    includeStandards: true,
    includeChat: true,
    limit: 6,
  });
}

// ─── Build feedback multiplier map from chat_learnings rows ──────────────────
// Keys on first 60 chars of content to match retrieved items against past feedback.

function buildFeedbackMultiplier(
  chatRows: Record<string, unknown>[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of chatRows) {
    const ft = String(row['feedback_type'] ?? '');
    const key = String(row['content'] ?? '').slice(0, 60);
    if (!key) continue;
    const existing = map.get(key) ?? 1.0;
    let multiplier: number;
    if (ft === 'accepted' || ft === 'helpful') multiplier = 1.5;
    else if (ft === 'dismissed' || ft === 'unhelpful') multiplier = 0.3;
    else if (ft === 'false_positive') multiplier = 0.1;
    else continue;
    // Average if seen multiple times
    map.set(key, (existing + multiplier) / 2);
  }
  return map;
}

// ─── Internal: ANN search a single LanceDB table ─────────────────────────────

async function searchVectors(
  tableName: string,
  query: string,
  repoId: number,
  limit: number,
): Promise<Record<string, unknown>[]> {
  try {
    const tbl = await openTable(tableName);
    const count = await tbl.countRows();
    if (count === 0) return [];

    const embedding = await generateQueryEmbedding(query);

    const results = await tbl
      .vectorSearch(embedding)
      .limit(limit)
      .where(`repo_id = ${repoId}`)
      .toArray();

    return results as Record<string, unknown>[];
  } catch (err) {
    logger.debug('LanceDB search failed', {
      table: tableName,
      error: (err as Error).message.slice(0, 80),
    });
    return [];
  }
}

// ─── Context assembler ────────────────────────────────────────────────────────
// Source priority: code > issue > standards > pr_history > chat
// Groups by source, enforces token budget, deduplicates overlapping content.

const SOURCE_PRIORITY: Record<SearchSource, number> = {
  code: 0,
  issue: 1,
  standards: 2,
  pr_history: 3,
  chat: 4,
};

function assembleContext(
  ranked: Array<{
    score: number;
    source: SearchSource;
    row: Record<string, unknown>;
  }>,
  limit: number,
): string {
  const sorted = [...ranked].sort((a, b) => {
    const pa = SOURCE_PRIORITY[a.source];
    const pb = SOURCE_PRIORITY[b.source];
    if (pa !== pb) return pa - pb;
    return b.score - a.score;
  });

  const sections: string[] = [];
  let budget = MAX_CONTEXT_TOKENS * CHARS_PER_TOKEN;
  const seenContent = new Set<string>();

  for (const { source, row } of sorted) {
    if (sections.length >= limit) break;

    const formatted = formatRow(source, row);
    if (!formatted) continue;

    const contentKey = String(row['content'] ?? row['body'] ?? '').slice(0, 80);
    if (seenContent.has(contentKey)) continue;
    seenContent.add(contentKey);

    if (formatted.length > budget) break;
    budget -= formatted.length;
    sections.push(formatted);
  }

  return sections.length === 0
    ? 'No relevant context found.'
    : sections.join('\n\n');
}

function formatRow(
  source: SearchSource,
  r: Record<string, unknown>,
): string | null {
  switch (source) {
    case 'code': {
      const loc = `${r['file_path']}:${r['start_line']}-${r['end_line']}`;
      const lang = String(r['language'] ?? '');
      const sym = r['symbol_name'] ? ` [${r['symbol_name']}]` : '';
      return `### Code: ${loc}${sym}\n\`\`\`${lang}\n${String(r['content'] ?? '').slice(0, 1200)}\n\`\`\``;
    }
    case 'pr_history':
      return `### Past PR #${r['pr_number']}: ${r['pr_title']} [${r['verdict']}]\n${String(r['summary'] ?? '').slice(0, 500)}`;
    case 'issue':
      return `### Related Issue #${r['issue_number']}: ${r['title']}\n${String(r['body'] ?? '').slice(0, 600)}`;
    case 'standards':
      return `### Team Standard [${r['source']}]\n${String(r['content'] ?? '').slice(0, 800)}`;
    case 'chat':
      return `### Review Feedback [${r['feedback_type']}] on PR #${r['pr_number']}\n${String(r['content'] ?? '').slice(0, 400)}`;
    default:
      return null;
  }
}

// ─── SQL LIKE escape (prevents injection in scalar filters) ──────────────────

function escapeSql(s: string): string {
  return s.replace(/'/g, "''").replace(/[%_\\]/g, '\\$&');
}
