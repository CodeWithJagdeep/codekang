// ─── Database Row Types ───────────────────────────────────────────────────────

export interface RepoRow {
  id: string;
  owner: string;
  name: string;
  full_name: string;
  default_branch: string;
  language: string | null;
  indexed_at: Date | null;
  created_at: Date;
}

export interface FixJobRow {
  id: string;
  repo_id: string;
  issue_number: number;
  issue_title: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  branch_name: string | null;
  pr_number: number | null;
  pr_url: string | null;
  error: string | null;
  cost_usd: number | null;
  started_at: Date | null;
  finished_at: Date | null;
  created_at: Date;
}

export interface CodeChunkRow {
  id: string;
  repo_id: string;
  file_path: string;
  start_line: number;
  end_line: number;
  content: string;
  language: string;
  token_count: number;
  embedding: string; // pgvector format "[0.1,0.2,...]"
  created_at: Date;
}
