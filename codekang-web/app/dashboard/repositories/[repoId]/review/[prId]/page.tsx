'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GitPullRequest,
  ChevronRight,
  ExternalLink,
  GitBranch,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Zap,
  MessageSquare,
  Loader2,
  RefreshCcw,
  GitMerge,
} from 'lucide-react';
import {
  fetchConnectedRepo,
  fetchRepoPR,
  fetchPRReview,
  triggerPRFix,
  type IRepository,
  type IGitHubPR,
  type IPRReview,
  type IPRReviewComment,
} from '@/lib/auth';

// ── Helpers ────────────────────────────────────────────────────────────────────

function classifyComment(body: string): 'critical' | 'warning' | 'suggestion' {
  const lower = body.toLowerCase();
  if (
    lower.includes('security') ||
    lower.includes('injection') ||
    lower.includes('xss') ||
    lower.includes('auth') ||
    lower.includes('secret') ||
    lower.includes('vulnerability') ||
    lower.includes('critical') ||
    lower.includes('crash') ||
    lower.includes('panic') ||
    lower.includes('overflow')
  )
    return 'critical';
  if (
    lower.includes('bug') ||
    lower.includes('error') ||
    lower.includes('incorrect') ||
    lower.includes('wrong') ||
    lower.includes('off-by-one') ||
    lower.includes('null') ||
    lower.includes('undefined') ||
    lower.includes('leak')
  )
    return 'warning';
  return 'suggestion';
}

const SEVERITY = {
  critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: ShieldAlert },
  warning:  { label: 'Warning',  color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertCircle },
  suggestion: { label: 'Suggestion', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Zap },
};

const VERDICT_LABEL: Record<IPRReview['verdict'], string> = {
  APPROVE: 'Approved',
  REQUEST_CHANGES: 'Changes Requested',
  COMMENT: 'Commented',
};

