'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  GitPullRequest,
  Search,
  X,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  CircleDot,
  MessageSquare,
  Bug,
  ShieldAlert,
  Sparkles,
  GitMerge,
  GitBranchPlus,
  ArrowUpRight,
  Filter,
  RotateCcw,
} from 'lucide-react';

// ── Types ──

type ReviewStatus =
  | 'all'
  | 'pending'
  | 'in_progress'
  | 'approved'
  | 'changes_requested'
  | 'critical';

interface PRReview {
  id: string;
  title: string;
  repo: string;
  author: string;
  branch: string;
  baseBranch: string;
  status:
    | 'pending'
    | 'in_progress'
    | 'approved'
    | 'changes_requested'
    | 'critical';
  aiFindings: number;
  criticalFindings: number;
  comments: number;
  additions: number;
  deletions: number;
  filesChanged: number;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  repoId: string;
}

// ── Mock Data ──

const REVIEWS: PRReview[] = [
  {
    id: 'pr-1',
    title: 'fix: resolve race condition in auth token refresh flow',
    repo: 'codekang-api',
    repoId: 'codekang-api',
    author: 'jagdeep',
    branch: 'fix/auth-race-condition',
    baseBranch: 'main',
    status: 'critical',
    aiFindings: 7,
    criticalFindings: 2,
    comments: 14,
    additions: 183,
    deletions: 47,
    filesChanged: 6,
    createdAt: '2h ago',
    updatedAt: '45m ago',
    labels: ['bug', 'security'],
  },
  {
    id: 'pr-2',
    title: 'feat: add conversational AI review interface to PR detail view',
    repo: 'codekang-web',
    repoId: 'codekang-web',
    author: 'jagdeep',
    branch: 'feat/conversational-review',
    baseBranch: 'main',
    status: 'in_progress',
    aiFindings: 3,
    criticalFindings: 0,
    comments: 8,
    additions: 642,
    deletions: 120,
    filesChanged: 12,
    createdAt: '5h ago',
    updatedAt: '1h ago',
    labels: ['feature', 'ui'],
  },
  {
    id: 'pr-3',
    title: 'chore: upgrade Next.js to 16.x and resolve breaking changes',
    repo: 'codekang-web',
    repoId: 'codekang-web',
    author: 'codekang-bot',
    branch: 'chore/nextjs-upgrade',
    baseBranch: 'main',
    status: 'pending',
    aiFindings: 5,
    criticalFindings: 1,
    comments: 0,
    additions: 214,
    deletions: 189,
    filesChanged: 23,
    createdAt: '8h ago',
    updatedAt: '8h ago',
    labels: ['dependencies'],
  },
  {
    id: 'pr-4',
    title: 'feat: implement webhook delivery retry with exponential backoff',
    repo: 'codekang-api',
    repoId: 'codekang-api',
    author: 'jagdeep',
    branch: 'feat/webhook-retry',
    baseBranch: 'dev',
    status: 'approved',
    aiFindings: 1,
    criticalFindings: 0,
    comments: 5,
    additions: 97,
    deletions: 12,
    filesChanged: 4,
    createdAt: '1d ago',
    updatedAt: '3h ago',
    labels: ['feature'],
  },
  {
    id: 'pr-5',
    title: 'fix: correct SQL injection vector in user search endpoint',
    repo: 'auth-service',
    repoId: 'auth-service',
    author: 'codekang-bot',
    branch: 'fix/sql-injection-search',
    baseBranch: 'main',
    status: 'changes_requested',
    aiFindings: 4,
    criticalFindings: 1,
    comments: 11,
    additions: 38,
    deletions: 22,
    filesChanged: 2,
    createdAt: '1d ago',
    updatedAt: '6h ago',
    labels: ['security', 'critical'],
  },
  {
    id: 'pr-6',
    title: 'refactor: migrate Redux store to Zustand across dashboard views',
    repo: 'codekang-web',
    repoId: 'codekang-web',
    author: 'jagdeep',
    branch: 'refactor/zustand-migration',
    baseBranch: 'dev',
    status: 'in_progress',
    aiFindings: 2,
    criticalFindings: 0,
    comments: 3,
    additions: 508,
    deletions: 734,
    filesChanged: 31,
    createdAt: '2d ago',
    updatedAt: '12h ago',
    labels: ['refactor'],
  },
  {
    id: 'pr-7',
    title: 'feat: add Sentry error tracking with source maps to production',
    repo: 'codekang-api',
    repoId: 'codekang-api',
    author: 'codekang-bot',
    branch: 'feat/sentry-integration',
    baseBranch: 'main',
    status: 'approved',
    aiFindings: 0,
    criticalFindings: 0,
    comments: 2,
    additions: 61,
    deletions: 5,
    filesChanged: 5,
    createdAt: '2d ago',
    updatedAt: '1d ago',
    labels: ['observability'],
  },
  {
    id: 'pr-8',
    title: 'fix: memory leak in WebSocket connection pool on idle timeout',
    repo: 'auth-service',
    repoId: 'auth-service',
    author: 'codekang-bot',
    branch: 'fix/ws-memory-leak',
    baseBranch: 'main',
    status: 'pending',
    aiFindings: 6,
    criticalFindings: 2,
    comments: 0,
    additions: 74,
    deletions: 31,
    filesChanged: 3,
    createdAt: '3d ago',
    updatedAt: '3d ago',
    labels: ['bug', 'performance'],
  },
  {
    id: 'pr-9',
    title: 'docs: update API reference for v2 endpoints and rate limits',
    repo: 'codekang-api',
    repoId: 'codekang-api',
    author: 'jagdeep',
    branch: 'docs/v2-api-reference',
    baseBranch: 'main',
    status: 'approved',
    aiFindings: 0,
    criticalFindings: 0,
    comments: 1,
    additions: 312,
    deletions: 88,
    filesChanged: 8,
    createdAt: '4d ago',
    updatedAt: '4d ago',
    labels: ['documentation'],
  },
];

