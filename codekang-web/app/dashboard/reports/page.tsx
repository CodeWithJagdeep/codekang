'use client';

import { useState, useMemo } from 'react';
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
} from 'lucide-react';

// ── Types ──

type Range = '7d' | '30d' | '90d' | 'all';

// ── Mock data generators ──

function generateBarData(count: number, base: number, variance: number) {
  return Array.from({ length: count }, (_, i) => ({
    value: Math.max(0, base + Math.round((Math.random() - 0.4) * variance)),
    label: i,
  }));
}

const DATA: Record<
  Range,
  {
    reviews: { value: number; label: number }[];
    bugs: { value: number; label: number }[];
    statsReviews: number;
    statsBugs: number;
    statsFixed: number;
    statsSaved: number;
    deltaReviews: number;
    deltaBugs: number;
    deltaFixed: number;
    deltaSaved: number;
  }
> = {
  '7d': {
    reviews: generateBarData(7, 18, 14),
    bugs: generateBarData(7, 11, 8),
    statsReviews: 124,
    statsBugs: 73,
    statsFixed: 68,
    statsSaved: 28,
    deltaReviews: 12,
    deltaBugs: -4,
    deltaFixed: 9,
    deltaSaved: 18,
  },
  '30d': {
    reviews: generateBarData(30, 16, 18),
    bugs: generateBarData(30, 9, 10),
    statsReviews: 487,
    statsBugs: 312,
    statsFixed: 274,
    statsSaved: 118,
    deltaReviews: 23,
    deltaBugs: 8,
    deltaFixed: 15,
    deltaSaved: 31,
  },
  '90d': {
    reviews: generateBarData(90, 14, 20),
    bugs: generateBarData(90, 8, 12),
    statsReviews: 1402,
    statsBugs: 876,
    statsFixed: 754,
    statsSaved: 341,
    deltaReviews: 34,
    deltaBugs: 11,
    deltaFixed: 28,
    deltaSaved: 44,
  },
  all: {
    reviews: generateBarData(60, 12, 22),
    bugs: generateBarData(60, 7, 14),
    statsReviews: 3841,
    statsBugs: 2109,
    statsFixed: 1876,
    statsSaved: 924,
    deltaReviews: 41,
    deltaBugs: 19,
    deltaFixed: 37,
    deltaSaved: 55,
  },
};

const REPOS = [
  {
    name: 'codekang-api',
    reviews: 84,
    bugs: 31,
    fixed: 28,
    rate: 90,
    status: 'healthy',
  },
  {
    name: 'codekang-web',
    reviews: 62,
    bugs: 19,
    fixed: 15,
    rate: 79,
    status: 'healthy',
  },
  {
    name: 'auth-service',
    reviews: 47,
    bugs: 24,
    fixed: 18,
    rate: 75,
    status: 'warning',
  },
  {
    name: 'infra-terraform',
    reviews: 23,
    bugs: 8,
    fixed: 8,
    rate: 100,
    status: 'healthy',
  },
  {
    name: 'mobile-rn',
    reviews: 38,
    bugs: 17,
    fixed: 9,
    rate: 53,
    status: 'critical',
  },
];

const SEVERITY = [
  { label: 'Critical', value: 14, color: '#ef4444' },
  { label: 'High', value: 38, color: '#f97316' },
  { label: 'Medium', value: 87, color: '#eab308' },
  { label: 'Low', value: 173, color: '#3b82f6' },
];

const AI_ACTIONS = [
  {
    repo: 'codekang-api',
    action: 'Remove unused imports in auth.ts',
    type: 'accepted',
    time: '2h ago',
  },
  {
    repo: 'codekang-web',
    action: 'Fix race condition in useEffect hook',
    type: 'accepted',
    time: '4h ago',
  },
  {
    repo: 'auth-service',
    action: 'Add null check before JWT decode',
    type: 'accepted',
    time: '6h ago',
  },
  {
    repo: 'mobile-rn',
    action: 'Refactor navigation stack to v6 API',
    type: 'dismissed',
    time: '8h ago',
  },
  {
    repo: 'codekang-api',
    action: 'Optimize N+1 query in UserService',
    type: 'pending',
    time: '10h ago',
  },
  {
    repo: 'infra-terraform',
    action: 'Pin provider versions for reproducibility',
    type: 'accepted',
    time: '1d ago',
  },
  {
    repo: 'auth-service',
    action: 'Replace bcrypt with argon2 for hashing',
    type: 'dismissed',
    time: '1d ago',
  },
  {
    repo: 'mobile-rn',
    action: 'Add error boundary around PaymentScreen',
    type: 'pending',
    time: '2d ago',
  },
];

// ── SVG Bar Chart ──

