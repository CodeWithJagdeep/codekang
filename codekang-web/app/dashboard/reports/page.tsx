'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  GitPullRequest,
  Bug,
  Zap,
  Clock,
  ChevronDown,
  Download,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ExternalLink,
  Minus,
} from 'lucide-react';
import Link from 'next/link';
import { fetchReportStats, type IReportStats } from '@/lib/auth';

// ── Types ──────────────────────────────────────────────────────────────────────

type Range = '7d' | '30d' | '90d' | 'all';

const RANGE_DAYS: Record<Range, 7 | 30 | 90 | 0> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: 0,
};

const RANGE_OPTIONS: { label: string; value: Range }[] = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time', value: 'all' },
];

// ── SVG Bar Chart ──────────────────────────────────────────────────────────────

function BarChart({
  data,
  color,
  height = 130,
}: {
  data: { value: number; label?: string }[];
  color: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 600;
  const barWidth = Math.max(2, Math.floor((w / data.length) * 0.6));
  const gap = w / data.length;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none">
      {data.map((d, i) => {
        const barH = Math.max(2, (d.value / max) * (height - 8));
        const x = i * gap + gap / 2 - barWidth / 2;
        const y = height - barH;
        return (
          <rect
            key={i}
            x={x} y={y}
            width={barWidth} height={barH}
            rx={barWidth > 4 ? 2 : 1}
            fill={color}
            opacity={0.75}
          />
        );
      })}
    </svg>
  );
}

// ── SVG Sparkline ──────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <div className="w-20 h-7" />;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-7" preserveAspectRatio="none">
      <polyline
        points={pts} fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"
      />
    </svg>
  );
}

// ── Donut Chart ────────────────────────────────────────────────────────────────

