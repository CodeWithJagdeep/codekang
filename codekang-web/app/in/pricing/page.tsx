'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Minus, ChevronDown, ArrowRight, Zap, Shield, Users, Building2,
  GitPullRequest, Sparkles, Lock, Clock, RefreshCw, Star,
} from 'lucide-react';
import { RiFlashlightLine, RiShieldFlashLine, RiTeamLine, RiBuilding2Line } from 'react-icons/ri';
import Footer from '@/component/Footer';
import HomeHeader from '@/component/HomeHeader';

// ── Types ────────────────────────────────────────────────────────────────────

type FeatureValue = boolean | string;

interface FeatureRow {
  name: string;
  tooltip?: string;
  values: [FeatureValue, FeatureValue, FeatureValue, FeatureValue]; // [free, starter, team, enterprise]
}

interface FeatureGroup {
  label: string;
  icon: React.ElementType;
  rows: FeatureRow[];
}

// ── Plan data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'For solo devs exploring AI review',
    icon: Sparkles,
    color: '#71717a',
    monthly: 0,
    annual: 0,
    billingNote: 'forever free',
    cta: 'Get started free',
    href: '/in/login',
    popular: false,
    highlight: [],
  },
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'Full reviews at half the industry price',
    icon: Zap,
    color: '#f97316',
    monthly: 25,
    annual: 19,
    billingNote: 'per seat',
    cta: 'Start free trial',
    href: '/in/login',
    popular: true,
    highlight: ['PR reviews included', '14-day free trial'],
  },
  {
    key: 'team',
    name: 'Team',
    tagline: 'Flat org pricing — not per-seat',
    icon: Users,
    color: '#a78bfa',
    monthly: 99,
    annual: 79,
    billingNote: 'per org · 20 seats included',
    cta: 'Start free trial',
    href: '/in/login',
    popular: false,
    highlight: ['Unlimited credits', 'Autonomous fix PRs'],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'For large orgs with compliance needs',
    icon: Building2,
    color: '#60a5fa',
    monthly: -1,
    annual: -1,
    billingNote: 'custom contract',
    cta: 'Contact sales',
    href: '/in/contact',
    popular: false,
    highlight: ['SSO / SAML', 'Self-hosting option'],
  },
] as const;

// ── Feature comparison data ───────────────────────────────────────────────────

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    label: 'Repositories',
    icon: GitPullRequest,
    rows: [
      { name: 'Private repositories',   values: ['5',        '20',       'Unlimited', 'Unlimited'] },
      { name: 'Public repositories',    values: ['Unlimited','Unlimited','Unlimited', 'Unlimited'] },
    ],
  },
  {
    label: 'AI Code Review',
    icon: Sparkles,
    rows: [
      { name: 'PR Summarization',       values: [true,  true,  true,  true]  },
      { name: 'Full PR Reviews',        values: [false, true,  true,  true]  },
      { name: 'Inline Comments',        values: [false, true,  true,  true]  },
      { name: 'Linter & SAST',          values: [false, true,  true,  true]  },
      { name: 'Docstring Generation',   values: [false, true,  true,  true]  },
      { name: 'Reviews per hour',       values: ['Limited', 'Unlimited', 'Unlimited', 'Unlimited'] },
    ],
  },
  {
    label: 'AI Credits',
    icon: Zap,
    rows: [
      { name: 'Credits per month',      values: ['50', '400', 'Unlimited', 'Unlimited'] },
      { name: 'Autofix suggestions',    values: [false, false, true,  true]  },
    ],
  },
  {
    label: 'Autonomous AI',
    icon: RiFlashlightLine as React.ElementType,
    rows: [
      { name: 'Auto-fix PRs',           values: [false, false, true,  true]  },
      { name: 'Unit Test Generation',   values: [false, false, true,  true]  },
      { name: 'Merge Conflict Resolution', values: [false, false, true, true] },
      { name: 'Issue Planner',          values: [false, false, true,  true]  },
    ],
  },
  {
    label: 'Integrations',
    icon: Shield,
    rows: [
      { name: 'GitHub & GitLab',        values: [true,  true,  true,  true]  },
      { name: 'Jira / Linear',          values: [false, true,  true,  true]  },
      { name: 'MCP Connections',        values: ['—',   '3',   'Unlimited', 'Unlimited'] },
      { name: 'API Access',             values: [false, false, true,  true]  },
    ],
  },
  {
    label: 'Team & Security',
    icon: Lock,
    rows: [
      { name: 'Analytics Reports',      values: [false, true,  true,  true]  },
      { name: 'Custom Reports',         values: [false, false, true,  true]  },
      { name: 'Team RBAC',              values: [false, false, true,  true]  },
      { name: 'Audit Logging',          values: [false, false, true,  true]  },
      { name: 'SSO / SAML',            values: [false, false, false, true]  },
      { name: 'Self-hosting',           values: [false, false, false, true]  },
      { name: 'SLA Support',            values: [false, false, false, true]  },
      { name: 'Dedicated CSM',          values: [false, false, false, true]  },
    ],
  },
];

