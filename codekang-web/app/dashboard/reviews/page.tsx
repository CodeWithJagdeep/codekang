'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  GitPullRequest,
  Search,
  X,
  ChevronDown,
  Clock,
  CheckCircle2,
  CircleDot,
  GitMerge,
  GitBranchPlus,
  ArrowUpRight,
  Filter,
  Loader2,
  AlertCircle,
  Bug,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  fetchConnectedRepos,
  fetchRepoPullRequests,
  fetchRepoIssues,
  type IRepository,
  type IGitHubPR,
  type IGitHubIssue,
} from '@/lib/auth';

// ── Derived PR status ──

type PRStatus = 'open' | 'draft' | 'merged' | 'closed';

function getPRStatus(pr: IGitHubPR): PRStatus {
  if (pr.draft) return 'draft';
  if (pr.merged_at) return 'merged';
  if (pr.state === 'closed') return 'closed';
  return 'open';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Config ──

const PR_STATUS_CONFIG: Record<PRStatus, { icon: React.ElementType; label: string; color: string; bg: string; dot: string }> = {
  open: {
    icon: CircleDot,
    label: 'Open',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  draft: {
    icon: Clock,
    label: 'Draft',
    color: 'text-[#71717a]',
    bg: 'bg-[#27272a] border-[#3f3f46]',
    dot: 'bg-[#71717a]',
  },
  merged: {
    icon: GitMerge,
    label: 'Merged',
    color: 'text-purple-400',
    bg: 'bg-purple-500/8 border-purple-500/20',
    dot: 'bg-purple-400',
  },
  closed: {
    icon: X,
    label: 'Closed',
    color: 'text-red-400',
    bg: 'bg-red-500/8 border-red-500/20',
    dot: 'bg-red-400',
  },
};

const ISSUE_STATUS_CONFIG: Record<'open' | 'closed', { icon: React.ElementType; label: string; color: string; bg: string; dot: string }> = {
  open: {
    icon: CircleDot,
    label: 'Open',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  closed: {
    icon: CheckCircle2,
    label: 'Closed',
    color: 'text-[#71717a]',
    bg: 'bg-[#27272a] border-[#3f3f46]',
    dot: 'bg-[#71717a]',
  },
};

// ── Label colour helper ──

function labelStyle(color: string): React.CSSProperties {
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  return {
    background: `rgba(${r},${g},${b},0.15)`,
    borderColor: `rgba(${r},${g},${b},0.3)`,
    color: `rgb(${Math.min(r + 80, 255)},${Math.min(g + 80, 255)},${Math.min(b + 80, 255)})`,
  };
}

// ── Aggregated item types ──

interface PRItem extends IGitHubPR {
  repoName: string;
  repoOwner: string;
  repoId: string;
}

interface IssueItem extends IGitHubIssue {
  repoName: string;
  repoOwner: string;
  repoId: string;
}

// ── Main page ──

export default function ReviewsPage() {
  const [view, setView] = useState<'prs' | 'issues'>('prs');
  const [repos, setRepos] = useState<IRepository[]>([]);
  const [prs, setPrs] = useState<PRItem[]>([]);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [repoFilter, setRepoFilter] = useState('all');
  const [repoOpen, setRepoOpen] = useState(false);
  const [prStatus, setPrStatus] = useState<PRStatus | 'all'>('all');
  const [issueStatus, setIssueStatus] = useState<'open' | 'closed' | 'all'>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const connected = await fetchConnectedRepos();
        setRepos(connected);

        const allPRs: PRItem[] = [];
        const allIssues: IssueItem[] = [];

        await Promise.all(
          connected.map(async (repo) => {
            const [repoPRs, repoIssues] = await Promise.all([
              fetchRepoPullRequests(repo.owner, repo.name),
              fetchRepoIssues(repo.owner, repo.name),
            ]);
            repoPRs.forEach((pr) =>
              allPRs.push({ ...pr, repoName: repo.name, repoOwner: repo.owner, repoId: repo.id }),
            );
            repoIssues.forEach((issue) =>
              allIssues.push({ ...issue, repoName: repo.name, repoOwner: repo.owner, repoId: repo.id }),
            );
          }),
        );

        allPRs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        allIssues.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        setPrs(allPRs);
        setIssues(allIssues);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const repoNames = useMemo(() => ['all', ...repos.map((r) => r.name)], [repos]);

  const filteredPRs = useMemo(() => {
    return prs.filter((pr) => {
      const status = getPRStatus(pr);
      if (prStatus !== 'all' && status !== prStatus) return false;
      if (repoFilter !== 'all' && pr.repoName !== repoFilter) return false;
      if (
        searchQuery &&
        !pr.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !pr.repoName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !pr.head.ref.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [prs, prStatus, repoFilter, searchQuery]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (issueStatus !== 'all' && issue.state !== issueStatus) return false;
      if (repoFilter !== 'all' && issue.repoName !== repoFilter) return false;
      if (
        searchQuery &&
        !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !issue.repoName.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [issues, issueStatus, repoFilter, searchQuery]);

  const prCounts = useMemo(() => ({
    all: prs.length,
    open: prs.filter((p) => getPRStatus(p) === 'open').length,
    draft: prs.filter((p) => getPRStatus(p) === 'draft').length,
    merged: prs.filter((p) => getPRStatus(p) === 'merged').length,
    closed: prs.filter((p) => getPRStatus(p) === 'closed').length,
  }), [prs]);

  const issueCounts = useMemo(() => ({
    all: issues.length,
    open: issues.filter((i) => i.state === 'open').length,
    closed: issues.filter((i) => i.state === 'closed').length,
  }), [issues]);

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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[26px] md:text-[32px] font-semibold text-[#f4f4f5] tracking-tight leading-tight">
              Code Reviews
            </h1>
            <p className="text-[14px] text-[#71717a] mt-1.5">
              Pull requests and issues across all connected repositories.
            </p>
          </div>

          {/* Summary pills + AI live badge */}
          {!loading && (
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <GitPullRequest size={14} className="text-blue-400" strokeWidth={1.8} />
                  <span className="text-[14px] font-semibold text-blue-400">{prCounts.open}</span>
                  <span className="text-[12px] text-[#52525b]">open PRs</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <Bug size={14} className="text-amber-400" strokeWidth={1.8} />
                  <span className="text-[14px] font-semibold text-amber-400">{issueCounts.open}</span>
                  <span className="text-[12px] text-[#52525b]">open issues</span>
                </div>
              </div>
              {repos.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#f97316' }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#f97316' }} />
                  </span>
                  <Sparkles size={11} style={{ color: '#f97316' }} />
                  <span className="text-[11px] font-medium" style={{ color: '#f97316' }}>
                    Kang AI monitoring {repos.length} repo{repos.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PRs / Issues toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#121214] rounded-xl border border-[#27272a]/60 w-fit mb-4">
          <button
            onClick={() => setView('prs')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
              view === 'prs' ? 'bg-[#27272a] text-[#f4f4f5]' : 'text-[#52525b] hover:text-[#a1a1aa]'
            }`}
          >
            <GitPullRequest size={13} />
            Pull Requests
            <span className="text-[11px] text-[#52525b]">{prCounts.all}</span>
          </button>
          <button
            onClick={() => setView('issues')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
              view === 'issues' ? 'bg-[#27272a] text-[#f4f4f5]' : 'text-[#52525b] hover:text-[#a1a1aa]'
            }`}
          >
            <CircleDot size={13} />
            Issues
            <span className="text-[11px] text-[#52525b]">{issueCounts.all}</span>
          </button>
        </div>

        {/* Status tabs */}
        {view === 'prs' ? (
          <div className="flex items-center gap-1 p-1 bg-[#121214] rounded-xl border border-[#27272a]/60 w-fit overflow-x-auto no-scrollbar mb-4">
            {(['all', 'open', 'draft', 'merged', 'closed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setPrStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  prStatus === s ? 'bg-[#27272a] text-[#f4f4f5]' : 'text-[#52525b] hover:text-[#a1a1aa]'
                }`}
              >
                {s !== 'all' && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${prStatus === s ? PR_STATUS_CONFIG[s].dot : 'bg-[#3f3f46]'}`}
                  />
                )}
                {s === 'all' ? 'All' : PR_STATUS_CONFIG[s].label}
                <span className="text-[11px] text-[#52525b]">
                  {prCounts[s]}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 p-1 bg-[#121214] rounded-xl border border-[#27272a]/60 w-fit mb-4">
            {(['all', 'open', 'closed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setIssueStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  issueStatus === s ? 'bg-[#27272a] text-[#f4f4f5]' : 'text-[#52525b] hover:text-[#a1a1aa]'
                }`}
              >
                {s !== 'all' && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${issueStatus === s ? ISSUE_STATUS_CONFIG[s].dot : 'bg-[#3f3f46]'}`}
                  />
                )}
                {s === 'all' ? 'All' : ISSUE_STATUS_CONFIG[s].label}
                <span className="text-[11px] text-[#52525b]">
                  {issueCounts[s]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Search + repo filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative group flex-1 max-w-[320px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3f3f46] group-focus-within:text-[#71717a] transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder={view === 'prs' ? 'Search pull requests…' : 'Search issues…'}
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
                <div className="fixed inset-0 z-10" onClick={() => setRepoOpen(false)} />
                <div className="absolute left-0 top-10 w-[200px] bg-[#121214] border border-[#27272a] rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {repoNames.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRepoFilter(r); setRepoOpen(false); }}
                      className={`w-full text-left px-3.5 py-2.5 text-[13px] transition-colors ${
                        repoFilter === r ? 'text-[#f4f4f5] bg-white/5' : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-white/3'
                      }`}
                    >
                      {r === 'all' ? 'All repositories' : r}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <span className="text-[12px] text-[#3f3f46] ml-1">
            {view === 'prs' ? filteredPRs.length : filteredIssues.length} result
            {(view === 'prs' ? filteredPRs.length : filteredIssues.length) !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-10 no-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={28} className="animate-spin text-[#52525b]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-[14px] text-[#71717a]">{error}</p>
          </div>
        ) : repos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#3f3f46]">
              <GitPullRequest size={24} />
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[#f4f4f5] mb-1">No repositories connected</h3>
              <p className="text-[13px] text-[#71717a]">Add repositories from the dashboard to see reviews here.</p>
            </div>
          </div>
        ) : view === 'prs' ? (
          filteredPRs.length === 0 ? (
            <EmptyState onClear={() => { setSearchQuery(''); setPrStatus('all'); setRepoFilter('all'); }} />
          ) : (
            <div className="space-y-3">
              {filteredPRs.map((pr) => {
                const status = getPRStatus(pr);
                const cfg = PR_STATUS_CONFIG[status];
                const StatusIcon = cfg.icon;
                return (
                  <a
                    key={`${pr.repoId}-${pr.id}`}
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="bg-[#18181b] border border-[#27272a] rounded-[16px] p-5 hover:border-[#3f3f46] transition-all duration-200 hover:bg-[#1a1a1c]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center shrink-0 mt-0.5">
                            <GitPullRequest size={15} className="text-[#71717a]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[12px] font-medium text-[#52525b]">{pr.repoName}</span>
                              <span className="text-[#3f3f46]">·</span>
                              <span className="text-[11px] text-[#3f3f46] font-mono">#{pr.number}</span>
                              <span className="text-[#3f3f46]">·</span>
                              <div className="flex items-center gap-1 text-[11px] text-[#3f3f46]">
                                <GitBranchPlus size={11} />
                                <span className="font-mono">{pr.head.ref}</span>
                              </div>
                              <GitMerge size={11} className="text-[#3f3f46]" />
                              <span className="text-[11px] font-mono text-[#3f3f46]">{pr.base.ref}</span>
                            </div>
                            <h3 className="text-[14px] font-medium text-[#e4e4e7] group-hover:text-white transition-colors leading-snug line-clamp-1">
                              {pr.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
                            <StatusIcon size={11} />
                            {cfg.label}
                          </div>
                          <ArrowUpRight size={15} className="text-[#3f3f46] group-hover:text-[#71717a] transition-colors" />
                        </div>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-[#27272a]/40 flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] text-[#3f3f46]">by</span>
                        <span className="text-[12px] font-medium text-[#71717a]">
                          {pr.user?.login ?? 'unknown'}
                        </span>
                        <span className="text-[#3f3f46]">·</span>
                        <Clock size={11} className="text-[#3f3f46]" />
                        <span className="text-[12px] text-[#3f3f46]">{timeAgo(pr.updated_at)}</span>
                        <div className="ml-auto">
                          {status === 'open' || status === 'draft' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)', color: '#f97316' }}>
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#f97316' }} />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#f97316' }} />
                              </span>
                              Kang AI reviewing
                            </span>
                          ) : status === 'merged' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', color: '#a855f7' }}>
                              <ShieldCheck size={10} />
                              AI reviewed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{ background: 'rgba(113,113,122,0.08)', border: '1px solid rgba(113,113,122,0.15)', color: '#71717a' }}>
                              <ShieldCheck size={10} />
                              AI reviewed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )
        ) : (
          filteredIssues.length === 0 ? (
            <EmptyState onClear={() => { setSearchQuery(''); setIssueStatus('all'); setRepoFilter('all'); }} />
          ) : (
            <div className="space-y-3">
              {filteredIssues.map((issue) => {
                const cfg = ISSUE_STATUS_CONFIG[issue.state];
                const StatusIcon = cfg.icon;
                return (
                  <a
                    key={`${issue.repoId}-${issue.id}`}
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="bg-[#18181b] border border-[#27272a] rounded-[16px] p-5 hover:border-[#3f3f46] transition-all duration-200 hover:bg-[#1a1a1c]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center shrink-0 mt-0.5">
                            <CircleDot size={15} className="text-[#71717a]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[12px] font-medium text-[#52525b]">{issue.repoName}</span>
                              <span className="text-[#3f3f46]">·</span>
                              <span className="text-[11px] text-[#3f3f46] font-mono">#{issue.number}</span>
                            </div>
                            <h3 className="text-[14px] font-medium text-[#e4e4e7] group-hover:text-white transition-colors leading-snug line-clamp-1">
                              {issue.title}
                            </h3>
                            {issue.labels.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                                {issue.labels.map((label) => (
                                  <span
                                    key={label.name}
                                    className="px-2 py-0.5 rounded-full border text-[10px] font-medium"
                                    style={labelStyle(label.color)}
                                  >
                                    {label.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
                            <StatusIcon size={11} />
                            {cfg.label}
                          </div>
                          <ArrowUpRight size={15} className="text-[#3f3f46] group-hover:text-[#71717a] transition-colors" />
                        </div>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-[#27272a]/40 flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] text-[#3f3f46]">by</span>
                        <span className="text-[12px] font-medium text-[#71717a]">
                          {issue.user?.login ?? 'unknown'}
                        </span>
                        <span className="text-[#3f3f46]">·</span>
                        <Clock size={11} className="text-[#3f3f46]" />
                        <span className="text-[12px] text-[#3f3f46]">{timeAgo(issue.updated_at)}</span>
                        <div className="ml-auto">
                          {issue.state === 'open' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)', color: '#f97316' }}>
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#f97316' }} />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#f97316' }} />
                              </span>
                              Kang AI watching
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{ background: 'rgba(113,113,122,0.08)', border: '1px solid rgba(113,113,122,0.15)', color: '#71717a' }}>
                              <ShieldCheck size={10} />
                              AI analyzed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="py-32 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#3f3f46] mb-5">
        <GitPullRequest size={24} />
      </div>
      <h3 className="text-[17px] font-semibold text-[#f4f4f5] mb-2">Nothing found</h3>
      <p className="text-[13px] text-[#71717a]">Try adjusting your filters or search query.</p>
      <button
        onClick={onClear}
        className="mt-6 text-[13px] font-semibold text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
}
