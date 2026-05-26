import { db } from '../config/database';
import { logger } from '../utils/logger';
import { ensureLanceTables } from './lance/tables';

// ─── Schema setup ─────────────────────────────────────────────────────────────
// PostgreSQL: owns all relational tables (repos, fix_jobs, pr_reviews, etc.)
// LanceDB: owns all vector tables (code_chunks, pr_history, issue_context, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export async function ensureSchema(): Promise<void> {
  logger.info('Ensuring database schema');

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

  // ── LanceDB vector tables ──────────────────────────────────────────────────
  await ensureLanceTables();

  logger.info('Schema ready (Postgres relational + LanceDB vector)');
}