// ── FAQ data ──────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What are AI credits and how are they used?',
    a: 'Credits power every AI action — a PR review costs 5 credits, a chat message costs 1, an autonomous fix costs 10. Free plan includes 50/month. Starter includes 400/month. Team plan has unlimited credits.',
  },
  {
    q: 'What\'s the difference between Starter and Team?',
    a: 'Starter is per-seat billing ($25/mo per person) with full AI reviews. Team is flat org pricing ($99/mo for up to 20 seats) and unlocks autonomous features: auto-fix PRs, unit test generation, merge conflict resolution, and the issue planner.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes — every paid plan starts with a 14-day full-feature trial. No credit card required to start. After 14 days, you\'ll be asked to subscribe or you\'ll revert to the Free plan.',
  },
  {
    q: 'How does autonomous fix work?',
    a: 'When KangBot finds a fixable issue during a review, it opens a separate pull request with the corrected code — ready to review and merge. You keep full control; the PR is just a suggestion with the fix already applied.',
  },
  {
    q: 'Can I cancel or downgrade anytime?',
    a: 'Yes. Cancel from your billing settings at any time. Your subscription stays active until the end of the current billing period, then you\'re moved to the Free plan with no charge.',
  },
  {
    q: 'What repositories and Git providers do you support?',
    a: 'GitHub and GitLab are fully supported. Bitbucket and Azure DevOps support is in active development. All plans get unlimited public repo access.',
  },
  {
    q: 'What happens when I run out of credits?',
    a: 'On paid plans, AI reviews are paused until your credits reset on the 1st of each month. You can also purchase a credit top-up from billing settings. Team plan users never run out — credits are unlimited.',
  },
  {
    q: 'Is my source code stored or used for training?',
    a: 'No. CodeKang never stores your source code or diffs beyond the duration of the review request. We do not use your code to train any AI models. Reviews are processed ephemerally and discarded immediately.',
  },
  {
    q: 'Do you offer discounts for startups or students?',
    a: 'Yes. Contact us with proof of student enrollment for a free Starter plan for 12 months. Y Combinator, Techstars, and other accelerator companies get 50% off for the first year.',
  },
  {
    q: 'What\'s included in the Enterprise plan?',
    a: 'Everything in Team plus: SSO/SAML, self-hosting option, custom SLA, dedicated customer success manager, custom integrations, multi-org support, advanced audit logging, and GDPR/SOC2 documentation on request.',
  },
];

// ── Trust items ───────────────────────────────────────────────────────────────

const TRUST = [
  { icon: Lock,       label: 'SOC2 Type II',           sub: 'Security audited' },
  { icon: Shield,     label: 'GDPR Compliant',         sub: 'EU data residency available' },
  { icon: Clock,      label: '99.9% uptime SLA',       sub: 'On Enterprise plans' },
  { icon: RefreshCw,  label: '30-day money-back',      sub: 'No questions asked' },
];

// ── Helper: render a single cell value ───────────────────────────────────────

function Cell({ value, planColor }: { value: FeatureValue; planColor: string }) {
  if (value === true)
    return <Check size={16} style={{ color: planColor }} strokeWidth={2.5} className="mx-auto" />;
  if (value === false)
    return <Minus size={14} className="mx-auto text-[#333]" />;
  return <span className="text-[12px] font-medium text-[#888]">{value as string}</span>;
}

// ── PlanCard ─────────────────────────────────────────────────────────────────

