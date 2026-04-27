'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiShieldFlashLine,
  RiLockLine,
  RiTeamLine,
  RiBarChartLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiGlobalLine,
  RiServerLine,
  RiCustomerService2Line,
  RiFileListLine,
  RiKey2Line,
  RiBuildingLine,
  RiPlugLine,
  RiSpeedLine,
  RiAlertLine,
  RiEyeLine,
  RiAddLine,
  RiSubtractLine,
  RiGithubLine,
  RiSlackLine,
} from 'react-icons/ri';
import {
  SiGithub,
  SiGitlab,
  SiBitbucket,
  SiJira,
  SiSlack,
  SiLinear,
  SiDatadog,
  SiPagerduty,
} from 'react-icons/si';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';

// ── Feature pillars ───────────────────────────────────────────────────────────

const PILLARS = [
  {
    icon: RiShieldFlashLine,
    color: '#f97316',
    title: 'Security & Compliance',
    description: 'SOC 2 Type II, GDPR, and HIPAA-ready. Data never leaves your region. Audit logs for every action.',
  },
  {
    icon: RiLockLine,
    color: '#a78bfa',
    title: 'SSO & Identity',
    description: 'SAML 2.0, OIDC, Okta, Azure AD, Google Workspace. Role-based access control with custom permission groups.',
  },
  {
    icon: RiServerLine,
    color: '#34d399',
    title: 'Dedicated Infrastructure',
    description: 'Run Kang on dedicated, single-tenant infrastructure. Physical isolation for your most sensitive workloads.',
  },
  {
    icon: RiCustomerService2Line,
    color: '#60a5fa',
    title: 'Dedicated Support',
    description: '24/7 Slack Connect with a named CSM. SLA-backed response times. Onboarding, training, and quarterly reviews.',
  },
];

// ── Security grid ─────────────────────────────────────────────────────────────

const SECURITY_ITEMS = [
  { icon: RiShieldFlashLine, label: 'SOC 2 Type II' },
  { icon: RiGlobalLine, label: 'GDPR compliant' },
  { icon: RiFileListLine, label: 'HIPAA ready' },
  { icon: RiLockLine, label: 'AES-256 at rest' },
  { icon: RiKey2Line, label: 'TLS 1.3 in transit' },
  { icon: RiEyeLine, label: 'Full audit log' },
  { icon: RiAlertLine, label: 'SIEM integration' },
  { icon: RiServerLine, label: 'Data residency' },
  { icon: RiBuildingLine, label: 'Dedicated Cloud' },
];

// ── Integrations ──────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { Icon: SiGithub, name: 'GitHub Enterprise', color: '#ffffff' },
  { Icon: SiGitlab, name: 'GitLab Self-Managed', color: '#fc6d26' },
  { Icon: SiBitbucket, name: 'Bitbucket', color: '#0052cc' },
  { Icon: SiJira, name: 'Jira', color: '#0052cc' },
  { Icon: SiSlack, name: 'Slack', color: '#4a154b' },
  { Icon: SiLinear, name: 'Linear', color: '#5e6ad2' },
  { Icon: SiDatadog, name: 'Datadog', color: '#632ca6' },
  { Icon: SiPagerduty, name: 'PagerDuty', color: '#06AC38' },
];

// ── Capabilities comparison ───────────────────────────────────────────────────

