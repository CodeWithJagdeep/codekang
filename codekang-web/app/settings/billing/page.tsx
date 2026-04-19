'use client';

import {
  ShieldCheck,
  X,
  Check,
  Sparkles,
  Bot,
  FolderGit2,
  Loader2,
  FileText,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/lib/theme';

// ── Types ──

type Plan = 'free' | 'pro' | 'enterprise';
type BillingTab = 'overview' | 'invoices' | 'payment';
type PayProvider = 'card' | 'paypal' | 'upi';

interface Invoice {
  id: string;
  period: string;
  date: string;
  status: 'paid' | 'upcoming' | 'failed';
  amount: string;
  plan: string;
}

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'paypal' | 'upi';
  label: string;
  detail: string;
  expiry?: string;
  isDefault: boolean;
}

// ── Data ──

const INVOICES: Invoice[] = [
  {
    id: 'INV-2025-09',
    period: 'Sep 2025',
    date: 'Sep 12, 2025',
    status: 'upcoming',
    amount: '$29.00',
    plan: 'Pro',
  },
  {
    id: 'INV-2025-08',
    period: 'Aug 2025',
    date: 'Aug 12, 2025',
    status: 'paid',
    amount: '$29.00',
    plan: 'Pro',
  },
  {
    id: 'INV-2025-07',
    period: 'Jul 2025',
    date: 'Jul 12, 2025',
    status: 'paid',
    amount: '$29.00',
    plan: 'Pro',
  },
  {
    id: 'INV-2025-06',
    period: 'Jun 2025',
    date: 'Jun 12, 2025',
    status: 'paid',
    amount: '$19.00',
    plan: 'Basic',
  },
  {
    id: 'INV-2025-05',
    period: 'May 2025',
    date: 'May 12, 2025',
    status: 'paid',
    amount: '$19.00',
    plan: 'Basic',
  },
  {
    id: 'INV-2025-04',
    period: 'Apr 2025',
    date: 'Apr 12, 2025',
    status: 'paid',
    amount: '$19.00',
    plan: 'Basic',
  },
];

const PLANS = [
  {
    id: 'free' as Plan,
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'For solo devs exploring AI-powered review.',
    color: '#71717a',
    features: [
      '50 AI reviews / month',
      '3 repositories',
      '1 AI agent (KangBot only)',
      'Basic bug detection',
      'Community support',
    ],
    limits: { reviews: 50, repos: 3, agents: 1 },
  },
  {
    id: 'pro' as Plan,
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing teams that ship fast.',
    color: '#6366f1',
    popular: true,
    features: [
      '500 AI reviews / month',
      'Unlimited repositories',
      'All 5 AI agents',
      'Auto-patch critical bugs',
      'Security scanner (nightly)',
      'Slack & Discord webhooks',
      'Priority support',
    ],
    limits: { reviews: 500, repos: -1, agents: 5 },
  },
  {
    id: 'enterprise' as Plan,
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large orgs with advanced compliance needs.',
    color: '#8b5cf6',
    features: [
      'Unlimited AI reviews',
      'Unlimited repositories',
      'Custom agent pipelines',
      'SSO / SAML & RBAC',
      'On-premise deployment',
      'SLA & dedicated support',
      'Audit logs & compliance',
    ],
    limits: { reviews: -1, repos: -1, agents: -1 },
  },
];

// ── Helpers ──

function UsageMeter({
  used,
  total,
  color,
}: {
  used: number;
  total: number;
  color: string;
}) {
  const pct = total === -1 ? 62 : Math.min((used / total) * 100, 100);
  const warn = pct >= 80;
  const trackBg = 'rgba(255,255,255,0.06)';
  return (
    <div
      className="h-1.5 w-full rounded-full overflow-hidden"
      style={{ background: trackBg }}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: warn ? '#dc2626' : color }}
      />
    </div>
  );
}

