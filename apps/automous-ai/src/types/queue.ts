// ─── BullMQ Job Data Types ────────────────────────────────────────────────────

export interface IndexJobData {
  owner: string;
  repo: string;
  installationId?: number;
  triggeredBy: 'webhook' | 'manual';
}

export interface FixJobData {
  owner: string;
  repo: string;
  issueNumber: number;
  issueTitle: string;
  issueBody: string;
  installationId?: number;
  triggeredAt: string; // ISO string
}

export interface ExecuteFixJobData {
  owner: string;
  repo: string;
  issueNumber: number;
  approvedBy: string; // GitHub login of contributor who approved
  triggeredAt: string;
  installationId?: number;
}

export type JobName = 'index-repo' | 'fix-issue' | 'execute-fix';

export interface JobResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export type JobStatus =
  | 'waiting'
  | 'active'
  | 'completed'
  | 'failed'
  | 'delayed'
  | 'paused';

export interface JobStatusResponse {
  jobId: string;
  name: JobName;
  status: JobStatus;
  progress: number;
  result?: JobResult;
  error?: string;
  createdAt: number;
  processedAt?: number;
  finishedAt?: number;
  attempts: number;
}
