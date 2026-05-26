// ─── Agent Types ──────────────────────────────────────────────────────────────

export type IssueCategory =
  | 'bug'
  | 'ui-bug'
  | 'feature'
  | 'documentation'
  | 'performance'
  | 'security'
  | 'test'
  | 'refactor'
  | 'unknown';

export type FixStrategy =
  | 'code_change'
  | 'test_fix'
  | 'config_change'
  | 'documentation'
  | 'cannot_fix';

export type AgentStepType =
  // Lightweight GitHub API tools (no clone needed)
  | 'gh_read_file'
  | 'gh_list_dir'
  | 'gh_tree'
  | 'gh_search'
  | 'gh_create_branch'
  | 'gh_commit_files'
  | 'gh_open_pr'
  // Escalation
  | 'request_clone'
  | 'request_sandbox'
  // Code reading / exploration (requires clone)
  | 'read_file'
  | 'write_file'
  | 'list_directory'
  | 'get_file_tree'
  | 'search_files'
  | 'get_package_info'
  | 'vector_search'
  | 'search_by_symbol'
  | 'search_by_file'
  // Execution (requires sandbox)
  | 'run_command'
  | 'run_file'
  | 'write_and_run'
  // Autonomous actions
  | 'run_tests'
  | 'run_related_tests'
  | 'open_pr'
  | 'post_comment'
  // Browser
  | 'browser_open'
  | 'browser_navigate'
  | 'browser_click'
  | 'browser_type'
  | 'browser_get_content'
  | 'browser_screenshot'
  | 'browser_close'
  // Control
  | 'think'
  | 'finish';

/**
 * How CodeKang should respond to this issue:
 * - fix      : AI will propose + apply a code change
 * - guide    : AI can't safely fix but will post a step-by-step contributor guide
 * - discuss  : Feature / design decision — notify maintainers to discuss
 * - clarify  : Issue is too vague — ask for more information
 */
export type IssueResponseType = 'fix' | 'guide' | 'discuss' | 'clarify';

export interface ClassificationResult {
  category: IssueCategory;
  strategy: FixStrategy;
  confidence: number; // 0-1
  reasoning: string;
  isActionable: boolean;
  estimatedComplexity: 'low' | 'medium' | 'high';
  responseType: IssueResponseType;
  /**
   * Whether this fix needs a Docker sandbox, dependency install, and test run
   * to verify correctness. False for simple edits (typos, docs, obvious
   * single-line logic) that don't require executing the code.
   */
  needsEnvironment: boolean;
}

export interface AgentStep {
  type: AgentStepType;
  input: Record<string, unknown>;
  output?: string;
  error?: string;
  durationMs?: number;
}

export interface AgentResult {
  success: boolean;
  steps: AgentStep[];
  filesModified: string[];
  summary: string;
  error?: string;
  prUrl?: string;
  lastTestOutput?: string;
  totalCost: number;
  totalTokens: number;
  durationMs: number;
}

export interface FixContext {
  issueNumber: number;
  issueTitle: string;
  issueBody: string;
  repoOwner: string;
  repoName: string;
  repoPath?: string; // local clone path — only set after request_clone escalation
  branchName: string;
  classification: ClassificationResult;
  /** User ID for real-time progress events via Socket.IO */
  userId?: string;
  /** BullMQ job ID for correlating socket events with jobs */
  jobId?: string;
  /** Root cause summary from the analysis pass — injected before fix run */
  analysisSummary?: string;
  /** Test failure output from a previous fix attempt — injected on retry */
  priorTestFailure?: string;
  /** Similar past fix patterns from cross-issue learning */
  learningContext?: string;
  /** Full history of prior autonomous attempts — for retry-with-different-strategy */
  priorAttempts?: Array<{ summary: string; testOutput: string }>;
  /** Files changed in the PR being fixed — used by run_related_tests to avoid full suite */
  changedFiles?: string[];
  /** Pre-retrieved multi-source context (code + standards + issues) injected at agent start */
  retrievedContext?: string;
}