function PlanCard({ plan, annual }: { plan: typeof PLANS[number]; annual: boolean }) {
  const price = annual ? plan.annual : plan.monthly;
  const isCustom = price === -1;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative flex flex-col rounded-2xl border p-6 overflow-hidden"
      style={{
        background: plan.popular ? `${plan.color}07` : '#0d0d10',
        borderColor: plan.popular ? `${plan.color}35` : 'rgba(255,255,255,0.07)',
      }}
    >
      {/* Corner glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100"
        style={{ background: `${plan.color}20` }}
      />

      {plan.popular && (
        <div
          className="absolute -top-px left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${plan.color}80, transparent)` }}
        />
      )}

      {plan.popular && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
          style={{ background: plan.color, color: '#fff' }}
        >
          Most popular
        </div>
      )}

      {/* Plan header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
            style={{ background: `${plan.color}15` }}
          >
            <plan.icon size={18} style={{ color: plan.color }} />
          </div>
          <h3 className="text-[17px] font-bold text-white">{plan.name}</h3>
          <p className="text-[12px] text-[#555] mt-0.5 leading-snug">{plan.tagline}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-5">
        {isCustom ? (
          <div className="text-[32px] font-black text-white leading-none">Custom</div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-[42px] font-black text-white leading-none">${price}</span>
            <div className="ml-1">
              <div className="text-[12px] text-[#555]">/mo</div>
              <div className="text-[10px] text-[#444]">{plan.billingNote}</div>
            </div>
          </div>
        )}
        {annual && !isCustom && price > 0 && (
          <p className="text-[11px] text-emerald-400 mt-1.5">
            Save ${(plan.monthly - plan.annual) * 12}/yr vs monthly
          </p>
        )}
      </div>

      {/* Highlights */}
      {plan.highlight.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {plan.highlight.map((h) => (
            <span
              key={h}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: plan.color, borderColor: `${plan.color}30`, background: `${plan.color}08` }}
            >
              {h}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <Link
        href={plan.href}
        className="flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold transition-all mb-5 group"
        style={
          plan.popular
            ? { background: plan.color, color: '#fff', boxShadow: `0 0 24px ${plan.color}40` }
            : { border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', background: 'transparent' }
        }
      >
        {plan.cta}
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* Feature list */}
      <div className="border-t border-white/5 pt-5 space-y-3">
        {FEATURE_GROUPS.flatMap((g) => g.rows)
          .filter((row) => {
            const idx = ['free','starter','team','enterprise'].indexOf(plan.key);
            return row.values[idx as 0|1|2|3] === true || (typeof row.values[idx as 0|1|2|3] === 'string' && row.values[idx as 0|1|2|3] !== '—' && row.values[idx as 0|1|2|3] !== false);
          })
          .slice(0, 7)
          .map((row) => {
            const idx = ['free','starter','team','enterprise'].indexOf(plan.key) as 0|1|2|3;
            const val = row.values[idx];
            return (
              <div key={row.name} className="flex items-center gap-2.5 text-[13px] text-[#888]">
                <Check size={13} style={{ color: plan.color, flexShrink: 0 }} strokeWidth={2.5} />
                <span>{typeof val === 'string' && val !== 'Unlimited' ? `${val} ${row.name.toLowerCase()}` : row.name}</span>
              </div>
            );
          })}
      </div>
    </motion.div>
  );
}

// ── Feature comparison table ──────────────────────────────────────────────────

function ComparisonTable({ annual }: { annual: boolean }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(FEATURE_GROUPS.map((g) => g.label)));

  const toggle = (label: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  const planColors = PLANS.map((p) => p.color);

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/7 bg-[#0a0a0c]">
      {/* Sticky header row */}
      <div className="grid sticky top-0 z-10 bg-[#0d0d10] border-b border-white/7"
        style={{ gridTemplateColumns: '1fr repeat(4, minmax(100px, 140px))' }}
      >
        <div className="px-6 py-5 text-[12px] font-semibold text-[#444] uppercase tracking-widest">
          Features
        </div>
        {PLANS.map((plan) => {
          const price = annual ? plan.annual : plan.monthly;
          return (
            <div key={plan.key} className="px-4 py-5 text-center border-l border-white/5">
              <p className="text-[13px] font-bold text-white mb-0.5">{plan.name}</p>
              <p className="text-[12px]" style={{ color: plan.color }}>
                {price === -1 ? 'Custom' : price === 0 ? 'Free' : `$${price}/mo`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Groups */}
      {FEATURE_GROUPS.map((group) => {
        const open = expanded.has(group.label);
        return (
          <div key={group.label} className="border-b border-white/5 last:border-0">
            {/* Group header */}
            <button
              onClick={() => toggle(group.label)}
              className="w-full grid items-center hover:bg-white/[0.02] transition-colors"
              style={{ gridTemplateColumns: '1fr repeat(4, minmax(100px, 140px))' }}
            >
              <div className="px-6 py-4 flex items-center gap-2.5 col-span-1">
                <group.icon size={14} className="text-[#555] shrink-0" />
                <span className="text-[13px] font-semibold text-[#aaa]">{group.label}</span>
                <ChevronDown
                  size={13}
                  className={`text-[#444] ml-auto transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
              </div>
              <div className="col-span-4" />
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {group.rows.map((row, ri) => (
                    <div
                      key={row.name}
                      className="grid items-center border-t border-white/[0.04] hover:bg-white/[0.015] transition-colors"
                      style={{ gridTemplateColumns: '1fr repeat(4, minmax(100px, 140px))' }}
                    >
                      <div className="px-6 py-3.5 pl-11">
                        <span className="text-[13px] text-[#666]">{row.name}</span>
                      </div>
                      {row.values.map((val, pi) => (
                        <div key={pi} className="px-4 py-3.5 text-center border-l border-white/[0.04]">
                          <Cell value={val} planColor={planColors[pi]} />
                        </div>
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {FAQS.map((faq, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/7 overflow-hidden bg-[#0d0d10]"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
          >
            <span className="text-[14px] font-semibold text-white">{faq.q}</span>
            <ChevronDown
              size={16}
              className={`text-[#555] shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-5 text-[13.5px] text-[#888] leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white selection:bg-[#f97316]/30">
      <HomeHeader />

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#f97316] opacity-[0.04] blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[12px] font-semibold text-[#888] mb-8">
            <Star size={11} className="text-[#f97316]" />
            14-day free trial on all paid plans · No credit card required
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[72px] font-black tracking-tight leading-[1.0] mb-6">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Pricing that makes
            </span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #f97316, #f8423b)' }}
            >
              sense for teams
            </span>
          </h1>

          <p className="text-[17px] text-[#777] max-w-xl mx-auto mb-10 leading-relaxed">
            No per-seat tricks on the Team plan. No feature gating behind paywalls.
            Start free, upgrade when you&apos;re ready.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/[0.03]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-6 py-2 rounded-full text-[14px] font-semibold transition-all ${!annual ? 'bg-white text-[#09090b] shadow-lg' : 'text-[#666] hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-6 py-2 rounded-full text-[14px] font-semibold transition-all flex items-center gap-2 ${annual ? 'bg-white text-[#09090b] shadow-lg' : 'text-[#666] hover:text-white'}`}
            >
              Annual
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                SAVE 20%
              </span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Plan cards ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {PLANS.map((plan) => (
            <PlanCard key={plan.key} plan={plan} annual={annual} />
          ))}
        </motion.div>
      </section>

      {/* ── Trust bar ── */}
      <section className="border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-[#555]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">{label}</p>
                <p className="text-[11px] text-[#555]">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature comparison ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Compare every feature
          </h2>
          <p className="text-[#666] text-[15px]">
            Click any group to expand. No hidden limitations.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <ComparisonTable annual={annual} />
        </motion.div>
      </section>

      {/* ── Enterprise callout ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-[#60a5fa]/15 bg-[#060810] overflow-hidden p-10 md:p-14"
        >
          <div className="absolute top-0 left-0 w-[400px] h-[300px] bg-[#60a5fa] opacity-[0.04] blur-[80px] rounded-full pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#60a5fa]/10 flex items-center justify-center">
                  <RiBuilding2Line size={20} className="text-[#60a5fa]" />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#60a5fa]">
                  Enterprise
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                Need SSO, self-hosting, or a dedicated SLA?
              </h3>
              <p className="text-[15px] text-[#666] leading-relaxed mb-6">
                Enterprise includes everything in Team plus custom contract terms, on-premise deployment, SAML/SSO, multi-org support, dedicated CSM, and SOC2/GDPR documentation.
              </p>
              <div className="flex flex-wrap gap-2">
                {['SSO / SAML', 'Self-hosting', 'Dedicated CSM', 'Custom SLA', 'Multi-org', 'GDPR docs'].map((f) => (
                  <span key={f} className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-[#60a5fa]/8 border border-[#60a5fa]/15 text-[#60a5fa]/80">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 lg:pl-10">
              <Link
                href="/in/contact"
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#60a5fa] text-[15px] font-bold text-white hover:bg-[#3b82f6] transition-colors"
              >
                Contact sales <ArrowRight size={16} />
              </Link>
              <Link
                href="/in/login"
                className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-[15px] font-semibold text-[#888] hover:bg-white/5 transition-colors"
              >
                Start free trial first
              </Link>
              <p className="text-center text-[12px] text-[#444]">
                Usually responds within 1 business day
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Frequently asked questions
          </h2>
          <p className="text-[#666] text-[15px]">
            Still have questions?{' '}
            <Link href="/in/contact" className="text-[#f97316] hover:underline">
              Contact us
            </Link>
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <FAQ />
        </motion.div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-white/7 bg-[#0a0a0c] overflow-hidden py-20 text-center"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-[#f97316] opacity-[0.05] rounded-full blur-[60px]" />
          </div>
          <div className="relative px-6">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">
              Get started today
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
              Your first 14 days are free
            </h2>
            <p className="text-[#666] text-[16px] max-w-md mx-auto mb-10">
              Full Starter plan features. No credit card. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/in/login"
                className="flex items-center gap-2 rounded-2xl bg-[#f97316] px-8 py-4 text-[15px] font-bold text-white hover:bg-[#ea6c0a] transition-colors shadow-[0_0_40px_rgba(249,115,22,0.25)]"
              >
                Start free trial <ArrowRight size={16} />
              </Link>
              <Link
                href="/in/contact"
                className="flex items-center gap-2 rounded-2xl border border-white/10 px-8 py-4 text-[15px] font-bold text-white hover:bg-white/5 transition-colors"
              >
                Talk to sales
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