const COMPARE = [
  { feature: 'AI code review', team: true, enterprise: true },
  { feature: 'Autonomous fix PRs', team: true, enterprise: true },
  { feature: 'Risk scoring', team: true, enterprise: true },
  { feature: 'Unlimited repositories', team: false, enterprise: true },
  { feature: 'SSO / SAML / OIDC', team: false, enterprise: true },
  { feature: 'Custom AI model fine-tuning', team: false, enterprise: true },
  { feature: 'Dedicated single-tenant deploy', team: false, enterprise: true },
  { feature: 'Data residency (EU / US / APAC)', team: false, enterprise: true },
  { feature: 'Dedicated CSM + Slack Connect', team: false, enterprise: true },
  { feature: '99.9% uptime SLA', team: false, enterprise: true },
  { feature: 'Advanced audit logs & SIEM', team: false, enterprise: true },
  { feature: 'Custom review rule sets', team: false, enterprise: true },
  { feature: 'Priority support (1 h SLA)', team: false, enterprise: true },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: 'How long does enterprise onboarding take?',
    a: 'Most teams are fully onboarded within 5 business days. Your dedicated CSM handles the integration, SSO configuration, and team training. For large orgs (500+ engineers) we offer a phased rollout plan.',
  },
  {
    q: 'What is dedicated infrastructure?',
    a: 'For enterprise customers, we offer single-tenant cloud deployments. Your data and compute are physically isolated from other customers, ensuring maximum security and zero noise from other workloads.',
  },
  {
    q: 'What data does Kang retain?',
    a: 'By default, Kang retains review metadata (not source code) for 90 days. In private deployment mode you control all retention policies. We are SOC 2 Type II audited and never train on your code.',
  },
  {
    q: 'How does the fine-tuned model work?',
    a: 'Enterprise plans include a custom model that learns your codebase conventions, team patterns, and historical bug categories. It improves silently over time and can be retrained on demand.',
  },
  {
    q: 'What SCM providers are supported?',
    a: 'GitHub.com, GitHub Enterprise Server, GitLab.com, GitLab Self-Managed, Bitbucket Cloud, and Bitbucket Data Center. Azure DevOps and Gerrit are on the roadmap.',
  },
  {
    q: 'Do you offer volume discounts for large teams?',
    a: 'Enterprise pricing is seat-based with significant volume tiers. Most customers with 100+ seats see 40–60% lower per-seat costs compared to our Team plan. Contact sales for a custom quote.',
  },
];

// ── Stat strip ────────────────────────────────────────────────────────────────

const STATS = [
  { value: '500+', label: 'Enterprise customers' },
  { value: '2 M+', label: 'PRs reviewed / month' },
  { value: '99.97%', label: 'Platform uptime' },
  { value: '<30 s', label: 'Average review latency' },
];

