export interface IRepository {
  id: string;
  userId: string;
  githubId: number;
  owner: string;
  name: string;
  fullName: string;
  description?: string;
  private: boolean;
  defaultBranch: string;
  language?: string;
  stargazersCount: number;
  isInstalled: boolean;
  webhookId?: number;
  installationId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  owner: { login: string };
  html_url: string;
  updated_at: string;
}

export interface IGitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  labels: { name: string; color: string }[];
  user: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  pull_request?: { url: string };
}

export interface IGitHubPR {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  head: { ref: string; sha: string };
  base: { ref: string };
  user: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  html_url: string;
  draft: boolean;
}