function BarChart({
  data,
  color,
  height = 120,
}: {
  data: { value: number; label: number }[];
  color: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 600;
  const barWidth = Math.max(2, Math.floor((w / data.length) * 0.6));
  const gap = w / data.length;

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className="w-full"
      preserveAspectRatio="none"
    >
      {data.map((d, i) => {
        const barH = Math.max(2, (d.value / max) * (height - 8));
        const x = i * gap + gap / 2 - barWidth / 2;
        const y = height - barH;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barH}
            rx={barWidth > 4 ? 2 : 1}
            fill={color}
            opacity={0.7}
          />
        );
      })}
    </svg>
  );
}

// ── SVG Sparkline ──

function Sparkline({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`,
    )
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-7" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

// ── Donut Chart ──

function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  const r = 40;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const slices = segments.map((seg) => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const rotate = (offset / total) * 360 - 90;
    offset += seg.value;
    return { ...seg, dash, gap, rotate };
  });

  return (
    <svg viewBox="0 0 112 112" className="w-28 h-28 shrink-0">
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="16"
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={0}
          style={{ transform: `rotate(${s.rotate}deg)`, transformOrigin: `${cx}px ${cy}px` }}
          opacity={0.85}
        />
      ))}
      <circle cx={cx} cy={cy} r="28" fill="#18181b" />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fill="#f4f4f5"
        fontSize="13"
        fontWeight="600"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 11}
        textAnchor="middle"
        fill="#71717a"
        fontSize="9"
      >
        bugs
      </text>
    </svg>
  );
}

// ── Sub-components ──

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
  const positive = delta >= 0;
  const TrendIcon = positive ? TrendingUp : TrendingDown;

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
          {unit && (
            <span className="text-[16px] text-[#71717a] font-normal ml-1">
              {unit}
            </span>
          )}
        </div>
        <div className="text-[13px] text-[#71717a] mt-1">{label}</div>
      </div>
      <div
        className={`flex items-center gap-1 text-[12px] font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}
      >
        <TrendIcon size={13} />
        {positive ? '+' : ''}
        {delta}% vs last period
      </div>
    </div>
  );
}

const STATUS_CONFIG = {
  healthy: { label: 'Healthy', color: 'text-emerald-400', dot: 'bg-emerald-500' },
  warning: { label: 'Warning', color: 'text-amber-400', dot: 'bg-amber-400' },
  critical: { label: 'Critical', color: 'text-red-400', dot: 'bg-red-500' },
};

const ACTION_CONFIG = {
  accepted: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8 border-emerald-500/15',
    label: 'Accepted',
  },
  dismissed: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/8 border-red-500/15',
    label: 'Dismissed',
  },
  pending: {
    icon: MinusCircle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/8 border-amber-500/15',
    label: 'Pending',
  },
};

const RANGE_OPTIONS: { label: string; value: Range }[] = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time', value: 'all' },
];

// ── Page ──

