'use client';

import { useSocketContext } from '@/component/SocketProvider';
import type { AgentJobEvent, AgentStepEvent } from '@/lib/socket';
import { useEffect, useRef } from 'react';
import {
  Bot,
  CheckCircle2,
  XCircle,
  Loader2,
  GitPullRequest,
  ChevronRight,
  Wrench,
} from 'lucide-react';

// ─── Tool icon map ─────────────────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  gh_tree: 'Read repo structure',
  gh_read_file: 'Read file via API',
  gh_list_dir: 'List directory',
  gh_search: 'Search codebase',
  gh_commit_files: 'Commit changes',
  gh_open_pr: 'Open pull request',
  request_clone: 'Clone repository',
  request_sandbox: 'Start Docker sandbox',
  read_file: 'Read file',
  write_file: 'Write file',
  search_files: 'Search files',
  vector_search: 'Semantic search',
  search_by_symbol: 'Find symbol',
  get_file_tree: 'Get file tree',
  get_package_info: 'Read package manifest',
  open_pr: 'Open pull request',
  run_command: 'Run command',
  run_file: 'Run file',
  write_and_run: 'Write & run script',
  run_tests: 'Run test suite',
  think: 'Thinking',
  finish: 'Finished',
  post_comment: 'Post comment',
  browser_open: 'Open browser',
  browser_click: 'Click element',
  browser_type: 'Type into input',
  browser_screenshot: 'Take screenshot',
  browser_navigate: 'Navigate page',
  browser_close: 'Close browser',
};

function toolLabel(name: string): string {
  return TOOL_LABELS[name] ?? name;
}

// ─── Step row ──────────────────────────────────────────────────────────────────

function StepRow({ step }: { step: AgentStepEvent }) {
  const isRunning = step.status === 'running';
  const isError = step.status === 'error';

  return (
    <div className="flex items-start gap-2 py-1 text-sm">
      <span className="mt-0.5 shrink-0">
        {isRunning ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
        ) : isError ? (
          <XCircle className="h-3.5 w-3.5 text-red-400" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        )}
      </span>
      <span className="text-[#a1a1aa] min-w-0">
        <span className={isRunning ? 'text-white' : ''}>{toolLabel(step.toolName)}</span>
        {step.durationMs != null && !isRunning && (
          <span className="ml-1 text-xs text-[#52525b]">
            {step.durationMs < 1000
              ? `${step.durationMs}ms`
              : `${(step.durationMs / 1000).toFixed(1)}s`}
          </span>
        )}
        {step.outputPreview && step.toolName !== 'think' && (
          <span className="block truncate text-xs text-[#71717a] mt-0.5">
            {step.outputPreview}
          </span>
        )}
      </span>
    </div>
  );
}

// ─── Job card ──────────────────────────────────────────────────────────────────

function JobCard({
  job,
  steps,
}: {
  job: AgentJobEvent;
  steps: AgentStepEvent[];
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps.length]);

  const isActive = job.status === 'started';
  const isDone = job.status === 'completed';

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        {isActive ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-400 shrink-0" />
        ) : isDone ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 text-red-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {job.issueTitle ?? `Issue #${job.issueNumber}`}
          </p>
          <p className="text-xs text-[#71717a]">
            {job.repo}
            {job.issueNumber != null && ` · #${job.issueNumber}`}
            {' · '}
            <span className="capitalize">{job.phase}</span>
          </p>
        </div>
        {job.prUrl && (
          <a
            href={job.prUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 shrink-0"
          >
            <GitPullRequest className="h-3.5 w-3.5" />
            PR
            <ChevronRight className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div className="px-3 py-2 max-h-64 overflow-y-auto space-y-0.5">
          {steps.map((s, i) => (
            <StepRow key={i} step={s} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Footer message */}
      {job.message && !isActive && (
        <div className="px-3 py-2 border-t border-white/10 text-xs text-[#71717a] line-clamp-2">
          {job.message}
        </div>
      )}
    </div>
  );
}

// ─── Main feed ────────────────────────────────────────────────────────────────

interface AgentActivityFeedProps {
  /** Filter to a specific repo ("owner/repo") */
  repo?: string;
  /** Max jobs to show */
  limit?: number;
  className?: string;
}

export function AgentActivityFeed({
  repo,
  limit = 5,
  className = '',
}: AgentActivityFeedProps) {
  const { activeJobs, agentSteps, state } = useSocketContext();

  const jobs = (
    repo ? activeJobs.filter((j) => j.repo === repo) : activeJobs
  ).slice(0, limit);

  if (state === 'disconnected') return null;

  if (jobs.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-1">
        <Bot className="h-3.5 w-3.5" />
        Agent Activity
        <span className="ml-auto flex items-center gap-1 text-blue-400 normal-case tracking-normal">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Live
        </span>
      </div>
      {jobs.map((job) => (
        <JobCard
          key={job.jobId}
          job={job}
          steps={agentSteps[job.jobId] ?? []}
        />
      ))}
    </div>
  );
}

// ─── Compact badge for nav/header ────────────────────────────────────────────

export function AgentBadge() {
  const { activeJobs } = useSocketContext();
  if (activeJobs.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
      <Wrench className="h-3 w-3 animate-pulse" />
      {activeJobs.length} running
    </span>
  );
}
