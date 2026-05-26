import * as lancedb from '@lancedb/lancedb';
import {
  Schema,
  Field,
  FixedSizeList,
  Float32,
  Utf8,
  Int32,
} from 'apache-arrow';
import { getLanceDB } from './client';
import { logger } from '../../utils/logger';

// ─── Shared embedding dimension ───────────────────────────────────────────────
export const LANCE_DIM = 768;

// ─── Arrow schemas ────────────────────────────────────────────────────────────

const vectorField = () =>
  new Field(
    'vector',
    new FixedSizeList(LANCE_DIM, new Field('item', new Float32(), false)),
    false,
  );

export const CODE_CHUNKS_SCHEMA = new Schema([
  new Field('id', new Utf8()),
  new Field('repo_id', new Int32()),
  new Field('owner', new Utf8()),
  new Field('repo_name', new Utf8()),
  new Field('file_path', new Utf8()),
  new Field('start_line', new Int32()),
  new Field('end_line', new Int32()),
  new Field('content', new Utf8()),
  new Field('language', new Utf8()),
  new Field('token_count', new Int32()),
  new Field('chunk_type', new Utf8()),
  new Field('symbol_name', new Utf8()),
  vectorField(),
]);

export const PR_HISTORY_SCHEMA = new Schema([
  new Field('id', new Utf8()),
  new Field('repo_id', new Int32()),
  new Field('owner', new Utf8()),
  new Field('repo_name', new Utf8()),
  new Field('pr_number', new Int32()),
  new Field('pr_title', new Utf8()),
  new Field('pr_body', new Utf8()),
  new Field('verdict', new Utf8()),
  new Field('head_branch', new Utf8()),
  new Field('summary', new Utf8()),
  vectorField(),
]);

export const ISSUE_CONTEXT_SCHEMA = new Schema([
  new Field('id', new Utf8()),
  new Field('repo_id', new Int32()),
  new Field('owner', new Utf8()),
  new Field('repo_name', new Utf8()),
  new Field('issue_number', new Int32()),
  new Field('title', new Utf8()),
  new Field('body', new Utf8()),
  new Field('state', new Utf8()),
  new Field('labels', new Utf8()),
  vectorField(),
]);

export const CODING_STANDARDS_SCHEMA = new Schema([
  new Field('id', new Utf8()),
  new Field('repo_id', new Int32()),
  new Field('owner', new Utf8()),
  new Field('repo_name', new Utf8()),
  new Field('content', new Utf8()),
  new Field('source', new Utf8()),
  vectorField(),
]);

export const CHAT_LEARNINGS_SCHEMA = new Schema([
  new Field('id', new Utf8()),
  new Field('repo_id', new Int32()),
  new Field('owner', new Utf8()),
  new Field('repo_name', new Utf8()),
  new Field('feedback_type', new Utf8()),
  new Field('content', new Utf8()),
  new Field('pr_number', new Int32()),
  vectorField(),
]);

// ─── Table name constants ─────────────────────────────────────────────────────

export const TABLE = {
  CODE: 'code_chunks',
  PR: 'pr_history',
  ISSUE: 'issue_context',
  STANDARDS: 'coding_standards',
  CHAT: 'chat_learnings',
} as const;

// ─── Ensure all tables exist at startup ───────────────────────────────────────

export async function ensureLanceTables(): Promise<void> {
  const db = await getLanceDB();
  const existing = new Set(await db.tableNames());

  const toCreate: Array<[string, Schema]> = [
    [TABLE.CODE, CODE_CHUNKS_SCHEMA],
    [TABLE.PR, PR_HISTORY_SCHEMA],
    [TABLE.ISSUE, ISSUE_CONTEXT_SCHEMA],
    [TABLE.STANDARDS, CODING_STANDARDS_SCHEMA],
    [TABLE.CHAT, CHAT_LEARNINGS_SCHEMA],
  ];

  for (const [name, schema] of toCreate) {
    if (!existing.has(name)) {
      await db.createEmptyTable(name, schema);
      logger.info('LanceDB table created', { table: name });
    }
  }

  logger.info('LanceDB tables ready');
}

// ─── Helper: open a table ────────────────────────────────────────────────────

export async function openTable(name: string): Promise<lancedb.Table> {
  const db = await getLanceDB();
  return db.openTable(name);
}

// ─── Helper: delete all rows for a repo in a table ───────────────────────────

export async function deleteByRepo(
  tableName: string,
  repoId: number,
): Promise<void> {
  try {
    const tbl = await openTable(tableName);
    const count = await tbl.countRows();
    if (count === 0) return;
    await tbl.delete(`repo_id = ${repoId}`);
  } catch {
    // Table might not exist yet — ignore
  }
}

// ─── Helper: create vector index when enough rows exist ──────────────────────
// IVF-PQ / HNSW requires minimum 256 rows to train. Skip if below threshold.

const MIN_ROWS_FOR_INDEX = 256;

export async function tryCreateVectorIndex(tableName: string): Promise<void> {
  try {
    const tbl = await openTable(tableName);
    const count = await tbl.countRows();
    if (count < MIN_ROWS_FOR_INDEX) return;
    await tbl.createIndex('vector');
    logger.debug('LanceDB vector index created', {
      table: tableName,
      rows: count,
    });
  } catch (err) {
    logger.debug('LanceDB vector index skipped', {
      table: tableName,
      error: (err as Error).message.slice(0, 80),
    });
  }
}
