'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GitPullRequest,
  AlertCircle,
  Settings,
  Search,
  CheckCircle2,
  Clock,
  GitMerge,
  GitBranchPlus,
  CircleDot,
  Star,
  Lock,
  Globe,
  Loader2,
  ExternalLink,
  RefreshCcw,
  ChevronRight,
} from 'lucide-react';
import {
  fetchConnectedRepo,
  fetchRepoPullRequests,
  fetchRepoIssues,
  syncRepo,
  type IRepository,
  type IGitHubPR,
  type IGitHubIssue,
} from '@/lib/auth';

// ── Helpers ────────────────────────────────────────────────────────────────────

type PRStatus = 'open' | 'draft' | 'merged' | 'closed';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getPRStatus(pr: IGitHubPR): PRStatus {
  if (pr.draft) return 'draft';
  if (pr.merged_at) return 'merged';
  if (pr.state === 'closed') return 'closed';
  return 'open';
}

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

const PR_STATUS = {
  open:   { label: 'Open',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CircleDot },
  draft:  { label: 'Draft',  color: 'text-[#71717a]',   bg: 'bg-white/5',        border: 'border-white/10',       icon: Clock },
  merged: { label: 'Merged', color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: GitMerge },
  closed: { label: 'Closed', color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: CheckCircle2 },
};

// ── KangBot badge ──────────────────────────────────────────────────────────────

