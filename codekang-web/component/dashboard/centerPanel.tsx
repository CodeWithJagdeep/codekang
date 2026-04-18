'use client';

import { useState } from 'react';
import {
  GitPullRequest,
  AlertCircle,
  Activity,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ChevronRight,
  Loader2,
  ExternalLink,
} from 'lucide-react';

type Tab = 'issues' | 'prs' | 'activity' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'prs', label: 'Pull Requests', icon: GitPullRequest },
  { id: 'issues', label: 'Issues', icon: AlertCircle },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const PRS = [
  {
    id: 142,
    title: 'feat: Implement AI-powered code review feedback',
    branch: 'feat/ai-review',
    author: 'Alex R.',
    time: '2 min ago',
    kangStatus: 'clean',
    kangMsg: 'No blocking issues found',
    filesChanged: 8,
  },
  {
    id: 141,
    title: 'fix: Resolve critical security vulnerability in auth',
    branch: 'hotfix/auth-vulnerability',
    author: 'Sarah K.',
    time: '14 min ago',
    kangStatus: 'attention',
    kangMsg: 'Needs attention — 2 critical issues',
    filesChanged: 3,
  },
  {
    id: 140,
    title: 'docs: Update API documentation for new endpoints',
    branch: 'docs/api-updates',
    author: 'John L.',
    time: '1 hour ago',
    kangStatus: 'reviewing',
    kangMsg: 'KangBot is reviewing...',
    filesChanged: 12,
  },
  {
    id: 139,
    title: 'refactor: Move auth middleware to shared library',
    branch: 'refactor/auth-middleware',
    author: 'Priya S.',
    time: '3 hours ago',
    kangStatus: 'clean',
    kangMsg: 'All checks passed',
    filesChanged: 5,
  },
];

const ISSUES = [
  {
    id: 56,
    title: 'Redis connection timeout in high-load scenarios',
    labels: ['bug', 'critical'],
    time: '30 min ago',
    kangStatus: 'fixing',
    kangMsg: 'KangBot is analyzing the fix...',
  },
  {
    id: 55,
    title: 'Add rate limiting to AI orchestration endpoint',
    labels: ['enhancement'],
    time: '2 hours ago',
    kangStatus: 'pending',
    kangMsg: 'Queued for KangBot review',
  },
  {
    id: 54,
    title: 'Docker build fails for ai-agent on arm64',
    labels: ['bug', 'docker'],
    time: '4 hours ago',
    kangStatus: 'fixed',
    kangMsg: 'PR #138 created by KangBot',
  },
];

const ACTIVITY = [
  {
    icon: '🔍',
    text: "KangBot researched 'Redis cluster failover' using browser agent",
    time: '2 min ago',
    color: 'text-accent-blue',
  },
  {
    icon: '✅',
    text: 'PR #142 review complete — No blocking issues',
    time: '5 min ago',
    color: 'text-accent-green',
  },
  {
    icon: '⚡',
    text: 'KangBot opened PR #141 for auth vulnerability fix',
    time: '18 min ago',
    color: 'text-brand',
  },
  {
    icon: '⚠️',
    text: 'Issue #56 escalated — retry count exceeded Redis timeout',
    time: '32 min ago',
    color: 'text-accent-orange',
  },
  {
    icon: '📦',
    text: 'Repository codekang-platform indexed — 2,841 code chunks',
    time: '1 hour ago',
    color: 'text-accent-purple',
  },
  {
    icon: '🤖',
    text: 'KangBot started monitoring automous-ai repo',
    time: '2 hours ago',
    color: 'text-ink-muted',
  },
];