const STATUS_CFG = {
  paid: {
    label: 'Paid',
    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  upcoming: {
    label: 'Upcoming',
    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  failed: {
    label: 'Failed',
    cls: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

// ── Upgrade Modal ──

function UpgradeModal({
  onClose,
  onUpgrade,
}: {
  onClose: () => void;
  onUpgrade: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111' : '#ffffff';
  const textMuted = L ? '#5f6368' : '#909090';

  const handleUpgrade = () => {
    setLoading(true);
    setTimeout(() => {
      onUpgrade();
      onClose();
    }, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[460px] rounded-lg shadow-2xl animate-in zoom-in-95 fade-in duration-200 border"
        style={{ background: cardBg, borderColor: cardBorder }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
          style={{ color: textMuted }}
        >
          <X size={17} />
        </button>

        <div className="p-7">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h3
                className="text-[18px] font-bold"
                style={{ color: textPrimary }}
              >
                Upgrade to Pro
              </h3>
              <p className="text-[13px] mt-0.5" style={{ color: textMuted }}>
                Unlock the full power of CodeKang
              </p>
            </div>
          </div>

          <div
            className="flex items-baseline gap-1.5 mb-6 px-4 py-4 rounded-md border"
            style={{
              background: 'rgba(99,102,241,0.04)',
              borderColor: 'rgba(99,102,241,0.15)',
            }}
          >
            <span
              className="text-[34px] font-black"
              style={{ color: textPrimary }}
            >
              $29
            </span>
            <span className="text-[13px]" style={{ color: textMuted }}>
              /month
            </span>
            <span className="ml-auto text-[12px] text-emerald-400 font-semibold">
              14-day free trial
            </span>
          </div>

          <div className="space-y-3 mb-7">
            {[
              { text: '500 AI code reviews per month' },
              {
                text: 'All 5 AI agents — including Patch & Security',
              },
              { text: 'Unlimited connected repositories' },
              {
                text: 'Nightly security scans + auto-fix PRs',
              },
            ].map(({ text }) => (
              <div
                key={text}
                className="flex items-center gap-3 text-[13.5px]"
                style={{ color: textMuted }}
              >
                {text}
              </div>
            ))}
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3.5 rounded-md text-[15px] font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-70 border"
            style={{ borderColor: '#f97316', background: 'transparent' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Activating…
              </>
            ) : (
              'Start 14-day Free Trial'
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2.5 py-2 text-[13px] transition-colors"
            style={{ color: textMuted }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Overview ──

function OverviewTab({
  upgraded,
  currentPlan,
  onUpgrade,
}: {
  upgraded: boolean;
  currentPlan: Plan;
  onUpgrade: () => void;
}) {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111' : '#ffffff';
  const textMuted = L ? '#5f6368' : '#909090';
  const textDim = L ? '#9aa0a6' : '#555';
  const innerBg = L ? '#f8f9fa' : '#111113';

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [localUpgraded, setLocalUpgraded] = useState(upgraded);

  const activePlan = PLANS.find(
    (p) => p.id === (localUpgraded ? 'enterprise' : currentPlan),
  )!;
  const usage = { reviews: 312, repos: 5, agents: 3 };
  const limits = activePlan.limits;

  return (
    <>
      {/* Current Plan */}
      <section
        className="rounded-lg border p-6 relative overflow-hidden"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        <div className="relative flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex-1 space-y-5">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className="text-[17px] font-bold"
                    style={{ color: textPrimary }}
                  >
                    {activePlan.name} Plan
                  </h2>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    style={{
                      background: `${activePlan.color}10`,
                      color: activePlan.color,
                      borderColor: `${activePlan.color}25`,
                    }}
                  >
                    ACTIVE
                  </span>
                </div>
                <p className="text-[13px] mt-0.5" style={{ color: textMuted }}>
                  Active since Aug 12, 2024 · Next billing Sep 12, 2025
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: Sparkles,
                  label: 'AI Reviews',
                  used: usage.reviews,
                  total: limits.reviews,
                  color: '#3b82f6',
                },
                {
                  icon: FolderGit2,
                  label: 'Repositories',
                  used: usage.repos,
                  total: limits.repos,
                  color: '#10b981',
                },
                {
                  icon: Bot,
                  label: 'Agents',
                  used: usage.agents,
                  total: limits.agents,
                  color: '#8b5cf6',
                },
              ].map(({ icon: Icon, label, used, total, color }) => (
                <div
                  key={label}
                  className="rounded-md p-3.5 border"
                  style={{ background: innerBg, borderColor: cardBorder }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={13} style={{ color }} />
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: textMuted }}
                    >
                      {label}
                    </span>
                  </div>
                  <div
                    className="text-[15px] font-bold mb-2.5"
                    style={{ color: textPrimary }}
                  >
                    {used.toLocaleString()}
                    <span
                      className="text-[12px] font-normal ml-1"
                      style={{ color: textDim }}
                    >
                      / {total === -1 ? '∞' : total}
                    </span>
                  </div>
                  <UsageMeter used={used} total={total} color={color} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-4 shrink-0">
            <div className="lg:text-right">
              <div
                className="text-[30px] font-black"
                style={{ color: textPrimary }}
              >
                {activePlan.price}
                {activePlan.period && (
                  <span
                    className="text-[13px] font-normal ml-1"
                    style={{ color: textMuted }}
                  >
                    {activePlan.period}
                  </span>
                )}
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: textDim }}>
                Billed monthly · Cancel anytime
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-2 w-full lg:w-[140px]">
              {currentPlan !== 'enterprise' && !localUpgraded && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="flex items-center justify-center px-6 py-2.5 rounded-md text-[14px] font-bold text-white transition-all border"
                  style={{ borderColor: '#f97316', background: 'transparent' }}
                >
                  Upgrade
                </button>
              )}
              <button
                className="px-6 py-2.5 rounded-md border text-[14px] font-medium transition-all"
                style={{
                  borderColor: cardBorder,
                  color: textMuted,
                  background: 'transparent',
                }}
              >
                Cancel plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Plans comparison */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} style={{ color: textMuted }} />
          <h2
            className="text-[14px] font-semibold"
            style={{ color: textMuted }}
          >
            Compare plans
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PLANS.map((plan) => {
            const isActive =
              plan.id === (localUpgraded ? 'enterprise' : currentPlan);
            return (
              <div
                key={plan.id}
                className="rounded-lg border p-5 flex flex-col relative transition-all"
                style={{
                  background: isActive ? `${plan.color}05` : cardBg,
                  borderColor: isActive ? `${plan.color}35` : cardBorder,
                }}
              >
                {isActive && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: plan.color, color: '#fff' }}
                  >
                    CURRENT
                  </div>
                )}
                {plan.popular && !isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#27272a] text-[#a1a1aa]">
                    POPULAR
                  </div>
                )}
                <div className="mb-4">
                  <p
                    className="text-[15px] font-bold"
                    style={{ color: textPrimary }}
                  >
                    {plan.name}
                  </p>
                  <p
                    className="text-[12.5px] mt-0.5"
                    style={{ color: textMuted }}
                  >
                    {plan.description}
                  </p>
                </div>
                <div className="mb-5">
                  <span
                    className="text-[26px] font-black"
                    style={{ color: textPrimary }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className="text-[13px] ml-0.5"
                      style={{ color: textDim }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <div className="space-y-2.5 flex-1 mb-5">
                  {plan.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-start gap-2.5 text-[13px]"
                      style={{ color: textMuted }}
                    >
                      <Check
                        size={13}
                        className="shrink-0 mt-0.5"
                        style={{ color: plan.color }}
                      />
                      {f}
                    </div>
                  ))}
                </div>
                {isActive ? (
                  <div
                    className="py-2.5 rounded-md text-center text-[14px] font-semibold border"
                    style={{
                      color: plan.color,
                      borderColor: `${plan.color}28`,
                      background: `${plan.color}06`,
                    }}
                  >
                    Current plan
                  </div>
                ) : plan.id === 'enterprise' ? (
                  <button
                    className="py-2.5 rounded-md border text-[14px] font-medium transition-all flex items-center justify-center gap-1.5"
                    style={{ borderColor: cardBorder, color: textMuted }}
                  >
                    Contact sales
                  </button>
                ) : (
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="py-2.5 rounded-md text-[14px] font-bold text-white transition-all border"
                    style={{
                      borderColor: '#f97316',
                      background: 'transparent',
                    }}
                  >
                    Upgrade to {plan.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onUpgrade={() => {
            setLocalUpgraded(true);
            onUpgrade();
          }}
        />
      )}
    </>
  );
}

// ── Tab: Invoices ──

function InvoicesTab() {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111' : '#ffffff';
  const textMuted = L ? '#5f6368' : '#909090';
  const textDim = L ? '#9aa0a6' : '#555';
  const theadBg = L ? '#f8f9fa' : 'rgba(255,255,255,0.02)';
  const rowHover = L ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.025)';

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'paid' | 'upcoming' | 'failed'>(
    'all',
  );
  const [downloading, setDownloading] = useState<string | null>(null);

  const filtered =
    filter === 'all' ? INVOICES : INVOICES.filter((i) => i.status === filter);

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((i) => i.id)));
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownload = (id: string) => {
    setDownloading(id);
    setTimeout(() => setDownloading(null), 1200);
  };

  const handleExport = () => {
    const ids = selected.size > 0 ? [...selected] : filtered.map((i) => i.id);
    ids.forEach((id) => handleDownload(id));
  };

  const total = filtered
    .filter((i) => selected.has(i.id) || selected.size === 0)
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + parseFloat(i.amount.replace('$', '')), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1]">
            <FileText size={17} />
          </div>
          <div>
            <h2
              className="text-[15px] font-semibold"
              style={{ color: textPrimary }}
            >
              Billing history
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: textMuted }}>
              {filtered.length} invoices · ${total.toFixed(2)} total paid
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <div
            className="flex rounded-md border overflow-hidden"
            style={{ borderColor: cardBorder }}
          >
            {(['all', 'paid', 'upcoming', 'failed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-[12px] font-medium capitalize transition-all"
                style={{
                  background:
                    filter === f
                      ? L
                        ? '#e8eaed'
                        : 'rgba(255,255,255,0.08)'
                      : 'transparent',
                  color: filter === f ? textPrimary : textMuted,
                }}
              >
                {f}
              </button>
            ))}
          </div>
          {selected.size > 0 && (
            <span
              className="text-[12px] px-2 py-1 rounded-lg border"
              style={{ color: textMuted, borderColor: cardBorder }}
            >
              {selected.size} selected
            </span>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border text-[13px] font-medium transition-all"
            style={{
              borderColor: cardBorder,
              color: textMuted,
              background: 'transparent',
            }}
          >
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        <div
          className="grid items-center px-5 py-3 border-b text-[11px] font-semibold uppercase tracking-wider"
          style={{
            gridTemplateColumns: 'auto 1fr 120px 110px 100px 40px',
            borderColor: cardBorder,
            background: theadBg,
            color: textDim,
          }}
        >
          <div className="pr-4">
            <input
              type="checkbox"
              checked={selected.size === filtered.length && filtered.length > 0}
              onChange={toggleAll}
              className="w-3.5 h-3.5 rounded cursor-pointer"
            />
          </div>
          <div>Invoice</div>
          <div>Date</div>
          <div>Status</div>
          <div className="text-right">Amount</div>
          <div />
        </div>

        {filtered.length === 0 && (
          <div
            className="py-12 text-center text-[13px]"
            style={{ color: textMuted }}
          >
            No invoices match this filter
          </div>
        )}

        {filtered.map((inv, i) => {
          const sc = STATUS_CFG[inv.status];
          const isSelected = selected.has(inv.id);
          return (
            <div
              key={inv.id}
              className={`grid items-center px-5 py-4 transition-colors cursor-pointer ${i < filtered.length - 1 ? 'border-b' : ''}`}
              style={{
                gridTemplateColumns: 'auto 1fr 120px 110px 100px 40px',
                borderColor: cardBorder,
                background: isSelected
                  ? 'rgba(99,102,241,0.04)'
                  : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLElement).style.background = rowHover;
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLElement).style.background =
                    'transparent';
              }}
              onClick={() => toggle(inv.id)}
            >
              <div className="pr-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(inv.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                />
              </div>
              <div>
                <p
                  className="text-[13.5px] font-semibold"
                  style={{ color: textPrimary }}
                >
                  {inv.id}
                </p>
                <p className="text-[11.5px] mt-0.5" style={{ color: textDim }}>
                  {inv.plan} plan · {inv.period}
                </p>
              </div>
              <p className="text-[13px]" style={{ color: textMuted }}>
                {inv.date}
              </p>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${sc.cls}`}
                >
                  {sc.label}
                </span>
              </div>
              <p
                className="text-[14px] font-bold text-right"
                style={{ color: textPrimary }}
              >
                {inv.amount}
              </p>
              <div className="flex justify-end">
                <button
                  className="p-1.5 rounded-lg transition-colors text-[12px] font-medium"
                  style={{ color: textDim }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(inv.id);
                  }}
                  title="Download invoice"
                >
                  {downloading === inv.id ? '...' : 'PDF'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Payment ──

function PaymentTab() {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111' : '#ffffff';
  const textMuted = L ? '#5f6368' : '#909090';
  const textDim = L ? '#9aa0a6' : '#555';
  const inputBg = L ? '#f4f5f7' : '#111113';
  const inputBorder = L ? '#d8dadd' : '#2e2e2e';

  const [provider, setProvider] = useState<PayProvider>('card');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveCard, setSaveCard] = useState(true);
  const [editContact, setEditContact] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [contact, setContact] = useState({
    name: 'Jagdeep Singh',
    email: 'jagdeepsnh57@gmail.com',
    address: '123 Dev Lane, Bangalore, India',
    taxId: '',
  });
  const [contactDraft, setContactDraft] = useState({ ...contact });

  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: 'visa-1',
      type: 'visa',
      label: 'Visa ending in 8192',
      detail: '•••• 8192',
      expiry: '10/27',
      isDefault: true,
    },
  ]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [cardForm, setCardForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });
  const [paypalEmail, setPaypalEmail] = useState('');
  const [upiId, setUpiId] = useState('');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      const newMethod: PaymentMethod = {
        id: `${provider}-${Date.now()}`,
        type:
          provider === 'card'
            ? 'visa'
            : provider === 'paypal'
              ? 'paypal'
              : 'upi',
        label:
          provider === 'card'
            ? `Visa ending in ${cardForm.number.slice(-4) || '0000'}`
            : provider === 'paypal'
              ? `PayPal · ${paypalEmail || 'account'}`
              : `UPI · ${upiId || 'id'}`,
        detail:
          provider === 'card'
            ? `•••• ${cardForm.number.slice(-4) || '0000'}`
            : provider === 'paypal'
              ? paypalEmail
              : upiId,
        expiry: provider === 'card' ? cardForm.expiry : undefined,
        isDefault: false,
      };
      setMethods((prev) => [...prev, newMethod]);
      setTimeout(() => setSaved(false), 2500);
      setCardForm({ name: '', number: '', expiry: '', cvv: '' });
      setPaypalEmail('');
      setUpiId('');
    }, 1500);
  };

  const removeMethod = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      setMethods((prev) => prev.filter((m) => m.id !== id));
      setRemovingId(null);
    }, 800);
  };

  const makeDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const handleContactSave = () => {
    setSavingContact(true);
    setTimeout(() => {
      setContact({ ...contactDraft });
      setSavingContact(false);
      setEditContact(false);
    }, 1000);
  };

  const inputCls = `w-full rounded-md px-4 py-2.5 text-[13px] outline-none transition-all border`;
  const inputStyle = {
    background: inputBg,
    borderColor: inputBorder,
    color: textPrimary,
  };

  const PROVIDERS = [
    {
      id: 'card' as PayProvider,
      label: 'Credit / Debit Card',
      icon: null,
    },
    {
      id: 'paypal' as PayProvider,
      label: 'PayPal',
      icon: (
        <span
          className="text-[12px] font-black tracking-tight"
          style={{ color: '#009cde' }}
        >
          PayPal
        </span>
      ),
    },
    {
      id: 'upi' as PayProvider,
      label: 'UPI',
      icon: (
        <span className="text-[11px] font-black" style={{ color: '#6c63ff' }}>
          UPI
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Saved payment methods */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: cardBorder }}
        >
          <div className="flex items-center gap-3">
            <h3
              className="text-[14px] font-semibold"
              style={{ color: textPrimary }}
            >
              Saved methods
            </h3>
          </div>
          <span className="text-[12px]" style={{ color: textMuted }}>
            {methods.length} method{methods.length !== 1 ? 's' : ''}
          </span>
        </div>
        {methods.length === 0 && (
          <div
            className="py-10 text-center text-[13px]"
            style={{ color: textMuted }}
          >
            No saved payment methods
          </div>
        )}
        {methods.map((m, i) => (
          <div
            key={m.id}
            className={`flex items-center gap-4 px-5 py-4 transition-all ${i < methods.length - 1 ? 'border-b' : ''}`}
            style={{
              borderColor: cardBorder,
              opacity: removingId === m.id ? 0.4 : 1,
            }}
          >
            <div
              className="w-12 h-8 rounded-lg flex items-center justify-center border text-[11px] font-bold shrink-0"
              style={{
                background: inputBg,
                borderColor: cardBorder,
                color: textDim,
              }}
            >
              {m.type === 'visa' ? 'VISA' : m.type === 'paypal' ? 'PP' : 'UPI'}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[13.5px] font-semibold truncate"
                style={{ color: textPrimary }}
              >
                {m.label}
              </p>
              {m.expiry && (
                <p className="text-[12px] mt-0.5" style={{ color: textDim }}>
                  Expires {m.expiry}
                </p>
              )}
            </div>
            {m.isDefault ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                Default
              </span>
            ) : (
              <button
                onClick={() => makeDefault(m.id)}
                className="text-[12px] font-medium transition-colors"
                style={{ color: textMuted }}
              >
                Set default
              </button>
            )}
            <button
              onClick={() => removeMethod(m.id)}
              disabled={m.isDefault || removingId === m.id}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-30 text-[12px] font-medium"
              style={{ color: textDim }}
            >
              {removingId === m.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>

      {/* Add payment method */}
      <div
        className="rounded-lg border"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        <div
          className="px-5 py-4 border-b flex items-center gap-3"
          style={{ borderColor: cardBorder }}
        >
          <div>
            <h3
              className="text-[14px] font-semibold"
              style={{ color: textPrimary }}
            >
              Add payment method
            </h3>
            <p className="text-[12.5px] mt-0.5" style={{ color: textMuted }}>
              Choose a payment provider below
            </p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Provider tabs */}
          <div
            className="grid grid-cols-3 gap-2 p-1 rounded-md border"
            style={{ background: inputBg, borderColor: cardBorder }}
          >
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-all"
                style={{
                  background:
                    provider === p.id
                      ? L
                        ? '#ffffff'
                        : '#27272a'
                      : 'transparent',
                  color: provider === p.id ? textPrimary : textMuted,
                  boxShadow:
                    provider === p.id ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                {p.icon}
                <span className={p.id !== 'card' ? 'hidden sm:inline' : ''}>
                  {p.id === 'card' ? 'Card' : p.label}
                </span>
              </button>
            ))}
          </div>

          {/* Card form */}
          {provider === 'card' && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-[12px] font-medium mb-1.5"
                  style={{ color: textMuted }}
                >
                  Cardholder name
                </label>
                <input
                  type="text"
                  placeholder="Jagdeep Singh"
                  value={cardForm.name}
                  onChange={(e) =>
                    setCardForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  className="block text-[12px] font-medium mb-1.5"
                  style={{ color: textMuted }}
                >
                  Card number
                </label>
                <input
                  type="text"
                  placeholder="0000  0000  0000  0000"
                  value={cardForm.number}
                  onChange={(e) =>
                    setCardForm((p) => ({
                      ...p,
                      number: e.target.value.replace(/\D/g, '').slice(0, 16),
                    }))
                  }
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-[12px] font-medium mb-1.5"
                    style={{ color: textMuted }}
                  >
                    Expiry
                  </label>
                  <input
                    placeholder="MM / YY"
                    value={cardForm.expiry}
                    onChange={(e) =>
                      setCardForm((p) => ({ ...p, expiry: e.target.value }))
                    }
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    className="block text-[12px] font-medium mb-1.5"
                    style={{ color: textMuted }}
                  >
                    CVV
                  </label>
                  <div className="relative">
                    <input
                      placeholder="•••"
                      value={cardForm.cvv}
                      onChange={(e) =>
                        setCardForm((p) => ({
                          ...p,
                          cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                        }))
                      }
                      className={inputCls}
                      style={{ ...inputStyle }}
                    />
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div
                    className="w-4 h-4 rounded border transition-all peer-checked:border-[#6366f1]"
                    style={{
                      borderColor: cardBorder,
                      background: saveCard ? '#6366f1' : 'transparent',
                    }}
                  >
                    {saveCard && (
                      <Check
                        size={10}
                        strokeWidth={3}
                        className="text-white m-auto"
                        style={{
                          display: 'flex',
                          marginTop: '2px',
                          marginLeft: '2px',
                        }}
                      />
                    )}
                  </div>
                </div>
                <span className="text-[13px]" style={{ color: textMuted }}>
                  Save card for future payments
                </span>
              </label>
            </div>
          )}

          {/* PayPal form */}
          {provider === 'paypal' && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-[12px] font-medium mb-1.5"
                  style={{ color: textMuted }}
                >
                  PayPal email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div
                className="p-3.5 rounded-md border flex items-start gap-3"
                style={{
                  background: 'rgba(0,156,222,0.04)',
                  borderColor: 'rgba(0,156,222,0.15)',
                }}
              >
                <p className="text-[12.5px]" style={{ color: '#009cde' }}>
                  You&apos;ll be redirected to PayPal to authorize the payment.
                  No password or card details shared with CodeKang.
                </p>
              </div>
            </div>
          )}

          {/* UPI form */}
          {provider === 'upi' && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-[12px] font-medium mb-1.5"
                  style={{ color: textMuted }}
                >
                  UPI ID
                </label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div
                className="p-3.5 rounded-md border flex items-start gap-3"
                style={{
                  background: 'rgba(108,99,255,0.04)',
                  borderColor: 'rgba(108,99,255,0.15)',
                }}
              >
                <p className="text-[12.5px]" style={{ color: '#6c63ff' }}>
                  A payment request will be sent to your UPI app. Supports
                  Google Pay, PhonePe, Paytm, and all BHIM-UPI apps.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex-1 py-2.5 rounded-md text-[13.5px] font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: saved ? '#10b981' : '#6366f1' }}
            >
              {saving
                ? 'Saving…'
                : saved
                  ? 'Saved!'
                  : `Add ${provider === 'card' ? 'card' : provider === 'paypal' ? 'PayPal' : 'UPI'}`}
            </button>
          </div>

          <div
            className="flex items-center gap-2 p-3 rounded-md border"
            style={{
              background: L ? '#f8f9fa' : 'rgba(59,130,246,0.03)',
              borderColor: L ? '#e2e4e7' : 'rgba(59,130,246,0.1)',
            }}
          >
            <ShieldCheck
              size={13}
              className="shrink-0"
              style={{ color: '#60a5fa' }}
            />
            <p className="text-[12px]" style={{ color: '#60a5fa' }}>
              Secured by Stripe. Card details are never stored on CodeKang
              servers.
            </p>
          </div>
        </div>
      </div>

      {/* Billing contact */}
      <div
        className="rounded-lg border"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: cardBorder }}
        >
          <div>
            <h3
              className="text-[14px] font-semibold"
              style={{ color: textPrimary }}
            >
              Billing contact
            </h3>
            <p className="text-[12.5px] mt-0.5" style={{ color: textMuted }}>
              Used on invoices and receipts
            </p>
          </div>
          {!editContact ? (
            <button
              onClick={() => {
                setContactDraft({ ...contact });
                setEditContact(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border text-[13px] font-medium transition-all"
              style={{ borderColor: cardBorder, color: textMuted }}
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditContact(false)}
                className="px-3 py-1.5 rounded-md border text-[13px] font-medium transition-all"
                style={{ borderColor: cardBorder, color: textMuted }}
              >
                Cancel
              </button>
              <button
                onClick={handleContactSave}
                disabled={savingContact}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-bold text-white transition-all disabled:opacity-70"
                style={{ background: '#6366f1' }}
              >
                {savingContact ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {editContact ? (
            <>
              {[
                {
                  key: 'name',
                  label: 'Full name',
                  placeholder: 'Jagdeep Singh',
                  type: 'text',
                },
                {
                  key: 'email',
                  label: 'Email',
                  placeholder: 'you@example.com',
                  type: 'email',
                },
                {
                  key: 'address',
                  label: 'Address',
                  placeholder: '123 Dev Lane…',
                  type: 'text',
                },
                {
                  key: 'taxId',
                  label: 'Tax ID / GST',
                  placeholder: 'Optional',
                  type: 'text',
                },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label
                    className="block text-[12px] font-medium mb-1.5"
                    style={{ color: textMuted }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={contactDraft[key as keyof typeof contactDraft]}
                    onChange={(e) =>
                      setContactDraft((p) => ({ ...p, [key]: e.target.value }))
                    }
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                { label: 'Name', value: contact.name },
                { label: 'Email', value: contact.email },
                { label: 'Address', value: contact.address },
                { label: 'Tax ID', value: contact.taxId || '—' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4"
                >
                  <span
                    className="text-[12px] font-semibold uppercase tracking-wider shrink-0 mt-0.5"
                    style={{ color: textDim }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[13px] text-right"
                    style={{ color: textMuted }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──

const TABS: {
  id: BillingTab;
  label: string;
}[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'payment', label: 'Payment' },
];

export default function BillingPage() {
  const { resolved } = useTheme();
  const L = resolved === 'light';

  const [activeTab, setActiveTab] = useState<BillingTab>('overview');
  const [upgraded, setUpgraded] = useState(false);
  const currentPlan: Plan = 'pro';

  const textPrimary = L ? '#111' : '#ffffff';
  const textMuted = L ? '#5f6368' : '#909090';
  const tabBorder = L ? '#e2e4e7' : '#222';
  const activeTabBg = L ? '#ffffff' : '#1e1e1e';
  const activeTabBorder = L ? '#e2e4e7' : '#2e2e2e';

  return (
    <div className="max-w-4xl mx-auto space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Page title */}
      <div>
        <h1
          className="text-[24px] font-bold tracking-tight"
          style={{ color: textPrimary }}
        >
          Billing
        </h1>
        <p className="text-[13.5px] mt-1" style={{ color: textMuted }}>
          Manage your subscription, invoices, and payment methods.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-md border w-fit"
        style={{
          background: L ? '#f4f5f7' : '#141414',
          borderColor: tabBorder,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
              style={{
                background: isActive ? activeTabBg : 'transparent',
                color: isActive ? textPrimary : textMuted,
                border: isActive
                  ? `1px solid ${activeTabBorder}`
                  : '1px solid transparent',
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab
          upgraded={upgraded}
          currentPlan={currentPlan}
          onUpgrade={() => setUpgraded(true)}
        />
      )}
      {activeTab === 'invoices' && <InvoicesTab />}
      {activeTab === 'payment' && <PaymentTab />}
    </div>
  );
}