function KangBotBadge({ status, type = 'pr' }: { status: PRStatus | 'open' | 'closed'; type?: 'pr' | 'issue' }) {
  if (status === 'open' || status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border"
        style={{ background: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.25)', color: '#f97316' }}>
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#f97316' }} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#f97316' }} />
        </span>
        {status === 'draft' ? 'Kang AI Waiting' : type === 'issue' ? 'Kang AI Analyzing' : 'Kang AI Reviewing'}
      </span>
    );
  }
  if (status === 'merged') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full border"
        style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>
        <CheckCircle2 size={10} /> AI Reviewed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full border"
      style={{ background: 'rgba(113,113,122,0.1)', borderColor: 'rgba(113,113,122,0.2)', color: '#71717a' }}>
      <CheckCircle2 size={10} /> AI Reviewed
    </span>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function RepositoryDetailsPage({ params }: { params: { repoId: string } }) {
  const [repo, setRepo] = useState<IRepository | null>(null);
  const [prs, setPrs] = useState<IGitHubPR[]>([]);
  const [issues, setIssues] = useState<IGitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const [activeTab, setActiveTab] = useState<'prs' | 'issues' | 'settings'>('prs');
  const [searchPR, setSearchPR] = useState('');
  const [searchIssue, setSearchIssue] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const found = await fetchConnectedRepo(params.repoId);
        setRepo(found);
        const [repoPRs, repoIssues] = await Promise.all([
          fetchRepoPullRequests(found.owner, found.name, 'all'),
          fetchRepoIssues(found.owner, found.name, 'all'),
        ]);
        setPrs(repoPRs);
        setIssues(repoIssues);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load repository');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.repoId]);

  async function handleSync() {
    if (!repo || syncing) return;
    setSyncing(true);
    try {
      const [updatedRepo, repoPRs, repoIssues] = await Promise.all([
        syncRepo(params.repoId),
        fetchRepoPullRequests(repo.owner, repo.name, 'all'),
        fetchRepoIssues(repo.owner, repo.name, 'all'),
      ]);
      setRepo(updatedRepo);
      setPrs(repoPRs);
      setIssues(repoIssues);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  }

  const openPRs    = prs.filter((p) => getPRStatus(p) === 'open' || getPRStatus(p) === 'draft');
  const openIssues = issues.filter((i) => i.state === 'open');

  const filteredPRs = prs.filter((p) =>
    p.title.toLowerCase().includes(searchPR.toLowerCase()) ||
    p.head.ref.toLowerCase().includes(searchPR.toLowerCase()),
  );
  const filteredIssues = issues.filter((i) =>
    i.title.toLowerCase().includes(searchIssue.toLowerCase()),
  );

  const tabs = [
    { id: 'prs',      label: 'Pull Requests', icon: GitPullRequest, count: openPRs.length },
    { id: 'issues',   label: 'Issues',        icon: AlertCircle,    count: openIssues.length },
    { id: 'settings', label: 'Settings',      icon: Settings },
  ] as const;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden" style={{ background: '#1c1c1c' }}>

      {/* ── Header ── */}
      <div className="px-4 md:px-8 pt-6 pb-0 border-b border-[#2a2a2a] bg-[#121214]">
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#a1a1aa] hover:text-[#e8e8e8] transition-colors mb-4">
          <ArrowLeft size={14} /> Back to Repositories
        </Link>

        {loading ? (
          <div className="flex items-center gap-3 mb-4">
            <div className="h-7 w-64 rounded-md bg-[#27272a] animate-pulse" />
          </div>
        ) : error ? (
          <div className="mb-4 text-red-400 text-[14px]">{error}</div>
        ) : repo ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
                <span className="text-[#a1a1aa] font-medium">{repo.owner}</span>
                <span className="text-[#6d6d6d] font-light">/</span>
                <span className="text-[#e8e8e8]">{repo.name}</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium"
                  style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.2)', color: '#f97316' }}>
                  <span className="relative flex h-1.5 w-1.5 mr-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#f97316' }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#f97316' }} />
                  </span>
                  Kang AI Active
                </span>
                {repo.private ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] text-[#71717a] border-[#3f3f46] bg-[#27272a]">
                    <Lock size={10} /> Private
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] text-[#71717a] border-[#3f3f46] bg-[#27272a]">
                    <Globe size={10} /> Public
                  </span>
                )}
                {repo.language && <span className="text-[11px] text-[#71717a]">{repo.language}</span>}
                {repo.stargazersCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#71717a]">
                    <Star size={11} /> {repo.stargazersCount}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleSync} disabled={syncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#a1a1aa] hover:text-[#e8e8e8] bg-white/5 hover:bg-white/10 border border-[#2a2a2a] rounded-md transition-colors disabled:opacity-50">
                <RefreshCcw size={13} className={syncing ? 'animate-spin' : ''} /> Sync
              </button>
              <a href={`https://github.com/${repo.owner}/${repo.name}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#a1a1aa] hover:text-[#e8e8e8] bg-white/5 hover:bg-white/10 border border-[#2a2a2a] rounded-md transition-colors">
                <ExternalLink size={13} /> GitHub
              </a>
            </div>
          </div>
        ) : null}

        {/* Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap shrink-0"
                style={{ borderColor: isActive ? '#f97316' : 'transparent', color: isActive ? '#e8e8e8' : '#a1a1aa' }}>
                <tab.icon size={15} className={isActive ? 'text-[#f97316]' : 'opacity-70'} />
                <span className="text-[13px] md:text-[14px] font-medium">{tab.label}</span>
                {'count' in tab && tab.count !== undefined && (
                  <span className="px-1.5 min-w-[20px] h-5 rounded-full text-[11px] font-bold bg-white/10 text-[#e8e8e8] flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-[#121214]">

        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={28} className="animate-spin text-[#52525b]" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-[14px] text-[#71717a]">{error}</p>
          </div>
        )}

        {/* ── PRs ── */}
        {!loading && !error && activeTab === 'prs' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d6d6d]" />
                <input type="text" placeholder="Search pull requests…" value={searchPR}
                  onChange={(e) => setSearchPR(e.target.value)}
                  className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-md pl-9 pr-4 py-2 text-[13px] text-[#e8e8e8] placeholder-[#6d6d6d] focus:outline-none focus:border-[#f97316] transition-colors w-64" />
              </div>
              <span className="text-[12px] text-[#52525b]">
                {filteredPRs.length} pull request{filteredPRs.length !== 1 ? 's' : ''} · {openPRs.length} open
              </span>
            </div>

            {filteredPRs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center border border-dashed border-[#2a2a2a] rounded-xl">
                <GitPullRequest size={28} className="text-[#3f3f46]" />
                <p className="text-[14px] text-[#71717a]">No pull requests found</p>
              </div>
            ) : filteredPRs.map((pr) => {
              const status = getPRStatus(pr);
              const cfg = PR_STATUS[status];
              const StatusIcon = cfg.icon;

              return (
                <div key={pr.id}
                  className="flex flex-col border border-white/5 rounded-xl bg-[#1c1c1c] overflow-hidden hover:border-[#393939] transition-all duration-200"
                  style={{ opacity: status === 'draft' ? 0.8 : 1 }}>

                  {/* PR info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                          <StatusIcon size={17} className={cfg.color} />
                        </div>
                        <div className="min-w-0">
                          <a href={pr.html_url} target="_blank" rel="noopener noreferrer"
                            className="text-[14px] md:text-[15px] font-bold text-[#e8e8e8] hover:text-[#f97316] transition-colors leading-snug line-clamp-2 block">
                            {pr.title}
                          </a>
                          <div className="text-[12px] text-[#6d6d6d] mt-1.5 flex items-center gap-1.5 flex-wrap">
                            <span className={`font-semibold ${cfg.color}`}>#{pr.number}</span>
                            <span>·</span>
                            <span>
                              {status === 'merged' ? 'merged' : status === 'closed' ? 'closed' : 'opened'}{' '}
                              {timeAgo(pr.updated_at)} by{' '}
                              <span className="text-[#a1a1aa] font-medium">{pr.user?.login ?? 'unknown'}</span>
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1 font-mono text-[#a1a1aa] bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
                              <GitBranchPlus size={9} /> {pr.head.ref}
                            </span>
                            <GitMerge size={10} className="text-[#3f3f46]" />
                            <span className="font-mono text-[#a1a1aa] bg-white/5 px-1.5 py-0.5 rounded text-[10px]">{pr.base.ref}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full shrink-0 ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        <StatusIcon size={11} /> {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* KangBot row — navigates to activity page */}
                  <Link
                    href={`/dashboard/repositories/${params.repoId}/review/${pr.number}`}
                    className="border-t border-white/5 bg-[#161618] px-5 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${status === 'draft' ? 'bg-[#333]' : 'bg-[#f97316]'}`}>
                        <span className={`text-[10px] font-black ${status === 'draft' ? 'text-[#6d6d6d]' : 'text-white'}`}>K</span>
                      </div>
                      <span className={`text-[13px] font-bold ${status === 'draft' ? 'text-[#6d6d6d]' : 'text-[#e8e8e8]'}`}>KangBot</span>
                      <KangBotBadge status={status} />
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#52525b] group-hover:text-[#f97316] transition-colors">
                      View AI Analysis <ChevronRight size={13} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Issues ── */}
        {!loading && !error && activeTab === 'issues' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d6d6d]" />
                <input type="text" placeholder="Search issues…" value={searchIssue}
                  onChange={(e) => setSearchIssue(e.target.value)}
                  className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-md pl-9 pr-4 py-2 text-[13px] text-[#e8e8e8] placeholder-[#6d6d6d] focus:outline-none focus:border-[#f97316] transition-colors w-64" />
              </div>
              <span className="text-[12px] text-[#52525b]">
                {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} · {openIssues.length} open
              </span>
            </div>

            {filteredIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center border border-dashed border-[#2a2a2a] rounded-xl">
                <AlertCircle size={28} className="text-[#3f3f46]" />
                <p className="text-[14px] text-[#71717a]">No issues found</p>
              </div>
            ) : filteredIssues.map((issue) => {
              const isOpen = issue.state === 'open';

              return (
                <div key={issue.id}
                  className="flex flex-col border border-white/5 rounded-xl bg-[#1c1c1c] overflow-hidden hover:border-[#393939] transition-all duration-200">

                  {/* Issue info */}
                  <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="p-5 group block">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${isOpen ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[#27272a] border-[#3f3f46]'}`}>
                          <CircleDot size={17} className={isOpen ? 'text-emerald-400' : 'text-[#71717a]'} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[14px] md:text-[15px] font-bold text-[#e8e8e8] group-hover:text-[#f97316] transition-colors leading-snug line-clamp-2">
                            {issue.title}
                          </h3>
                          <div className="text-[12px] text-[#6d6d6d] mt-1.5 flex items-center gap-1.5 flex-wrap">
                            <span className={`font-semibold ${isOpen ? 'text-emerald-400' : 'text-[#71717a]'}`}>#{issue.number}</span>
                            <span>·</span>
                            <span>
                              {isOpen ? 'opened' : 'closed'} {timeAgo(issue.updated_at)} by{' '}
                              <span className="text-[#a1a1aa] font-medium">{issue.user?.login ?? 'unknown'}</span>
                            </span>
                          </div>
                          {issue.labels.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap mt-2">
                              {issue.labels.map((label) => (
                                <span key={label.name} className="px-2 py-0.5 rounded-full border text-[10px] font-medium" style={labelStyle(label.color)}>
                                  {label.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border shrink-0 ${isOpen ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#27272a] text-[#71717a] border-[#3f3f46]'}`}>
                        <CircleDot size={11} /> {isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </a>

                  {/* KangBot row — navigates to activity page */}
                  <Link
                    href={`/dashboard/repositories/${params.repoId}/review/${issue.number}`}
                    className="border-t border-white/5 bg-[#161618] px-5 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isOpen ? 'bg-[#f97316]' : 'bg-[#333]'}`}>
                        <span className={`text-[10px] font-black ${isOpen ? 'text-white' : 'text-[#6d6d6d]'}`}>K</span>
                      </div>
                      <span className={`text-[13px] font-bold ${isOpen ? 'text-[#e8e8e8]' : 'text-[#6d6d6d]'}`}>KangBot</span>
                      <KangBotBadge status={isOpen ? 'open' : 'closed'} type="issue" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#52525b] group-hover:text-[#f97316] transition-colors">
                      View AI Analysis <ChevronRight size={13} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Settings ── */}
        {!loading && !error && activeTab === 'settings' && (
          <div className="flex flex-col items-center justify-center h-64 text-center border border-dashed border-[#2a2a2a] rounded-xl bg-[#1c1c1c]/50">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[#6d6d6d] mb-4">
              <Settings size={24} />
            </div>
            <h3 className="text-[16px] font-bold text-[#e8e8e8] mb-1">Settings</h3>
            <p className="text-[13px] text-[#a1a1aa] max-w-[300px]">
              Repository-level review configuration is coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