const STATUS_TABS: { value: ReviewStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'changes_requested', label: 'Changes Requested' },
  { value: 'approved', label: 'Approved' },
];

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-[#71717a]',
    bg: 'bg-[#27272a] border-[#3f3f46]',
    dot: 'bg-[#71717a]',
  },
  in_progress: {
    icon: CircleDot,
    label: 'In Review',
    color: 'text-blue-400',
    bg: 'bg-blue-500/8 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  approved: {
    icon: CheckCircle2,
    label: 'Approved',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  changes_requested: {
    icon: RotateCcw,
    label: 'Changes Requested',
    color: 'text-amber-400',
    bg: 'bg-amber-500/8 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  critical: {
    icon: ShieldAlert,
    label: 'Critical',
    color: 'text-red-400',
    bg: 'bg-red-500/8 border-red-500/20',
    dot: 'bg-red-500',
  },
};

const LABEL_COLORS: Record<string, string> = {
  bug: 'bg-red-500/10 text-red-400 border-red-500/15',
  security: 'bg-orange-500/10 text-orange-400 border-orange-500/15',
  critical: 'bg-red-500/10 text-red-400 border-red-500/15',
  feature: 'bg-blue-500/10 text-blue-400 border-blue-500/15',
  ui: 'bg-purple-500/10 text-purple-400 border-purple-500/15',
  refactor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/15',
  dependencies: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/15',
  observability: 'bg-teal-500/10 text-teal-400 border-teal-500/15',
  performance: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/15',
  documentation: 'bg-[#27272a] text-[#71717a] border-[#3f3f46]',
};

const SORT_OPTIONS = [
  { value: 'updated', label: 'Last updated' },
  { value: 'created', label: 'Newest first' },
  { value: 'findings', label: 'Most findings' },
  { value: 'critical', label: 'Critical first' },
];

function StatPill({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
      <Icon size={14} className={color} strokeWidth={1.8} />
      <span className={`text-[14px] font-semibold ${color}`}>{value}</span>
      <span className="text-[12px] text-[#52525b]">{label}</span>
    </div>
  );
}