export default function ReportsPage() {
  const [range, setRange] = useState<Range>('30d');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [activeChart, setActiveChart] = useState<'reviews' | 'bugs'>('reviews');

  const d = useMemo(() => DATA[range], [range]);
  const fixRate = Math.round((d.statsFixed / d.statsBugs) * 100);
  const fixSparkData = d.bugs.map((b, i) => {
    const r = d.reviews[i]?.value ?? 1;
    return r > 0 ? Math.round((b.value / r) * 100) : 0;
  });

  const selectedRange = RANGE_OPTIONS.find((o) => o.value === range)!;

  return (
    <div className="flex-1 flex flex-col bg-[#1c1c1c] h-dvh overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-4 md:px-8 py-4 border-b border-[#27272a]/40 shrink-0">
        <span className="text-[12px] font-medium text-[#52525b] uppercase tracking-wider">
          Reports
        </span>
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
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setRangeOpen(false)}
                />
                <div className="absolute right-0 top-10 w-[160px] bg-[#121214] border border-[#27272a] rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setRange(opt.value);
                        setRangeOpen(false);
                      }}
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

          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-[13px] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#3f3f46] transition-all">
            <RefreshCcw size={13} />
            Refresh
          </button>

          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-[13px] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#3f3f46] transition-all">
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-10 no-scrollbar">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={GitPullRequest}
            label="Reviews completed"
            value={d.statsReviews}
            delta={d.deltaReviews}
            sparkData={d.reviews.slice(-12).map((r) => r.value)}
            sparkColor="#3b82f6"
          />
          <StatCard
            icon={Bug}
            label="Bugs detected"
            value={d.statsBugs}
            delta={d.deltaBugs}
            sparkData={d.bugs.slice(-12).map((r) => r.value)}
            sparkColor="#f97316"
          />
          <StatCard
            icon={Zap}
            label="Fix acceptance rate"
            value={fixRate}
            delta={d.deltaFixed}
            sparkData={fixSparkData.slice(-12)}
            sparkColor="#8b5cf6"
            unit="%"
          />
          <StatCard
            icon={Clock}
            label="Dev-hours saved"
            value={d.statsSaved}
            delta={d.deltaSaved}
            sparkData={d.reviews.slice(-12).map((r) => Math.round(r.value * 0.28))}
            sparkColor="#10b981"
            unit="h"
          />
        </div>

        {/* ── Activity Chart ── */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-[16px] p-5 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-semibold text-[#f4f4f5]">
                Activity over time
              </h2>
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
            <BarChart
              data={activeChart === 'reviews' ? d.reviews : d.bugs}
              color={activeChart === 'reviews' ? '#3b82f6' : '#f97316'}
              height={130}
            />
          </div>

          {/* X-axis hint */}
          <div className="flex justify-between mt-2 text-[11px] text-[#3f3f46]">
            <span>
              {range === '7d'
                ? 'Mon'
                : range === '30d'
                  ? '1'
                  : range === '90d'
                    ? 'Jan'
                    : 'Start'}
            </span>
            <span>
              {range === '7d'
                ? 'Sun'
                : range === '30d'
                  ? '30'
                  : range === '90d'
                    ? 'Now'
                    : 'Now'}
            </span>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
          {/* Bug Severity */}
          <div className="lg:col-span-2 bg-[#18181b] border border-[#27272a] rounded-[16px] p-5">
            <h2 className="text-[15px] font-semibold text-[#f4f4f5] mb-1">
              Bug severity
            </h2>
            <p className="text-[12px] text-[#52525b] mb-5">
              Distribution across all repositories
            </p>

            <div className="flex items-center gap-6">
              <DonutChart segments={SEVERITY} />

              <div className="flex-1 space-y-3">
                {SEVERITY.map((s) => {
                  const total = SEVERITY.reduce((a, b) => a + b.value, 0);
                  const pct = Math.round((s.value / total) * 100);
                  return (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          <span className="text-[12px] text-[#a1a1aa]">
                            {s.label}
                          </span>
                        </div>
                        <span className="text-[12px] font-medium text-[#f4f4f5]">
                          {s.value}
                          <span className="text-[#52525b] font-normal ml-1">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-[#27272a] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: s.color,
                            opacity: 0.7,
                          }}
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
            <h2 className="text-[15px] font-semibold text-[#f4f4f5] mb-1">
              Repository health
            </h2>
            <p className="text-[12px] text-[#52525b] mb-4">
              Fix rate and bug density per repository
            </p>

            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_60px_60px_60px_90px] gap-2 px-3 pb-2 border-b border-[#27272a]">
                {['Repository', 'Reviews', 'Bugs', 'Fixed', 'Fix Rate'].map(
                  (h) => (
                    <span
                      key={h}
                      className="text-[11px] font-medium uppercase tracking-wider text-[#3f3f46]"
                    >
                      {h}
                    </span>
                  ),
                )}
              </div>

              {REPOS.map((repo) => {
                const cfg = STATUS_CONFIG[repo.status as keyof typeof STATUS_CONFIG];
                return (
                  <div
                    key={repo.name}
                    className="grid grid-cols-[1fr_60px_60px_60px_90px] gap-2 items-center px-3 py-2.5 rounded-lg hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                      <span className="text-[13px] font-medium text-[#e4e4e7] truncate">
                        {repo.name}
                      </span>
                    </div>
                    <span className="text-[13px] text-[#71717a]">
                      {repo.reviews}
                    </span>
                    <span className="text-[13px] text-[#71717a]">
                      {repo.bugs}
                    </span>
                    <span className="text-[13px] text-[#71717a]">
                      {repo.fixed}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#27272a] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${repo.rate}%`,
                            backgroundColor:
                              repo.rate >= 85
                                ? '#10b981'
                                : repo.rate >= 65
                                  ? '#eab308'
                                  : '#ef4444',
                            opacity: 0.8,
                          }}
                        />
                      </div>
                      <span
                        className={`text-[12px] font-semibold shrink-0 ${cfg.color}`}
                      >
                        {repo.rate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── AI Suggestions Feed ── */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-[16px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#f4f4f5]">
                Recent AI suggestions
              </h2>
              <p className="text-[12px] text-[#52525b] mt-0.5">
                Latest automated fix proposals across repositories
              </p>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-[#52525b]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {AI_ACTIONS.filter((a) => a.type === 'accepted').length} accepted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {AI_ACTIONS.filter((a) => a.type === 'pending').length} pending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {AI_ACTIONS.filter((a) => a.type === 'dismissed').length} dismissed
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {AI_ACTIONS.map((action, i) => {
              const cfg = ACTION_CONFIG[action.type as keyof typeof ACTION_CONFIG];
              const ActionIcon = cfg.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/3 transition-colors"
                >
                  <ActionIcon size={16} className={`shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-[#e4e4e7] truncate block">
                      {action.action}
                    </span>
                    <span className="text-[11px] text-[#52525b]">
                      {action.repo}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-[12px] text-[#3f3f46] w-14 text-right">
                      {action.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
