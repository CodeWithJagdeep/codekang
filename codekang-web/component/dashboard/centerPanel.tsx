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
  Loader2,
  ExternalLink,
  ChevronRight,
  Plus,
  Zap,
} from 'lucide-react';
import type { Repo } from './sidebar';

type Tab = 'prs' | 'issues' | 'activity' | 'settings';

/* ── Tab definitions matching sidebar nav style ──────────────────────────── */
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
    files: 8,
  },
  {
    id: 141,
    title: 'fix: Resolve critical security vulnerability',
    branch: 'hotfix/auth-vulnerability',
    author: 'Sarah K.',
    time: '14 min ago',
    kangStatus: 'attention',
    kangMsg: 'Needs attention — 2 critical',
    files: 3,
  },
  {
    id: 140,
    title: 'docs: Update API documentation',
    branch: 'docs/api-updates',
    author: 'John L.',
    time: '1 hour ago',
    kangStatus: 'reviewing',
    kangMsg: 'KangBot is reviewing...',
    files: 12,
  },
  {
    id: 139,
    title: 'refactor: Move auth middleware to shared lib',
    branch: 'refactor/auth-middleware',
    author: 'Priya S.',
    time: '3 hours ago',
    kangStatus: 'clean',
    kangMsg: 'All checks passed',
    files: 5,
  },
];

const ISSUES = [
  {
    id: 56,
    title: 'Redis connection timeout in high-load scenarios',
    labels: ['bug', 'critical'],
    time: '30 min ago',
    kangStatus: 'fixing',
    kangMsg: 'KangBot analyzing fix...',
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
    text: "Researched 'Redis cluster failover' via browser agent",
    time: '2 min ago',
  },
  {
    icon: '✅',
    text: 'PR #142 review complete — No blocking issues',
    time: '5 min ago',
  },
  {
    icon: '⚡',
    text: 'KangBot opened PR #141 for auth vulnerability fix',
    time: '18 min ago',
  },
  {
    icon: '⚠️',
    text: 'Issue #56 escalated — retry count exceeded Redis limit',
    time: '32 min ago',
  },
  {
    icon: '📦',
    text: 'Repository indexed — 2,841 code chunks',
    time: '1 hour ago',
  },
];

/* ── Status badge — monochrome palette to match sidebar ─────────────────── */
const STATUS_MAP: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  clean: {
    icon: CheckCircle2,
    color: '#e8e8e8',
    bg: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.1)',
  },
  attention: {
    icon: XCircle,
    color: '#e11d48',
    bg: 'rgba(225,29,72,0.1)',
    border: 'rgba(225,29,72,0.25)',
  },
  reviewing: {
    icon: Loader2,
    color: '#aaaaaa',
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.08)',
  },
  fixing: {
    icon: Loader2,
    color: '#aaaaaa',
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.08)',
  },
  pending: {
    icon: Clock,
    color: '#777777',
    bg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.06)',
  },
  fixed: {
    icon: CheckCircle2,
    color: '#e8e8e8',
    bg: 'rgba(225,29,72,0.08)',
    border: 'rgba(225,29,72,0.2)',
  },
};

function StatusBadge({ status, msg }: { status: string; msg: string }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP['pending'];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md"
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <Icon
        size={10}
        strokeWidth={2}
        className={
          status === 'reviewing' || status === 'fixing' ? 'kangpulse' : ''
        }
      />
      {msg}
    </span>
  );
}