// ── FAQ item ──────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left text-[15px] font-semibold text-[#e8e8e8] hover:text-white transition-colors"
      >
        <span>{q}</span>
        <span className="shrink-0 w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[#555]">
          {open ? <RiSubtractLine size={13} /> : <RiAddLine size={13} />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[14px] text-[#666] leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white selection:bg-[#f97316]/30 font-[family-name:var(--font-geist-sans)]">
      <HomeHeader />

      {/* ── Hero ── */}
      <section className="relative px-6 md:px-10 lg:px-16 pt-24 pb-32 overflow-hidden">
        {/* Background grain */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '200px' }} />
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#f97316] opacity-[0.04] blur-[140px] pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/20 bg-[#f97316]/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#f97316] mb-8">
                <RiBuildingLine size={11} />
                Enterprise
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-[family-name:var(--font-space-grotesk)] text-5xl sm:text-6xl md:text-7xl font-black leading-none tracking-tight text-white mb-6"
            >
              AI code review<br />built for teams that<br /><span className="text-[#f97316]">can't afford risk.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="text-[17px] text-white/50 leading-relaxed max-w-2xl mx-auto mb-10 tracking-normal"
            >
              Enterprise-grade security at CodeKang, dedicated infrastructure, custom AI fine-tuning, and a named team to make sure every PR your engineers merge is safe.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.42 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/in/contact"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#f97316] px-10 py-4 text-[14px] font-bold text-white hover:bg-[#ea6c0a] transition-all shadow-[0_0_36px_rgba(249,115,22,0.28)] hover:shadow-[0_0_56px_rgba(249,115,22,0.38)]">
                Talk to sales
                <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/in/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-10 py-4 text-[14px] font-bold text-white hover:bg-white/5 transition-all">
                Compare plans
              </Link>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              className="mt-5 text-[12px] text-[#333]">
              Custom pricing · Dedicated CSM · 99.9% uptime SLA
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── Stat strip ── */}
      <section className="px-6 md:px-10 lg:px-16 py-16 border-y border-white/5 bg-[#111113]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-10"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          >
            {STATS.map((s, i) => (
              <motion.div key={i}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                className="text-center">
                <p className="text-3xl md:text-4xl font-black text-[#f97316] tracking-tight">{s.value}</p>
                <p className="text-[13px] text-[#555] mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Four pillars ── */}
      <section className="px-6 md:px-10 lg:px-16 py-28">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">Why enterprise</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Built for regulated,<br />high-scale engineering orgs
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          >
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, y: 28, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: 'easeOut' as const } } }}
                  className="group relative rounded-2xl border border-white/5 bg-[#111113] p-8 hover:border-white/10 transition-colors overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top left, ${p.color}07, transparent 60%)` }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${p.color}12`, border: `1px solid ${p.color}20` }}>
                    <Icon size={18} style={{ color: p.color }} />
                  </div>
                  <h3 className="text-[17px] font-bold text-[#e8e8e8] mb-2">{p.title}</h3>
                  <p className="text-[14px] text-[#666] leading-relaxed">{p.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Security & Compliance ── */}
      <section className="px-6 md:px-10 lg:px-16 py-24 border-t border-white/5 bg-[#111113]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: 'easeOut' as const }}
            >
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-5">Security first</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-5">
                Your code stays in<br />your infrastructure
              </h2>
                <p className="text-[15px] text-[#666] leading-relaxed mb-8">
                  Kang's enterprise tier is independently audited and built for orgs operating in regulated environments. We never train on your code. You control retention, residency, and access — entirely.
                </p>
              <ul className="space-y-3">
                {[
                  'Code never stored after review completes',
                  'Dedicated single-tenant infrastructure available',
                  'SAML SSO enforced at the org level',
                  'Immutable audit log exported to your SIEM',
                  'Penetration tested annually by third party',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[14px] text-[#888]">
                    <RiCheckboxCircleLine size={15} className="text-[#34d399] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Grid of badges */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: 'easeOut' as const, delay: 0.15 }}
              className="grid grid-cols-3 gap-3"
            >
              {SECURITY_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                    className="aspect-square rounded-2xl border border-white/5 bg-[#0d0d0f] flex flex-col items-center justify-center gap-3 p-4 hover:border-[#f97316]/20 transition-colors group"
                  >
                    <Icon size={20} className="text-[#444] group-hover:text-[#f97316] transition-colors" />
                    <span className="text-[10px] font-semibold text-[#444] text-center leading-snug group-hover:text-[#888] transition-colors">{item.label}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Private deployment visual ── */}
      <section className="px-6 md:px-10 lg:px-16 py-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Diagram mockup */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: 'easeOut' as const }}
              className="order-2 lg:order-1"
            >
              <div className="rounded-2xl border border-white/8 bg-[#111113] p-6">
                {/* VPC wrapper */}
                <div className="rounded-xl border border-[#34d399]/20 bg-[#34d399]/4 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#34d399] mb-4">Isolated Cloud</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: RiServerLine, label: 'KangBot Engine', sub: 'Private container' },
                      { icon: RiLockLine, label: 'Secrets vault', sub: 'Your KMS' },
                      { icon: RiBarChartLine, label: 'Review DB', sub: 'Encrypted at rest' },
                      { icon: RiEyeLine, label: 'Audit logger', sub: 'Streams to SIEM' },
                    ].map((node, i) => {
                      const Icon = node.icon;
                      return (
                        <motion.div key={i}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 + i * 0.08 }}
                          className="rounded-xl border border-white/5 bg-[#0d0d0f] p-4 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#34d399]/10 flex items-center justify-center shrink-0">
                            <Icon size={15} className="text-[#34d399]" />
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold text-[#e8e8e8]">{node.label}</p>
                            <p className="text-[10px] text-[#444]">{node.sub}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Arrow down */}
                <div className="flex justify-center my-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-6 w-px bg-white/10" />
                    <span className="text-[10px] text-[#333] px-3 py-1 rounded-full border border-white/5">mTLS encrypted</span>
                    <div className="h-6 w-px bg-white/10" />
                  </div>
                </div>

                {/* GitHub connector */}
                <div className="rounded-xl border border-white/5 bg-[#0d0d0f] px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <RiGithubLine size={15} className="text-[#888]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#888]">GitHub Enterprise Cloud</p>
                    <p className="text-[10px] text-[#333]">Secure Cloud Integration</p>
                  </div>
                  <div className="ml-auto flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#22c55e] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: 'easeOut' as const, delay: 0.15 }}
              className="order-1 lg:order-2"
            >
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#34d399] mb-5">Private deployment</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-5">
                Isolated,<br />Dedicated Cloud
              </h2>
              <p className="text-[15px] text-[#666] leading-relaxed mb-8">
                For teams with strict data sovereignty requirements. Deploy Kang on dedicated, single-tenant cloud infrastructure. Full physical isolation and custom retention policies are supported.
              </p>
              <div className="space-y-4">
                {[
                  { icon: RiPlugLine, text: 'Works with GitHub Enterprise, GitLab Self-Managed, Bitbucket DC' },
                  { icon: RiShieldFlashLine, text: 'All traffic stays within your network perimeter' },
                  { icon: RiSpeedLine, text: 'Horizontally scalable to 1 000+ active repos' },
                  { icon: RiSlackLine, text: 'Dedicated infrastructure team supports your rollout' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 text-[14px] text-[#888]">
                      <div className="w-6 h-6 rounded-lg bg-[#34d399]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={12} className="text-[#34d399]" />
                      </div>
                      {item.text}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className="px-6 md:px-10 lg:px-16 py-24 border-t border-white/5 bg-[#111113]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">Integrations</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Fits your existing stack
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            {INTEGRATIONS.map((int, i) => {
              const Icon = int.Icon;
              return (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } } }}
                  className="group rounded-2xl border border-white/5 bg-[#0d0d0f] p-5 flex flex-col items-center gap-3 hover:border-white/12 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/8 transition-colors">
                    <Icon size={20} color={int.color} />
                  </div>
                  <span className="text-[12px] text-[#555] text-center group-hover:text-[#888] transition-colors">{int.name}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Plan comparison ── */}
      <section className="px-6 md:px-10 lg:px-16 py-28">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">Comparison</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Team vs Enterprise
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/8 bg-[#111113] overflow-hidden"
          >
            {/* Header */}
            <div className="grid grid-cols-3 px-6 py-4 bg-[#0d0d0f] border-b border-white/5">
              <div />
              <div className="text-center">
                <p className="text-[12px] font-bold text-[#888] uppercase tracking-widest">Team</p>
                <p className="text-[11px] text-[#444] mt-0.5">$99 / mo</p>
              </div>
              <div className="text-center">
                <p className="text-[12px] font-bold text-[#f97316] uppercase tracking-widest">Enterprise</p>
                <p className="text-[11px] text-[#555] mt-0.5">Custom pricing</p>
              </div>
            </div>

            {COMPARE.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-6 py-3.5 text-[13px] border-b border-white/[0.04] ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <span className="text-[#666]">{row.feature}</span>
                <div className="flex justify-center">
                  {row.team
                    ? <RiCheckboxCircleLine size={16} className="text-[#34d399]" />
                    : <span className="w-4 h-px bg-[#333] mt-2" />}
                </div>
                <div className="flex justify-center">
                  <RiCheckboxCircleLine size={16} className="text-[#f97316]" />
                </div>
              </div>
            ))}

            <div className="grid grid-cols-3 px-6 py-5 bg-[#0d0d0f]">
              <div />
              <div className="flex justify-center">
                <Link href="/in/pricing" className="text-[12px] font-semibold text-[#555] hover:text-white transition-colors">
                  See Team plan
                </Link>
              </div>
              <div className="flex justify-center">
                <Link href="/in/contact"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#f97316] px-5 py-2 text-[12px] font-bold text-white hover:bg-[#ea6c0a] transition-colors">
                  Talk to sales
                  <RiArrowRightLine size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Dedicated support ── */}
      <section className="px-6 md:px-10 lg:px-16 py-24 border-t border-white/5 bg-[#111113]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: 'easeOut' as const }}
            >
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#60a5fa] mb-5">Support</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-5">
                A named engineer,<br />not a ticket queue
              </h2>
              <p className="text-[15px] text-[#666] leading-relaxed mb-8">
                Every enterprise account gets a dedicated Customer Success Manager — a real engineer who knows your stack, attends your planning meetings, and picks up the Slack thread in minutes, not days.
              </p>
              <div className="space-y-4">
                {[
                  '24/7 Slack Connect with your CSM',
                  'Onboarding workshop with your engineering leads',
                  '1-hour SLA for P1 incidents',
                  'Monthly review calls & usage reports',
                  'Early access to new features',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[14px] text-[#888]">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#60a5fa]" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Support card mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: 'easeOut' as const, delay: 0.15 }}
            >
              <div className="rounded-2xl border border-white/8 bg-[#0d0d0f] overflow-hidden">
                {/* Slack-style header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span className="text-[13px] font-semibold text-[#888]"># kang-enterprise-acme</span>
                  <div className="ml-auto flex items-center gap-2">
                    <RiTeamLine size={14} className="text-[#444]" />
                    <span className="text-[11px] text-[#333]">4 members</span>
                  </div>
                </div>
                <div className="p-5 space-y-4 text-[13px]">
                  {[
                    { who: 'Jordan (Acme)', msg: 'Hey, we\'re seeing higher-than-usual review latency on the billing service repo. Any idea what\'s up?', time: '9:03 AM', you: false },
                    { who: 'Alex (Kang CSM)', msg: 'On it — I\'m seeing a queue spike. Scaling up dedicated workers now. Should clear in ~2 mins. I\'ll send a root cause summary.', time: '9:04 AM', you: false },
                    { who: 'Alex (Kang CSM)', msg: 'Resolved. Root cause: a repo-wide re-analysis job collided with your morning PR burst. We\'ve added queue isolation for your account. Won\'t happen again.', time: '9:06 AM', you: false },
                    { who: 'Jordan (Acme)', msg: 'That was fast, thank you!', time: '9:07 AM', you: true },
                  ].map((msg, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12 }}
                      className={`flex gap-3 ${msg.you ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${msg.you ? 'bg-[#f97316]/20 text-[#f97316]' : 'bg-[#60a5fa]/15 text-[#60a5fa]'}`}>
                        {msg.who.split(' ')[0][0]}
                      </div>
                      <div className={`max-w-[75%] ${msg.you ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold ${msg.you ? 'text-[#f97316]/60' : 'text-[#60a5fa]/60'}`}>{msg.who}</span>
                          <span className="text-[9px] text-[#333]">{msg.time}</span>
                        </div>
                        <div className={`rounded-xl px-3.5 py-2.5 text-[12px] leading-relaxed ${msg.you ? 'bg-[#f97316]/10 text-[#bbb] rounded-tr-sm' : 'bg-white/[0.04] text-[#888] rounded-tl-sm'}`}>
                          {msg.msg}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 md:px-10 lg:px-16 py-28">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Common questions
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {FAQ.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-10 lg:px-16 py-28 border-t border-white/5 bg-[#111113]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-6xl font-black tracking-tighter text-white mb-5">
            Let's secure your<br /><span className="text-[#f97316]">entire codebase.</span>
          </h2>
          <p className="text-[16px] text-white/40 leading-relaxed mb-10 max-w-xl mx-auto">
            Talk to a solutions engineer and get a custom demo tailored to your stack, team size, and compliance requirements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/in/contact"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#f97316] px-10 py-4 text-[14px] font-bold text-white hover:bg-[#ea6c0a] transition-all shadow-[0_0_40px_rgba(249,115,22,0.3)] hover:shadow-[0_0_60px_rgba(249,115,22,0.4)]">
              Talk to sales
              <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/in/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-10 py-4 text-[14px] font-bold text-white hover:bg-white/5 transition-all">
              View all plans
            </Link>
          </div>
          <p className="mt-6 text-[12px] text-[#333]">Custom pricing · Proof-of-concept available · SOC 2 report on request</p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