function KangStatusBadge({ status, msg }: { status: string; msg: string }) {
  const map: Record<
    string,
    { icon: React.ElementType; color: string; bg: string }
  > = {
    clean: {
      icon: CheckCircle2,
      color: 'text-accent-green',
      bg: 'bg-accent-green/10 border-accent-green/20',
    },
    attention: {
      icon: XCircle,
      color: 'text-accent-red',
      bg: 'bg-accent-red/10 border-accent-red/20',
    },
    reviewing: {
      icon: Loader2,
      color: 'text-accent-blue',
      bg: 'bg-accent-blue/10 border-accent-blue/20',
    },
    fixing: {
      icon: Loader2,
      color: 'text-accent-orange',
      bg: 'bg-accent-orange/10 border-accent-orange/20',
    },
    pending: {
      icon: Clock,
      color: 'text-ink-soft',
      bg: 'bg-bg-muted border-border',
    },
    fixed: {
      icon: CheckCircle2,
      color: 'text-brand',
      bg: 'bg-brand-dim border-brand/20',
    },
  };
  const cfg = map[status] ?? map['pending'];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2 py-1 rounded-md border ${cfg.bg} ${cfg.color}`}
    >
      <Icon
        size={11}
        strokeWidth={2}
        className={
          status === 'reviewing' || status === 'fixing' ? 'kangbot-pulse' : ''
        }
      />
      {msg}
    </span>
  );
}

function LabelChip({ label }: { label: string }) {
  const colors: Record<string, string> = {
    bug: 'bg-red-500/10 text-red-400 border-red-500/20',
    critical: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    enhancement: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    docker: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  };
  return (
    <span
      className={`text-[10.5px] font-medium px-1.5 py-0.5 rounded border ${colors[label] ?? 'bg-bg-muted text-ink-muted border-border'}`}
    >
      {label}
    </span>
  );
}

export default function CenterPanel({
  repoId,
  onSelectPR,
  selectedPR,
}: {
  repoId: string;
  onSelectPR: (id: number) => void;
  selectedPR: number | null;
}) {
  const [tab, setTab] = useState<Tab>('prs');

  return (
    <section
      className="flex-1 min-w-0 flex flex-col h-screen border-r border-border"
      style={{ background: 'var(--bg)' }}
    >
      {/* Top Header */}
      <div className="h-[56px] border-b border-border flex items-center px-5 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <GitPullRequest
            size={15}
            className="text-ink-muted shrink-0"
            strokeWidth={1.8}
          />
          <span className="text-[13px] text-ink-muted">CodeWithJagdeep</span>
          <ChevronRight size={13} className="text-ink-soft" strokeWidth={2} />
          <span className="text-[13px] font-semibold text-ink truncate">
            {repoId}
          </span>
        </div>
        <a
          href={`https://github.com/CodeWithJagdeep/${repoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-[11.5px] text-ink-soft hover:text-ink transition-colors"
        >
          <ExternalLink size={12} strokeWidth={1.8} />
          GitHub
        </a>
      </div>

      {/* Tab Bar */}
      <div
        className="border-b border-border flex items-center px-4 gap-1 h-[44px]"
        style={{ background: 'var(--bg-subtle)' }}
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12.5px] font-medium transition-colors ${
                tab === t.id
                  ? 'bg-bg-muted text-ink border border-border'
                  : 'text-ink-muted hover:text-ink hover:bg-bg-muted'
              }`}
            >
              <Icon size={13} strokeWidth={1.8} />
              {t.label}
              {t.id === 'prs' && (
                <span className="ml-0.5 bg-accent-blue/20 text-accent-blue text-[10px] font-bold px-1 rounded">
                  {PRS.length}
                </span>
              )}
              {t.id === 'issues' && (
                <span className="ml-0.5 bg-accent-red/20 text-accent-red text-[10px] font-bold px-1 rounded">
                  {ISSUES.length}
                </span>
              )}
            </button>
          );
        })}

        {/* Search */}
        <div className="ml-auto flex items-center gap-1.5 border border-border rounded-md px-2.5 py-1 bg-bg-muted w-[180px]">
          <Search size={12} className="text-ink-soft" strokeWidth={1.8} />
          <input
            className="flex-1 bg-transparent text-[12px] text-ink placeholder:text-ink-soft outline-none"
            placeholder={`Search ${tab === 'prs' ? 'pull requests' : 'issues'}...`}
          />
          <Filter size={11} className="text-ink-soft" strokeWidth={1.8} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Pull Requests Tab */}
        {tab === 'prs' && (
          <div className="divide-y divide-border-subtle">
            {PRS.map((pr) => (
              <div
                key={pr.id}
                onClick={() => onSelectPR(pr.id)}
                className={`px-5 py-4 cursor-pointer transition-colors ${
                  selectedPR === pr.id ? 'bg-bg-subtle' : 'hover:bg-bg-subtle'
                }`}
              >
                <div className="flex items-start gap-3">
                  <GitPullRequest
                    size={15}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-accent-green"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-medium text-ink leading-snug">
                        {pr.title}
                      </span>
                      <span className="text-[12px] text-ink-soft font-mono shrink-0">
                        #{pr.id}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11.5px] text-ink-soft">
                      <span className="font-mono bg-bg-muted px-1.5 py-0.5 rounded border border-border">
                        {pr.branch}
                      </span>
                      <span>→ main</span>
                      <span>by {pr.author}</span>
                      <span>·</span>
                      <span>{pr.time}</span>
                      <span>·</span>
                      <span>{pr.filesChanged} files</span>
                    </div>
                    <div className="mt-2.5">
                      <KangStatusBadge
                        status={pr.kangStatus}
                        msg={pr.kangMsg}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Issues Tab */}
        {tab === 'issues' && (
          <div className="divide-y divide-border-subtle">
            {ISSUES.map((issue) => (
              <div
                key={issue.id}
                className="px-5 py-4 hover:bg-bg-subtle transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={15}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-accent-red"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-medium text-ink">
                        {issue.title}
                      </span>
                      <span className="text-[12px] text-ink-soft font-mono shrink-0">
                        #{issue.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {issue.labels.map((l) => (
                        <LabelChip key={l} label={l} />
                      ))}
                      <span className="text-[11.5px] text-ink-soft ml-1">
                        {issue.time}
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <KangStatusBadge
                        status={issue.kangStatus}
                        msg={issue.kangMsg}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Tab */}
        {tab === 'activity' && (
          <div className="px-5 py-4 space-y-1">
            <div className="text-[12px] text-ink-soft uppercase tracking-wider font-semibold mb-4">
              KangBot Live Activity
            </div>
            {ACTIVITY.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2.5 border-l-2 border-border pl-4 ml-2"
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <div className="flex-1">
                  <p className={`text-[12.5px] ${item.color}`}>{item.text}</p>
                  <span className="text-[11px] text-ink-soft">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="px-5 py-6 max-w-lg space-y-6">
            <div>
              <h3 className="text-[14px] font-semibold text-ink mb-3">
                KangBot Auto-Fix
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: 'Auto-fix bug issues',
                    sub: 'KangBot opens a PR when a fix is ready',
                    enabled: true,
                  },
                  {
                    label: 'Review all PRs',
                    sub: 'KangBot adds inline comments to every PR',
                    enabled: true,
                  },
                  {
                    label: 'Human approval before PR',
                    sub: 'Require your approval before KangBot opens PRs',
                    enabled: false,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border bg-bg-subtle"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-ink">
                        {s.label}
                      </div>
                      <div className="text-[11.5px] text-ink-muted mt-0.5">
                        {s.sub}
                      </div>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full cursor-pointer shrink-0 mt-0.5 ${s.enabled ? 'bg-brand' : 'bg-bg-muted border border-border'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