const FIX_STATUS_LABEL: Record<IPRReview['fix_status'], string> = {
  none: 'Not started',
  pending: 'Queued…',
  running: 'Applying fixes…',
  done: 'Fixed',
  failed: 'Fix failed',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PRReviewPage({
  params,
}: {
  params: { repoId: string; prId: string };
}) {
  const [repo, setRepo] = useState<IRepository | null>(null);
  const [pr, setPR] = useState<IGitHubPR | null>(null);
  const [review, setReview] = useState<IPRReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fixing, setFixing] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const foundRepo = await fetchConnectedRepo(params.repoId);
      setRepo(foundRepo);

      const [foundPR, foundReview] = await Promise.all([
        fetchRepoPR(foundRepo.owner, foundRepo.name, Number(params.prId)),
        fetchPRReview(foundRepo.owner, foundRepo.name, Number(params.prId)),
      ]);
      setPR(foundPR);
      setReview(foundReview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [params.repoId, params.prId]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while fix is in progress
  useEffect(() => {
    if (!review || (review.fix_status !== 'pending' && review.fix_status !== 'running')) return;
    const interval = setInterval(async () => {
      if (!repo) return;
      const updated = await fetchPRReview(repo.owner, repo.name, Number(params.prId));
      if (updated) setReview(updated);
      if (updated?.fix_status === 'done' || updated?.fix_status === 'failed') {
        clearInterval(interval);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [review?.fix_status, repo, params.prId]);

  async function handleApproveFix() {
    if (!repo || fixing) return;
    setFixing(true);
    setFixError(null);
    try {
      const result = await triggerPRFix(repo.owner, repo.name, Number(params.prId));
      setReview((prev) =>
        prev ? { ...prev, fix_status: result.status as IPRReview['fix_status'] } : prev,
      );
    } catch (err) {
      setFixError(err instanceof Error ? err.message : 'Failed to trigger fix');
    } finally {
      setFixing(false);
    }
  }

  // ── Categorize comments ────────────────────────────────────────────────────

  const criticals = (review?.comments ?? []).filter(
    (c: IPRReviewComment) => classifyComment(c.body) === 'critical',
  );
  const warnings = (review?.comments ?? []).filter(
    (c: IPRReviewComment) => classifyComment(c.body) === 'warning',
  );
  const suggestions = (review?.comments ?? []).filter(
    (c: IPRReviewComment) => classifyComment(c.body) === 'suggestion',
  );

  const canFix =
    review !== null &&
    review.verdict !== 'APPROVE' &&
    (review.fix_status === 'none' || review.fix_status === 'failed');

  const fixInProgress =
    review?.fix_status === 'pending' || review?.fix_status === 'running';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#121214]">
      {/* ── Top Bar ── */}
      <div className="px-6 py-3 border-b border-[#2a2a2a] bg-[#1c1c1c] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px]">
          <Link
            href={`/dashboard/repositories/${params.repoId}`}
            className="flex items-center gap-1 text-[#a1a1aa] hover:text-[#e8e8e8] transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="font-medium">{repo?.name ?? params.repoId}</span>
          </Link>
          <ChevronRight size={12} className="text-[#444]" />
          <span className="font-semibold text-[#e8e8e8]">
            {pr?.title ?? `PR #${params.prId}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-1.5 rounded-md hover:bg-white/5 text-[#6d6d6d] hover:text-[#a1a1aa] transition-colors"
            title="Refresh"
          >
            <RefreshCcw size={14} />
          </button>
          {pr && (
            <a
              href={pr.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#a1a1aa] hover:text-[#e8e8e8] bg-white/5 hover:bg-white/10 border border-[#2a2a2a] rounded-md transition-colors"
            >
              <ExternalLink size={12} /> GitHub
            </a>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[760px] mx-auto py-8 px-4 flex flex-col gap-6">

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

          {!loading && !error && (
            <>
              {/* ── PR Info card ── */}
              {pr && (
                <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      <GitPullRequest size={11} />
                      {pr.state === 'open' ? 'Open' : pr.merged_at ? 'Merged' : 'Closed'}
                    </span>
                    <span className="text-[12px] text-[#6d6d6d]">
                      #{pr.number} · by {pr.user?.login ?? 'unknown'} ·{' '}
                      {timeAgo(pr.updated_at)}
                    </span>
                  </div>
                  <h2 className="text-[16px] font-bold text-[#e8e8e8] mb-2">{pr.title}</h2>
                  <div className="flex items-center gap-2 text-[12px] text-[#6d6d6d]">
                    <GitBranch size={12} />
                    <span className="font-mono text-[11px] text-[#a1a1aa] bg-white/5 px-1.5 py-0.5 rounded">
                      {pr.head.ref}
                    </span>
                    <GitMerge size={11} className="text-[#3f3f46]" />
                    <span className="font-mono text-[11px] text-[#a1a1aa] bg-white/5 px-1.5 py-0.5 rounded">
                      {pr.base.ref}
                    </span>
                  </div>
                </div>
              )}

              {/* ── No review yet ── */}
              {!review && (
                <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#f8423b]/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-[18px] font-black text-[#f8423b]">K</span>
                  </div>
                  <p className="text-[14px] font-semibold text-[#e8e8e8] mb-1">Review pending</p>
                  <p className="text-[13px] text-[#71717a]">
                    KangBot will review this PR automatically when it's opened or updated.
                  </p>
                </div>
              )}

              {/* ── Review result ── */}
              {review && (
                <>
                  {/* Verdict banner */}
                  <div
                    className="rounded-xl border p-4 flex items-start gap-3"
                    style={
                      review.verdict === 'APPROVE'
                        ? { background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }
                        : review.verdict === 'REQUEST_CHANGES'
                        ? { background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }
                        : { background: 'rgba(249,115,22,0.06)', borderColor: 'rgba(249,115,22,0.2)' }
                    }
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-black text-[13px]"
                      style={{ background: '#f8423b', color: '#fff' }}
                    >
                      K
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-bold text-[#e8e8e8]">KangBot</span>
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={
                            review.verdict === 'APPROVE'
                              ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                              : review.verdict === 'REQUEST_CHANGES'
                              ? { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
                              : { background: 'rgba(249,115,22,0.15)', color: '#f8423b' }
                          }
                        >
                          {VERDICT_LABEL[review.verdict]}
                        </span>
                        <span className="text-[11px] text-[#52525b] ml-auto">
                          {timeAgo(review.created_at)}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#a1a1aa] leading-relaxed">{review.summary}</p>
                    </div>
                  </div>

                  {/* Findings list */}
                  {review.comments.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="text-[12px] font-bold text-[#6d6d6d] uppercase tracking-wider">
                        Findings ({review.comments.length})
                      </div>

                      {(criticals.length > 0 || warnings.length > 0 || suggestions.length > 0) && (
                        <div className="flex items-center gap-3 text-[12px] text-[#6d6d6d]">
                          {criticals.length > 0 && (
                            <span className="text-red-400 font-semibold">{criticals.length} critical</span>
                          )}
                          {warnings.length > 0 && (
                            <span className="text-orange-400 font-semibold">{warnings.length} warning{warnings.length !== 1 ? 's' : ''}</span>
                          )}
                          {suggestions.length > 0 && (
                            <span className="text-blue-400 font-semibold">{suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      )}

                      {review.comments.map((comment: IPRReviewComment, i: number) => {
                        const sev = classifyComment(comment.body);
                        const cfg = SEVERITY[sev];
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={i}
                            className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Icon size={14} className={cfg.color} />
                              <span className={`text-[11px] font-bold ${cfg.color}`}>
                                {cfg.label}
                              </span>
                              <code className="text-[11px] text-[#a1a1aa] bg-white/5 px-1.5 py-0.5 rounded ml-1">
                                {comment.path}:{comment.line}
                              </code>
                            </div>
                            <p className="text-[13px] text-[#a1a1aa] leading-relaxed whitespace-pre-wrap">
                              {comment.body}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {review.verdict === 'APPROVE' && (
                    <div className="flex items-center gap-3 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl p-4">
                      <CheckCircle2 size={20} className="text-green-400 shrink-0" />
                      <p className="text-[13px] text-[#a1a1aa]">
                        No issues found — this PR looks good to merge.
                      </p>
                    </div>
                  )}

                  {/* Fix status / Approve button */}
                  {review.verdict !== 'APPROVE' && (
                    <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl p-5">
                      <div className="text-[12px] font-bold text-[#6d6d6d] uppercase tracking-wider mb-3">
                        Automated Fix
                      </div>

                      {review.fix_status === 'done' && review.fix_pr_url ? (
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                          <div>
                            <p className="text-[13px] font-semibold text-[#e8e8e8]">
                              Fixes applied
                            </p>
                            <a
                              href={review.fix_pr_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[12px] text-[#f8423b] hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <GitPullRequest size={11} /> View fix PR
                            </a>
                          </div>
                        </div>
                      ) : fixInProgress ? (
                        <div className="flex items-center gap-3">
                          <Loader2 size={18} className="animate-spin text-[#f8423b] shrink-0" />
                          <div>
                            <p className="text-[13px] font-semibold text-[#e8e8e8]">
                              {FIX_STATUS_LABEL[review.fix_status]}
                            </p>
                            <p className="text-[12px] text-[#71717a] mt-0.5">
                              KangBot is applying fixes — this may take a few minutes.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <p className="text-[13px] text-[#71717a]">
                            KangBot can automatically fix the issues found above and open a pull
                            request with the changes. You can also comment{' '}
                            <code className="bg-white/5 px-1.5 py-0.5 rounded text-[#a1a1aa]">
                              @codekang fix
                            </code>{' '}
                            on the GitHub PR.
                          </p>
                          {review.fix_status === 'failed' && (
                            <p className="text-[12px] text-red-400">
                              Previous fix attempt failed. You can retry.
                            </p>
                          )}
                          {fixError && (
                            <p className="text-[12px] text-red-400">{fixError}</p>
                          )}
                          <button
                            onClick={handleApproveFix}
                            disabled={fixing || !canFix}
                            className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all disabled:opacity-50"
                            style={{ background: '#f8423b', color: '#fff' }}
                          >
                            {fixing ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <MessageSquare size={14} />
                            )}
                            {fixing ? 'Queuing…' : review.fix_status === 'failed' ? 'Retry Fix' : 'Approve & Fix'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
