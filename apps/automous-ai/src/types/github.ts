// ─── GitHub Types ─────────────────────────────────────────────────────────────

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  labels: GitHubLabel[];
  assignees: GitHubUser[];
  user: GitHubUser;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
  language: string | null;
}

export interface GitHubIssueComment {
  id: number;
  body: string;
  user: GitHubUser;
  created_at: string;
  html_url: string;
}

export interface GitHubCheckRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion:
    | 'success'
    | 'failure'
    | 'neutral'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | null;
}

export interface GitHubPullRequestWebhook {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  head: { ref: string; sha: string; label: string };
  base: { ref: string; sha: string; label: string };
  user: GitHubUser;
  draft: boolean;
  merged: boolean;
}

export interface GitHubWebhookPayload {
  action: string;
  issue?: GitHubIssue;
  comment?: GitHubIssueComment;
  pull_request?: GitHubPullRequestWebhook;
  repository: GitHubRepository;
  sender: GitHubUser;
  installation?: { id: number };
  number?: number;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  html_url: string;
  head: { ref: string; sha: string };
  base: { ref: string; sha: string };
}