function DonutChart({
  segments,
  label,
}: {
  segments: { label: string; value: number; color: string }[];
  label: string;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  const r = 40;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const slices = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const rotate = total > 0 ? (offset / total) * 360 - 90 : -90;
    offset += seg.value;
    return { ...seg, dash, gap, rotate };
  });

  return (
    <svg viewBox="0 0 112 112" className="w-28 h-28 shrink-0">
      {total === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#27272a" strokeWidth="16" />
      ) : (
        slices.map((s, i) => (
          <circle
            key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth="16"
            strokeDasharray={`${s.dash} ${s.gap}`}
            style={{ transform: `rotate(${s.rotate}deg)`, transformOrigin: `${cx}px ${cy}px` }}
            opacity={0.85}
          />
        ))
      )}
      <circle cx={cx} cy={cy} r="28" fill="#18181b" />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#f4f4f5" fontSize="13" fontWeight="600">
        {total}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle" fill="#71717a" fontSize="9">
        {label}
      </text>
    </svg>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  sparkData,
  sparkColor,
  unit = '',
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  delta: number;
  sparkData: number[];
  sparkColor: string;
  unit?: string;
}) {
  const isNeutral = delta === 0;
  const positive = delta > 0;
  const TrendIcon = isNeutral ? Minus : positive ? TrendingUp : TrendingDown;
  const trendColor = isNeutral ? 'text-[#555]' : positive ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-[16px] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-lg bg-[#27272a] flex items-center justify-center text-[#71717a]">
          <Icon size={17} strokeWidth={1.5} />
        </div>
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
      <div>
        <div className="text-[26px] font-semibold text-[#f4f4f5] tracking-tight leading-none">
          {value.toLocaleString()}
          {unit && <span className="text-[16px] text-[#71717a] font-normal ml-1">{unit}</span>}
        </div>
        <div className="text-[13px] text-[#71717a] mt-1">{label}</div>
      </div>
      <div className={`flex items-center gap-1 text-[12px] font-medium ${trendColor}`}>
        <TrendIcon size={13} />
        {isNeutral ? 'No change' : `${positive ? '+' : ''}${delta}% vs last period`}
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#27272a] flex items-center justify-center mb-5">
        <GitPullRequest size={28} className="text-[#555]" />
      </div>
      <h3 className="text-[16px] font-semibold text-[#a1a1aa] mb-2">No review data yet</h3>
      <p className="text-[13px] text-[#555] max-w-sm">
        Connect a repository and open a pull request — KangBot will review it automatically and the stats will appear here.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#27272a] text-[13px] font-medium text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
      >
        Connect a repo
      </Link>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function pctDelta(current: number, prev: number): number {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 100);
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const VERDICT_CONFIG = {
  APPROVE:         { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/15', label: 'Approved' },
  REQUEST_CHANGES: { icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/8 border-red-500/15',         label: 'Changes requested' },
  COMMENT:         { icon: MinusCircle,  color: 'text-amber-400',   bg: 'bg-amber-500/8 border-amber-500/15',     label: 'Comment' },
};

const FIX_CONFIG = {
  none:    { label: 'No fix', color: 'text-[#555]' },
  pending: { label: 'Fix queued', color: 'text-amber-400' },
  running: { label: 'Fixing…', color: 'text-blue-400' },
  done:    { label: 'Fixed', color: 'text-emerald-400' },
  failed:  { label: 'Fix failed', color: 'text-red-400' },
};

const STATUS_COLOR = (rate: number) =>
  rate >= 80 ? '#10b981' : rate >= 50 ? '#eab308' : '#ef4444';
const STATUS_DOT = (rate: number) =>
  rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-400' : 'bg-red-500';
const STATUS_LABEL = (rate: number) =>
  rate >= 80 ? 'Healthy' : rate >= 50 ? 'Warning' : 'Critical';
const STATUS_TEXT = (rate: number) =>
  rate >= 80 ? 'text-emerald-400' : rate >= 50 ? 'text-amber-400' : 'text-red-400';

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [range, setRange]             = useState<Range>('30d');
  const [rangeOpen, setRangeOpen]     = useState(false);
  const [activeChart, setActiveChart] = useState<'reviews' | 'bugs'>('reviews');
  const [data, setData]               = useState<IReportStats | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const load = useCallback(async (r: Range) => {
    setLoading(true);
    setError(null);
    try {
      const stats = await fetchReportStats(RANGE_DAYS[r]);
      setData(stats);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(range); }, [range, load]);

  const selectedRange = RANGE_OPTIONS.find((o) => o.value === range)!;

  // ── Derived values ──────────────────────────────────────────────────────────

  const totals  = data?.totals  ?? { reviews: 0, bugs: 0, fixed: 0, approved: 0, requestChanges: 0, commented: 0 };
  const prev    = data?.prev    ?? { reviews: 0, bugs: 0, fixed: 0 };
  const daily   = data?.daily   ?? [];
  const byRepo  = data?.byRepo  ?? [];
  const recent  = data?.recent  ?? [];

  const fixRate     = totals.bugs > 0 ? Math.round((totals.fixed / totals.bugs) * 100) : 0;
  const savedHours  = Math.round(totals.reviews * 0.5);
  const prevSaved   = Math.round(prev.reviews * 0.5);

  const reviewsData = daily.map((d) => ({ value: d.reviews, label: d.date }));
  const bugsData    = daily.map((d) => ({ value: d.bugs,    label: d.date }));

  const sparkReviews = daily.slice(-12).map((d) => d.reviews);
  const sparkBugs    = daily.slice(-12).map((d) => d.bugs);
  const sparkFix     = daily.slice(-12).map((d, i, arr) => {
    const r = arr[i]?.reviews ?? 1;
    return r > 0 ? Math.round((d.bugs / r) * 100) : 0;
  });
  const sparkSaved   = daily.slice(-12).map((d) => Math.round(d.reviews * 0.5));

  const verdictSegments = [
    { label: 'Approved',         value: totals.approved,       color: '#10b981' },
    { label: 'Changes requested', value: totals.requestChanges, color: '#ef4444' },
    { label: 'Comment',          value: totals.commented,      color: '#3b82f6' },
  ];

  // X-axis labels
  const xStart = daily[0]?.date?.slice(5) ?? '—';
  const xEnd   = daily[daily.length - 1]?.date?.slice(5) ?? '—';

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col bg-[#1c1c1c] h-dvh overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-4 md:px-8 py-4 border-b border-[#27272a]/40 shrink-0">
        <span className="text-[12px] font-medium text-[#52525b] uppercase tracking-wider">Reports</span>
      </div>

      {/* Header */}
      <div className="px-4 md:px-8 pt-7 pb-5 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] md:text-[32px] font-semibold text-[#f4f4f5] tracking-tight leading-tight">
            Reports & Analytics
          </h1>
          <p className="text-[14px] text-[#71717a] mt-1.5">
            AI review performance, bug trends, and fix impact across your repos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Range picker */}
          <div className="relative">
            <button
              onClick={() => setRangeOpen((v) => !v)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-[13px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3f3f46] transition-all"
            >
              {selectedRange.label}
              <ChevronDown size={13} />
            </button>
            {rangeOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRangeOpen(false)} />
                <div className="absolute right-0 top-10 w-[160px] bg-[#121214] border border-[#27272a] rounded-xl shadow-xl z-20 overflow-hidden">
                  {RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setRange(opt.value); setRangeOpen(false); }}
                      className={`w-full text-left px-3.5 py-2.5 text-[13px] transition-colors ${
                        range === opt.value
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

          <button
            onClick={() => load(range)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-[13px] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#3f3f46] transition-all disabled:opacity-50"
          >
            <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={() => {
              if (!data) return;
              const csv = [
                'Date,Reviews,Bugs',
                ...daily.map((d) => `${d.date},${d.reviews},${d.bugs}`),
              ].join('\n');
              const a = document.createElement('a');
              a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
              a.download = `kangbot-report-${range}.csv`;
              a.click();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-[13px] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#3f3f46] transition-all"
          >
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-10 no-scrollbar">

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/8 border border-red-500/20 px-4 py-3 text-[13px] text-red-400">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[130px] rounded-[16px] bg-[#18181b] border border-[#27272a]" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data && totals.reviews === 0 && <EmptyState />}

        {/* Main content */}
        {!loading && !error && data && totals.reviews > 0 && (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={GitPullRequest}
                label="Reviews completed"
                value={totals.reviews}
                delta={pctDelta(totals.reviews, prev.reviews)}
                sparkData={sparkReviews}
                sparkColor="#3b82f6"
              />
              <StatCard
                icon={Bug}
                label="Bugs detected"
                value={totals.bugs}
                delta={pctDelta(totals.bugs, prev.bugs)}
                sparkData={sparkBugs}
                sparkColor="#f8423b"
              />
              <StatCard
                icon={Zap}
                label="Fix acceptance rate"
                value={fixRate}
                delta={pctDelta(totals.fixed, prev.fixed)}
                sparkData={sparkFix}
                sparkColor="#8b5cf6"
                unit="%"
              />
              <StatCard
                icon={Clock}
                label="Dev-hours saved"
                value={savedHours}
                delta={pctDelta(savedHours, prevSaved)}
                sparkData={sparkSaved}
                sparkColor="#10b981"
                unit="h"
              />
            </div>

            {/* ── Activity Chart ── */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-[16px] p-5 mb-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#f4f4f5]">Activity over time</h2>
                  <p className="text-[12px] text-[#52525b] mt-0.5">
                    {selectedRange.label} — daily breakdown
                  </p>
                </div>
                <div className="flex items-center gap-1 p-1 bg-[#121214] rounded-lg border border-[#27272a]/60">
                  {(['reviews', 'bugs'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveChart(tab)}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all capitalize ${
                        activeChart === tab
                          ? 'bg-[#27272a] text-[#f4f4f5]'
                          : 'text-[#52525b] hover:text-[#a1a1aa]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[130px]">
                {daily.length > 0 ? (
                  <BarChart
                    data={activeChart === 'reviews' ? reviewsData : bugsData}
                    color={activeChart === 'reviews' ? '#3b82f6' : '#f8423b'}
                    height={130}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-[13px] text-[#3f3f46]">
                    No daily data
                  </div>
                )}
              </div>

              {daily.length > 0 && (
                <div className="flex justify-between mt-2 text-[11px] text-[#3f3f46]">
                  <span>{xStart}</span>
                  <span>{xEnd}</span>
                </div>
              )}
            </div>

            {/* ── Bottom Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
              {/* Verdict Distribution */}
              <div className="lg:col-span-2 bg-[#18181b] border border-[#27272a] rounded-[16px] p-5">
                <h2 className="text-[15px] font-semibold text-[#f4f4f5] mb-1">Verdict distribution</h2>
                <p className="text-[12px] text-[#52525b] mb-5">Review outcomes across all repositories</p>

                <div className="flex items-center gap-6">
                  <DonutChart segments={verdictSegments} label="reviews" />
                  <div className="flex-1 space-y-3">
                    {verdictSegments.map((s) => {
                      const total = verdictSegments.reduce((a, b) => a + b.value, 0);
                      const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                      return (
                        <div key={s.label}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                              <span className="text-[12px] text-[#a1a1aa]">{s.label}</span>
                            </div>
                            <span className="text-[12px] font-medium text-[#f4f4f5]">
                              {s.value}
                              <span className="text-[#52525b] font-normal ml-1">({pct}%)</span>
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-[#27272a] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: s.color, opacity: 0.75 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Repository Health */}
              <div className="lg:col-span-3 bg-[#18181b] border border-[#27272a] rounded-[16px] p-5">
                <h2 className="text-[15px] font-semibold text-[#f4f4f5] mb-1">Repository health</h2>
                <p className="text-[12px] text-[#52525b] mb-4">Fix rate and bug density per repository</p>

                {byRepo.length === 0 ? (
                  <p className="text-[13px] text-[#3f3f46] py-4 text-center">No repository data</p>
                ) : (
                  <div className="space-y-1">
                    <div className="grid grid-cols-[1fr_60px_60px_60px_90px] gap-2 px-3 pb-2 border-b border-[#27272a]">
                      {['Repository', 'Reviews', 'Bugs', 'Fixed', 'Fix Rate'].map((h) => (
                        <span key={h} className="text-[11px] font-medium uppercase tracking-wider text-[#3f3f46]">{h}</span>
                      ))}
                    </div>
                    {byRepo.map((repo) => {
                      const rate = repo.bugs > 0 ? Math.round((repo.fixed / repo.bugs) * 100) : 100;
                      return (
                        <div
                          key={`${repo.owner}/${repo.repo}`}
                          className="grid grid-cols-[1fr_60px_60px_60px_90px] gap-2 items-center px-3 py-2.5 rounded-lg hover:bg-white/3 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT(rate)}`} />
                            <span className="text-[13px] font-medium text-[#e4e4e7] truncate">{repo.repo}</span>
                          </div>
                          <span className="text-[13px] text-[#71717a]">{repo.reviews}</span>
                          <span className="text-[13px] text-[#71717a]">{repo.bugs}</span>
                          <span className="text-[13px] text-[#71717a]">{repo.fixed}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-[#27272a] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${rate}%`, backgroundColor: STATUS_COLOR(rate), opacity: 0.8 }}
                              />
                            </div>
                            <span className={`text-[12px] font-semibold shrink-0 ${STATUS_TEXT(rate)}`}>
                              {rate}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Recent AI Reviews ── */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-[16px] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#f4f4f5]">Recent AI reviews</h2>
                  <p className="text-[12px] text-[#52525b] mt-0.5">Latest PR reviews with fix status</p>
                </div>
                <div className="flex items-center gap-3 text-[12px] text-[#52525b]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {recent.filter((r) => r.verdict === 'APPROVE').length} approved
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {recent.filter((r) => r.verdict === 'REQUEST_CHANGES').length} changes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {recent.filter((r) => r.verdict === 'COMMENT').length} comments
                  </span>
                </div>
              </div>

              {recent.length === 0 ? (
                <p className="text-[13px] text-[#3f3f46] py-4 text-center">No reviews yet</p>
              ) : (
                <div className="space-y-1">
                  {recent.map((item, i) => {
                    const vc = VERDICT_CONFIG[item.verdict];
                    const fc = FIX_CONFIG[item.fix_status];
                    const VIcon = vc.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/3 transition-colors"
                      >
                        <VIcon size={16} className={`shrink-0 ${vc.color}`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] text-[#e4e4e7] truncate block">
                            {item.pr_title ?? `PR #${item.pr_number}`}
                          </span>
                          <span className="text-[11px] text-[#52525b]">
                            {item.owner}/{item.repo} · #{item.pr_number}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${vc.bg} ${vc.color}`}>
                            {vc.label}
                          </span>
                          <span className={`text-[11px] font-medium ${fc.color}`}>{fc.label}</span>
                          {item.fix_pr_url && (
                            <a
                              href={item.fix_pr_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#555] hover:text-[#a1a1aa] transition-colors"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                          <span className="text-[12px] text-[#3f3f46] w-14 text-right">
                            {formatRelativeTime(item.updated_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