/* ── Overview page ───────────────────────────────────────────────────────── */
function Overview({
  repos,
  onSelectRepo,
  onAddRepo,
}: {
  repos: Repo[];
  onSelectRepo: (id: string) => void;
  onAddRepo: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-10 pt-12 pb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <Zap size={16} style={{ color: '#e11d48' }} strokeWidth={2.5} />
          <h1 className="text-[20px] font-bold" style={{ color: '#e8e8e8' }}>
            Dashboard Overview
          </h1>
        </div>
        <p className="text-[13px]" style={{ color: '#777' }}>
          Select a repository to view issues, pull requests, and KangBot
          activity.
        </p>
      </div>

      {/* Stats */}
      <div className="px-10 grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Connected Repos', value: repos.length },
          {
            label: 'Open Pull Requests',
            value: repos.reduce((s, r) => s + r.prs, 0),
          },
          {
            label: 'Open Issues',
            value: repos.reduce((s, r) => s + r.issues, 0),
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ background: '#141414', border: '1px solid #2a2a2a' }}
          >
            <div className="text-[26px] font-bold" style={{ color: '#e8e8e8' }}>
              {s.value}
            </div>
            <div className="text-[12px] mt-0.5" style={{ color: '#777' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Repo list */}
      <div className="px-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold" style={{ color: '#aaa' }}>
            Connected Repositories
          </h2>
          <button
            onClick={onAddRepo}
            className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: '#e11d48', color: '#fff' }}
          >
            <Plus size={12} strokeWidth={2.5} /> Add Repository
          </button>
        </div>
        <div className="space-y-2">
          {repos.map((repo) => (
            <button
              key={repo.id}
              onClick={() => onSelectRepo(repo.id)}
              className="w-full text-left rounded-xl px-5 py-4 transition-colors group hover:bg-white/[0.03]"
              style={{ background: '#111', border: '1px solid #2a2a2a' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ background: '#e11d48' }}
                  >
                    {repo.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div
                      className="text-[13px] font-semibold"
                      style={{ color: '#e8e8e8' }}
                    >
                      {repo.name}
                    </div>
                    <div className="text-[11.5px]" style={{ color: '#666' }}>
                      {repo.org} · {repo.branch}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center gap-1.5 text-[12px]"
                    style={{ color: '#777' }}
                  >
                    <GitPullRequest size={12} strokeWidth={2} /> {repo.prs} PRs
                  </div>
                  <div
                    className="flex items-center gap-1.5 text-[12px]"
                    style={{ color: '#777' }}
                  >
                    <AlertCircle size={12} strokeWidth={2} /> {repo.issues}{' '}
                    Issues
                  </div>
                  <ChevronRight
                    size={13}
                    style={{ color: '#555' }}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Repo detail ─────────────────────────────────────────────────────────── */
function RepoDetail({
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
    <>
      {/* Repo header */}
      <div
        className="h-[52px] flex items-center px-5 gap-2 shrink-0"
        style={{ borderBottom: '1px solid #2a2a2a', background: '#111' }}
      >
        <GitPullRequest size={13} strokeWidth={1.8} style={{ color: '#666' }} />
        <span className="text-[12.5px]" style={{ color: '#777' }}>
          CodeWithJagdeep
        </span>
        <ChevronRight size={11} strokeWidth={2} style={{ color: '#555' }} />
        <span
          className="text-[13px] font-semibold"
          style={{ color: '#e8e8e8' }}
        >
          {repoId}
        </span>
        <a
          href={`https://github.com/CodeWithJagdeep/${repoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-[11px] hover:opacity-70 transition-opacity"
          style={{ color: '#666' }}
        >
          <ExternalLink size={11} strokeWidth={1.8} /> GitHub
        </a>
      </div>

      {/* Tab bar — same style as sidebar nav items */}
      <div
        className="flex items-center px-3 gap-0.5 shrink-0 h-[44px]"
        style={{ borderBottom: '1px solid #2a2a2a', background: '#0d0d0d' }}
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12.5px] transition-colors"
              style={{
                background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: active ? '#e8e8e8' : '#777',
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon size={13} strokeWidth={1.7} />
              {t.label}
              {t.id === 'prs' && (
                <span
                  className="ml-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(225,29,72,0.2)',
                    color: '#e11d48',
                  }}
                >
                  {PRS.length}
                </span>
              )}
              {t.id === 'issues' && (
                <span
                  className="ml-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#999',
                  }}
                >
                  {ISSUES.length}
                </span>
              )}
            </button>
          );
        })}

        {/* Search */}
        <div
          className="ml-auto flex items-center gap-1.5 rounded-md px-2 py-1"
          style={{
            background: '#111',
            border: '1px solid #2a2a2a',
            width: 160,
          }}
        >
          <Search size={11} style={{ color: '#555' }} strokeWidth={1.8} />
          <input
            className="flex-1 bg-transparent text-[11px] outline-none"
            placeholder="Search..."
            style={{ color: '#e8e8e8' }}
          />
          <Filter size={10} style={{ color: '#555' }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── PRs ── */}
        {tab === 'prs' && (
          <div>
            {PRS.map((pr) => (
              <div
                key={pr.id}
                onClick={() => onSelectPR(pr.id)}
                className="px-5 py-4 cursor-pointer transition-colors"
                style={{
                  borderBottom: '1px solid #1a1a1a',
                  background: selectedPR === pr.id ? '#141414' : 'transparent',
                }}
              >
                <div className="flex items-start gap-3">
                  {/* PR icon — white/muted, not green */}
                  <GitPullRequest
                    size={14}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0"
                    style={{ color: '#888' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span
                        className="text-[13px] font-medium"
                        style={{ color: '#e8e8e8' }}
                      >
                        {pr.title}
                      </span>
                      <span
                        className="text-[11px] font-mono shrink-0"
                        style={{ color: '#555' }}
                      >
                        #{pr.id}
                      </span>
                    </div>
                    <div
                      className="flex flex-wrap items-center gap-2 mt-1 text-[11px]"
                      style={{ color: '#666' }}
                    >
                      <span
                        className="font-mono px-1.5 py-0.5 rounded text-[10.5px]"
                        style={{
                          background: '#1a1a1a',
                          border: '1px solid #2a2a2a',
                        }}
                      >
                        {pr.branch}
                      </span>
                      <span>→ main</span>
                      <span>·</span>
                      <span>{pr.author}</span>
                      <span>·</span>
                      <span>{pr.time}</span>
                      <span>·</span>
                      <span>{pr.files} files</span>
                    </div>
                    <div className="mt-2.5">
                      <StatusBadge status={pr.kangStatus} msg={pr.kangMsg} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Issues ── */}
        {tab === 'issues' && (
          <div>
            {ISSUES.map((issue) => (
              <div
                key={issue.id}
                className="px-5 py-4 cursor-pointer transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: '1px solid #1a1a1a' }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={14}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0"
                    style={{ color: '#888' }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[13px] font-medium"
                        style={{ color: '#e8e8e8' }}
                      >
                        {issue.title}
                      </span>
                      <span
                        className="text-[11px] font-mono"
                        style={{ color: '#555' }}
                      >
                        #{issue.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {issue.labels.map((l) => (
                        <span
                          key={l}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                          style={{
                            color: '#999',
                            background: '#1a1a1a',
                            border: '1px solid #2a2a2a',
                          }}
                        >
                          {l}
                        </span>
                      ))}
                      <span
                        className="text-[11px] ml-1"
                        style={{ color: '#666' }}
                      >
                        {issue.time}
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <StatusBadge
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

        {/* ── Activity ── */}
        {tab === 'activity' && (
          <div className="px-5 py-5">
            <div
              className="text-[10.5px] font-semibold uppercase tracking-wider mb-4"
              style={{ color: '#555' }}
            >
              KangBot Live Activity
            </div>
            {ACTIVITY.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-3 border-l-2 pl-4 ml-2"
                style={{ borderColor: '#2a2a2a' }}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <div>
                  <p className="text-[12.5px]" style={{ color: '#aaa' }}>
                    {item.text}
                  </p>
                  <span className="text-[10.5px]" style={{ color: '#555' }}>
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Settings ── */}
        {tab === 'settings' && (
          <div className="px-6 py-6 max-w-md space-y-3">
            <h3
              className="text-[13px] font-semibold mb-4"
              style={{ color: '#aaa' }}
            >
              KangBot Auto-Fix Settings
            </h3>
            {[
              { label: 'Auto-fix bug issues', enabled: true },
              { label: 'Review all PRs automatically', enabled: true },
              { label: 'Require human approval before PR', enabled: false },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: '#111', border: '1px solid #2a2a2a' }}
              >
                <span className="text-[12.5px]" style={{ color: '#ccc' }}>
                  {s.label}
                </span>
                <div
                  className="w-9 h-5 rounded-full cursor-pointer"
                  style={{
                    background: s.enabled ? '#e11d48' : '#222',
                    border: '1px solid #333',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ── CenterPanel export ──────────────────────────────────────────────────── */
export default function CenterPanel({
  activeNav,
  selectedRepo,
  onSelectRepo,
  onSelectPR,
  selectedPR,
  repos,
  onAddRepo,
}: {
  activeNav: string;
  selectedRepo: string | null;
  onSelectRepo: (id: string) => void;
  onSelectPR: (id: number) => void;
  selectedPR: number | null;
  repos: Repo[];
  onAddRepo: () => void;
}) {
  return (
    <section
      className="flex-1 min-w-0 flex flex-col h-screen"
      style={{ background: '#0d0d0d', borderRight: '1px solid #2a2a2a' }}
    >
      {activeNav === 'overview' || !selectedRepo ? (
        <Overview
          repos={repos}
          onSelectRepo={onSelectRepo}
          onAddRepo={onAddRepo}
        />
      ) : (
        <RepoDetail
          repoId={selectedRepo}
          onSelectPR={onSelectPR}
          selectedPR={selectedPR}
        />
      )}
    </section>
  );
}