export default function ReviewsPage() {
  const [activeStatus, setActiveStatus] = useState<ReviewStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [sortOpen, setSortOpen] = useState(false);
  const [repoFilter, setRepoFilter] = useState('all');
  const [repoOpen, setRepoOpen] = useState(false);

  const repos = useMemo(
    () => ['all', ...Array.from(new Set(REVIEWS.map((r) => r.repo)))],
    [],
  );

  const filtered = useMemo(() => {
    let list = REVIEWS.filter((r) => {
      if (activeStatus !== 'all' && r.status !== activeStatus) return false;
      if (repoFilter !== 'all' && r.repo !== repoFilter) return false;
      if (
        searchQuery &&
        !r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.repo.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.branch.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });

    if (sortBy === 'findings')
      list = [...list].sort((a, b) => b.aiFindings - a.aiFindings);
    if (sortBy === 'critical')
      list = [...list].sort((a, b) => b.criticalFindings - a.criticalFindings);

    return list;
  }, [activeStatus, searchQuery, sortBy, repoFilter]);

  const counts = useMemo(
    () => ({
      all: REVIEWS.length,
      critical: REVIEWS.filter((r) => r.status === 'critical').length,
      in_progress: REVIEWS.filter((r) => r.status === 'in_progress').length,
      pending: REVIEWS.filter((r) => r.status === 'pending').length,
      changes_requested: REVIEWS.filter((r) => r.status === 'changes_requested')
        .length,
      approved: REVIEWS.filter((r) => r.status === 'approved').length,
    }),
    [],
  );

  const totalFindings = REVIEWS.reduce((s, r) => s + r.aiFindings, 0);
  const totalCritical = REVIEWS.reduce((s, r) => s + r.criticalFindings, 0);

  const selectedSort = SORT_OPTIONS.find((o) => o.value === sortBy)!;

  return (
    <div className="flex-1 flex flex-col bg-[#1c1c1c] h-dvh overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-4 md:px-8 py-4 border-b border-[#27272a]/40 shrink-0">
        <span className="text-[12px] font-medium text-[#52525b] uppercase tracking-wider">
          Reviews
        </span>
      </div>

      {/* Header */}
      <div className="px-4 md:px-8 pt-7 pb-5 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-[26px] md:text-[32px] font-semibold text-[#f4f4f5] tracking-tight leading-tight">
              Code Reviews
            </h1>
            <p className="text-[14px] text-[#71717a] mt-1.5">
              AI-powered pull request reviews across all connected repositories.
            </p>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <StatPill
              icon={GitPullRequest}
              value={counts.in_progress + counts.pending}
              label="open"
              color="text-blue-400"
            />
            <StatPill
              icon={Sparkles}
              value={totalFindings}
              label="AI findings"
              color="text-purple-400"
            />
            {totalCritical > 0 && (
              <StatPill
                icon={ShieldAlert}
                value={totalCritical}
                label="critical"
                color="text-red-400"
              />
            )}
          </div>
        </div>

        {/* Status tabs */}
        <div className="mt-6 flex items-center gap-1 p-1 bg-[#121214] rounded-xl border border-[#27272a]/60 self-start overflow-x-auto no-scrollbar w-fit">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeStatus === tab.value
                  ? 'bg-[#27272a] text-[#f4f4f5]'
                  : 'text-[#52525b] hover:text-[#a1a1aa]'
              }`}
            >
              {tab.value !== 'all' && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeStatus === tab.value
                      ? STATUS_CONFIG[tab.value as keyof typeof STATUS_CONFIG]
                          ?.dot
                      : 'bg-[#3f3f46]'
                  }`}
                />
              )}
              {tab.label}
              <span
                className={`text-[11px] ${activeStatus === tab.value ? 'text-[#71717a]' : 'text-[#3f3f46]'}`}
              >
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <div className="relative group flex-1 max-w-[320px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3f3f46] group-focus-within:text-[#71717a] transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search reviews…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121214] border border-[#27272a] rounded-lg py-2 pl-9 pr-8 text-[13px] text-[#f4f4f5] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3f3f46] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Repo filter */}
          <div className="relative">
            <button
              onClick={() => setRepoOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#121214] border border-[#27272a] text-[13px] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#3f3f46] transition-all"
            >
              <Filter size={13} />
              {repoFilter === 'all' ? 'All repos' : repoFilter}
              <ChevronDown size={12} />
            </button>
            {repoOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setRepoOpen(false)}
                />
                <div className="absolute left-0 top-10 w-[180px] bg-[#121214] border border-[#27272a] rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {repos.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRepoFilter(r);
                        setRepoOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-[13px] transition-colors ${
                        repoFilter === r
                          ? 'text-[#f4f4f5] bg-white/5'
                          : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-white/3'
                      }`}
                    >
                      {r === 'all' ? 'All repositories' : r}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#121214] border border-[#27272a] text-[13px] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#3f3f46] transition-all"
            >
              {selectedSort.label}
              <ChevronDown size={12} />
            </button>
            {sortOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSortOpen(false)}
                />
                <div className="absolute right-0 top-10 w-[170px] bg-[#121214] border border-[#27272a] rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-[13px] transition-colors ${
                        sortBy === opt.value
                          ? 'text-[#f4f4f5] bg-white/5'
                          : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-white/3'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <span className="text-[12px] text-[#3f3f46] ml-1">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-10 no-scrollbar">
        {filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#3f3f46] mb-5">
              <GitPullRequest size={24} />
            </div>
            <h3 className="text-[17px] font-semibold text-[#f4f4f5] mb-2">
              No reviews found
            </h3>
            <p className="text-[13px] text-[#71717a]">
              Try adjusting your filters or search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveStatus('all');
                setRepoFilter('all');
              }}
              className="mt-6 text-[13px] font-semibold text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((pr) => {
              const cfg = STATUS_CONFIG[pr.status];
              const StatusIcon = cfg.icon;

              return (
                <Link
                  key={pr.id}
                  href={`/dashboard/repositories/${pr.repoId}`}
                  className="block group"
                >
                  <div className="bg-[#18181b] border border-[#27272a] rounded-[16px] p-5 hover:border-[#3f3f46] transition-all duration-200 hover:bg-[#1a1a1c]">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* PR type icon */}
                        <div className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center shrink-0 mt-0.5">
                          <GitPullRequest
                            size={15}
                            className="text-[#71717a]"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[12px] font-medium text-[#52525b]">
                              {pr.repo}
                            </span>
                            <span className="text-[#3f3f46]">·</span>
                            <div className="flex items-center gap-1 text-[11px] text-[#3f3f46]">
                              <GitBranchPlus size={11} />
                              <span className="font-mono">{pr.branch}</span>
                            </div>
                            <GitMerge size={11} className="text-[#3f3f46]" />
                            <span className="text-[11px] font-mono text-[#3f3f46]">
                              {pr.baseBranch}
                            </span>
                          </div>

                          <h3 className="text-[14px] font-medium text-[#e4e4e7] group-hover:text-white transition-colors leading-snug line-clamp-1 mb-2">
                            {pr.title}
                          </h3>

                          {/* Labels */}
                          {pr.labels.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {pr.labels.map((label) => (
                                <span
                                  key={label}
                                  className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${
                                    LABEL_COLORS[label] ??
                                    'bg-[#27272a] text-[#71717a] border-[#3f3f46]'
                                  }`}
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status badge + link */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${cfg.bg} ${cfg.color}`}
                        >
                          <StatusIcon size={11} />
                          {cfg.label}
                        </div>
                        <ArrowUpRight
                          size={15}
                          className="text-[#3f3f46] group-hover:text-[#71717a] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="mt-4 pt-3.5 border-t border-[#27272a]/40 flex items-center gap-5 flex-wrap">
                      {/* Diff stats */}
                      <div className="flex items-center gap-3 text-[12px]">
                        <span className="text-emerald-500 font-medium">
                          +{pr.additions}
                        </span>
                        <span className="text-red-500 font-medium">
                          −{pr.deletions}
                        </span>
                        <span className="text-[#52525b]">
                          {pr.filesChanged} file
                          {pr.filesChanged !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="h-3 w-px bg-[#27272a]" />

                      {/* AI Findings */}
                      {pr.aiFindings > 0 && (
                        <div className="flex items-center gap-1.5 text-[12px]">
                          <Sparkles size={12} className="text-purple-400" />
                          <span className="text-[#71717a]">
                            <span className="text-purple-400 font-medium">
                              {pr.aiFindings}
                            </span>{' '}
                            AI finding{pr.aiFindings !== 1 ? 's' : ''}
                          </span>
                          {pr.criticalFindings > 0 && (
                            <span className="flex items-center gap-1 ml-1">
                              <Bug size={11} className="text-red-400" />
                              <span className="text-red-400 font-medium">
                                {pr.criticalFindings} critical
                              </span>
                            </span>
                          )}
                        </div>
                      )}

                      {pr.aiFindings > 0 && pr.comments > 0 && (
                        <div className="h-3 w-px bg-[#27272a]" />
                      )}

                      {/* Comments */}
                      {pr.comments > 0 && (
                        <div className="flex items-center gap-1.5 text-[12px] text-[#52525b]">
                          <MessageSquare size={12} />
                          {pr.comments} comment{pr.comments !== 1 ? 's' : ''}
                        </div>
                      )}

                      {/* No findings */}
                      {pr.aiFindings === 0 && pr.status === 'approved' && (
                        <div className="flex items-center gap-1.5 text-[12px] text-emerald-400">
                          <CheckCircle2 size={12} />
                          No issues found
                        </div>
                      )}

                      <div className="ml-auto flex items-center gap-1.5 text-[12px] text-[#3f3f46]">
                        <span>by</span>
                        <span
                          className={`font-medium ${
                            pr.author === 'codekang-bot'
                              ? 'text-purple-400'
                              : 'text-[#71717a]'
                          }`}
                        >
                          {pr.author}
                        </span>
                        <span>·</span>
                        <Clock size={11} />
                        <span>{pr.updatedAt}</span>
                      </div>
                    </div>

                    {/* Critical alert bar */}
                    {pr.criticalFindings > 0 && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10">
                        <AlertCircle
                          size={13}
                          className="text-red-400 shrink-0"
                        />
                        <span className="text-[12px] text-red-400">
                          {pr.criticalFindings} critical finding
                          {pr.criticalFindings !== 1 ? 's' : ''} require
                          immediate attention — open review to see details.
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
