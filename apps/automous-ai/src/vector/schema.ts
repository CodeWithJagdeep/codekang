import { db } from '../config/database';
import { logger } from '../utils/logger';
import { EMBEDDING_DIM } from './embeddings';

// ─── Schema setup & migration ─────────────────────────────────────────────────
//
// This module owns the pgvector table schema.
// Call ensureSchema() on startup before indexing or searching.
//
// Design choices:
//   - HNSW index  : fast approximate nearest-neighbour, better recall than IVFFlat
//   - GIN index   : PostgreSQL full-text search (tsvector), used in hybrid search
//   - fts column  : pre-computed tsvector (faster than computing at query time)
//   - chunk_type  : lets us weight or filter by "symbol" | "window" | "file-header"
// ─────────────────────────────────────────────────────────────────────────────

export async function ensureSchema(): Promise<void> {
  logger.info('Ensuring database schema');

  await db.query('CREATE EXTENSION IF NOT EXISTS vector');
  await db.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');

  // ── repos ──────────────────────────────────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS repos (
      id           SERIAL PRIMARY KEY,
      owner        TEXT NOT NULL,
      name         TEXT NOT NULL,
      full_name    TEXT NOT NULL UNIQUE,
      default_branch TEXT NOT NULL DEFAULT 'main',
      language     TEXT,
      indexed_at   TIMESTAMPTZ,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // ── code_chunks ────────────────────────────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS code_chunks (
      id          BIGSERIAL PRIMARY KEY,
      repo_id     INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
      file_path   TEXT NOT NULL,
      start_line  INTEGER NOT NULL,
      end_line    INTEGER NOT NULL,
      content     TEXT NOT NULL,
      language    TEXT NOT NULL DEFAULT '',
      token_count INTEGER NOT NULL DEFAULT 0,
      chunk_type  TEXT NOT NULL DEFAULT 'window',
      symbol_name TEXT,
      fts         TSVECTOR,
      embedding   VECTOR(${EMBEDDING_DIM}),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // ── Handle dimension migration ─────────────────────────────────────────────
  // If embedding column exists with a different dimension, drop and recreate it.
  await migrateDimension();

  // ── Indexes ────────────────────────────────────────────────────────────────

  // HNSW index for fast ANN similarity search
  // m=16  : max connections per layer (higher = better recall, more memory)
  // ef_construction=128 : build-time search depth (higher = better, slower build)
  await db.query(`
    CREATE INDEX IF NOT EXISTS code_chunks_embedding_hnsw
    ON code_chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 128)
  `);

  // GIN index for full-text search
  await db.query(`
    CREATE INDEX IF NOT EXISTS code_chunks_fts_gin
    ON code_chunks USING gin(fts)
  `);

  // Trigram index on file_path for fast file-path substring searches
  await db.query(`
    CREATE INDEX IF NOT EXISTS code_chunks_filepath_trgm
    ON code_chunks USING gin(file_path gin_trgm_ops)
  `);

  // B-tree index for repo-scoped queries
  await db.query(`
    CREATE INDEX IF NOT EXISTS code_chunks_repo_id_idx
    ON code_chunks (repo_id)
  `);

  // ── fix_jobs ───────────────────────────────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS fix_jobs (
      id           BIGSERIAL PRIMARY KEY,
      repo_id      INTEGER NOT NULL REFERENCES repos(id),
      issue_number INTEGER NOT NULL,
      issue_title  TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','running','success','failed')),
      branch_name  TEXT,
      pr_number    INTEGER,
      pr_url       TEXT,
      error        TEXT,
      cost_usd     NUMERIC(10,6),
      started_at   TIMESTAMPTZ,
      finished_at  TIMESTAMPTZ,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // ── fix_proposals ──────────────────────────────────────────────────────────
  // Stores pre-fix proposals posted to GitHub, awaiting contributor approval.
  await db.query(`
    CREATE TABLE IF NOT EXISTS fix_proposals (
      id                 BIGSERIAL PRIMARY KEY,
      owner              TEXT NOT NULL,
      repo               TEXT NOT NULL,
      issue_number       INTEGER NOT NULL,
      issue_title        TEXT NOT NULL,
      issue_body         TEXT NOT NULL,
      installation_id    INTEGER,
      analysis           TEXT NOT NULL,
      category           TEXT NOT NULL,
      strategy           TEXT NOT NULL,
      confidence         NUMERIC(4,3) NOT NULL DEFAULT 0,
      complexity         TEXT NOT NULL DEFAULT 'medium',
      files_to_change    TEXT[] NOT NULL DEFAULT '{}',
      proposed_solution  TEXT NOT NULL,
      status             TEXT NOT NULL DEFAULT 'awaiting_approval'
                           CHECK (status IN ('awaiting_approval','executing','done','rejected')),
      github_comment_id  BIGINT,
      needs_environment  BOOLEAN NOT NULL DEFAULT TRUE,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Migrate: add needs_environment to existing tables that predate this column
  await db.query(`
    ALTER TABLE fix_proposals
      ADD COLUMN IF NOT EXISTS needs_environment BOOLEAN NOT NULL DEFAULT TRUE
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS fix_proposals_issue_idx
    ON fix_proposals (owner, repo, issue_number)
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS fix_proposals_status_idx
    ON fix_proposals (status)
    WHERE status = 'awaiting_approval'
  `);

  // ── fix_history ────────────────────────────────────────────────────────────
  // Stores successful fix patterns for cross-issue learning.
  await db.query(`
    CREATE TABLE IF NOT EXISTS fix_history (
      id             BIGSERIAL PRIMARY KEY,
      owner          TEXT NOT NULL,
      repo           TEXT NOT NULL,
      issue_number   INTEGER NOT NULL,
      category       TEXT NOT NULL,
      strategy       TEXT NOT NULL,
      files_changed  TEXT[] NOT NULL DEFAULT '{}',
      summary        TEXT NOT NULL,
      approach       TEXT NOT NULL,
      pr_url         TEXT,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS fix_history_category_idx
    ON fix_history (category, strategy)
  `);

  // ── pr_reviews ─────────────────────────────────────────────────────────────
  // Stores the AI review result for each PR so the UI can display findings and
  // so the fix-pr service can load them when the user approves a fix.
  await db.query(`
    CREATE TABLE IF NOT EXISTS pr_reviews (
      id              BIGSERIAL PRIMARY KEY,
      owner           TEXT NOT NULL,
      repo            TEXT NOT NULL,
      pr_number       INTEGER NOT NULL,
      pr_title        TEXT,
      head_sha        TEXT,
      head_branch     TEXT,
      summary         TEXT NOT NULL,
      verdict         TEXT NOT NULL CHECK (verdict IN ('APPROVE','REQUEST_CHANGES','COMMENT')),
      comments        JSONB NOT NULL DEFAULT '[]',
      fix_status      TEXT NOT NULL DEFAULT 'none'
                        CHECK (fix_status IN ('none','pending','running','done','failed')),
      fix_pr_url      TEXT,
      fix_branch      TEXT,
      installation_id INTEGER,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (owner, repo, pr_number)
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS pr_reviews_repo_idx
    ON pr_reviews (owner, repo)
  `);

  logger.info('Schema ready', { embeddingDim: EMBEDDING_DIM });
}

// ─── Dimension migration ──────────────────────────────────────────────────────

async function migrateDimension(): Promise<void> {
  type DimRow = { atttypmod: number };

  const result = await db.query<DimRow>(`
    SELECT atttypmod
    FROM   pg_attribute
    WHERE  attrelid = 'code_chunks'::regclass
      AND  attname  = 'embedding'
      AND  attnum   > 0
      AND  NOT attisdropped
  `);

  if (result.rows.length === 0) return; // column doesn't exist yet

  // pgvector encodes dimension as atttypmod - 1 (implementation detail)
  const currentDim = result.rows[0].atttypmod - 1;

  if (currentDim !== EMBEDDING_DIM) {
    logger.warn('Embedding dimension mismatch — migrating', {
      current: currentDim,
      target: EMBEDDING_DIM,
    });
    // Must drop index first, then alter column
    await db.query('DROP INDEX IF EXISTS code_chunks_embedding_hnsw');
    await db.query(
      `ALTER TABLE code_chunks ALTER COLUMN embedding TYPE VECTOR(${EMBEDDING_DIM})`,
    );
    logger.info('Embedding column migrated', { newDim: EMBEDDING_DIM });
  }
}

// ─── HNSW search-time tuning ──────────────────────────────────────────────────
// Higher ef_search = better recall, slower query.
// 100 is a good default for code search.

export async function setSearchEffort(efSearch: number = 100): Promise<void> {
  await db.query(`SET hnsw.ef_search = ${efSearch}`);
}
