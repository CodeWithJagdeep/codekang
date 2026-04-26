'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  RiArrowRightLine,
  RiFlashlightLine,
  RiShieldFlashLine,
  RiGitPullRequestLine,
  RiRocketLine,
  RiTeamLine,
  RiCodeSSlashLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiSpeedLine,
  RiGitMergeLine,
  RiBugLine,
  RiLockLine,
  RiBarChartLine,
  RiStarFill,
  RiArrowRightSLine,
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';

// ── Typewriter hook ───────────────────────────────────────────────────────────

const ACTIONS = [
  'Review a pull request',
  'Detect security issues',
  'Fix an N+1 query',
  'Analyse architecture impact',
  'Open an auto-fix PR',
  'Score risk across the diff',
];

function useTypewriter(items: string[], speed = 45, pause = 1800) {
  const [display, setDisplay] = useState('');
  const [itemIdx, setItemIdx] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'erasing'>('typing');

  useEffect(() => {
    const current = items[itemIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (display.length < current.length) {
        timeout = setTimeout(() => setDisplay(current.slice(0, display.length + 1)), speed);
      } else {
        timeout = setTimeout(() => setPhase('pausing'), pause);
      }
    } else if (phase === 'pausing') {
      timeout = setTimeout(() => setPhase('erasing'), 200);
    } else {
      if (display.length > 0) {
        timeout = setTimeout(() => setDisplay(display.slice(0, -1)), speed / 2);
      } else {
        setItemIdx((i) => (i + 1) % items.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(timeout);
  }, [display, phase, itemIdx, items, speed, pause]);

  return display;
}

// ── Auto-advance progress bar ─────────────────────────────────────────────────

function useAutoTab(count: number, duration = 4000) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);

  const advance = useCallback(() => {
    setActive((i) => (i + 1) % count);
    setProgress(0);
    startRef.current = performance.now();
  }, [count]);

  const jumpTo = (i: number) => {
    pausedRef.current = false;
    setActive(i);
    setProgress(0);
    startRef.current = performance.now();
  };

  useEffect(() => {
    startRef.current = performance.now();

    const tick = (now: number) => {
      if (!pausedRef.current) {
        const elapsed = now - startRef.current;
        const pct = Math.min(elapsed / duration, 1);
        setProgress(pct);
        if (pct >= 1) advance();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [advance, duration]);

  return { active, progress, jumpTo };
}

// ── Section data ──────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    word: 'REVIEW',
    accent: '#f97316',
    label: 'Code Intelligence',
    tabs: [
      {
        title: 'Contextual analysis',
        icon: RiCodeSSlashLine,
        body: 'KangBot reads your entire codebase history, not just the diff. It understands how changes ripple through architecture and flags issues a simple linter would miss.',
        mockup: <ReviewMockup />,
      },
      {
        title: 'Inline comments',
        icon: RiCheckboxCircleLine,
        body: 'Every finding lands as a pinned comment on the exact line. Clear, actionable, educational — so your team actually learns from each review.',
        mockup: <InlineMockup />,
      },
      {
        title: 'Risk scoring',
        icon: RiBarChartLine,
        body: 'Each PR gets a risk score based on blast radius, code complexity, test coverage, and historical bug density. High-risk PRs escalate automatically.',
        mockup: <RiskMockup />,
      },
    ],
  },
  {
    word: 'FIX',
    accent: '#a78bfa',
    label: 'Autonomous Execution',
    tabs: [
      {
        title: 'Auto-fix PRs',
        icon: RiGitMergeLine,
        body: 'When KangBot spots a fixable issue it doesn\'t just comment — it opens a ready-to-merge PR with the correct fix in seconds. No ticket, no back-and-forth.',
        mockup: <AutofixMockup />,
      },
      {
        title: 'Security patches',
        icon: RiLockLine,
        body: 'Hardcoded secrets, SQL injection vectors, missing auth guards — KangBot patches them automatically so vulnerabilities never reach main.',
        mockup: <SecurityMockup />,
      },
      {
        title: 'Performance fixes',
        icon: RiSpeedLine,
        body: 'N+1 queries, missing indexes, blocking synchronous calls — KangBot finds the bottleneck and submits the optimised version for one-click merge.',
        mockup: <PerfMockup />,
      },
    ],
  },
  {
    word: 'BUILD',
    accent: '#34d399',
    label: 'Team Workflow',
    tabs: [
      {
        title: 'Team insights',
        icon: RiTeamLine,
        body: 'Aggregated review stats across your org: average review time, hotspot files, recurring error categories, and individual contributor trends.',
        mockup: <TeamMockup />,
      },
      {
        title: 'PR velocity',
        icon: RiTimeLine,
        body: 'See exactly where time is lost in your review cycle. KangBot highlights bottlenecks and suggests workflow changes that cut review latency by up to 70%.',
        mockup: <VelocityMockup />,
      },
      {
        title: 'Bug prevention',
        icon: RiBugLine,
        body: 'Learn which patterns keep causing bugs in your specific codebase. KangBot builds a custom rule set from your history and enforces it on every new PR.',
        mockup: <BugMockup />,
      },
    ],
  },
  {
    word: 'SHIP',
    accent: '#60a5fa',
    label: 'Speed at Scale',
    tabs: [
      {
        title: 'Zero config',
        icon: RiRocketLine,
        body: 'Install the GitHub App once. No YAML, no CI scripts, no per-repo setup. KangBot is reviewing your first PR in under 90 seconds.',
        mockup: <ZeroConfigMockup />,
      },
      {
        title: 'Any language',
        icon: RiFlashlightLine,
        body: 'TypeScript, Python, Go, Rust, Ruby, Java — KangBot\'s language model understands the idioms, patterns, and footguns of each ecosystem natively.',
        mockup: <LangMockup />,
      },
      {
        title: 'Scales to 1 000+ repos',
        icon: RiShieldFlashLine,
        body: 'From a solo side-project to a monorepo with 500 engineers. KangBot\'s infrastructure auto-scales so review latency stays under 30 seconds at any volume.',
        mockup: <ScaleMockup />,
      },
    ],
  },
];

// ── Minimal mockup components ─────────────────────────────────────────────────

function ReviewMockup() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111113] overflow-hidden text-[12px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0d0d0f]">
        <div className="w-2 h-2 rounded-full bg-[#ef4444]/60" />
        <div className="w-2 h-2 rounded-full bg-[#f59e0b]/60" />
        <div className="w-2 h-2 rounded-full bg-[#22c55e]/60" />
        <span className="ml-2 text-[#444] font-mono text-[11px]">KangBot · PR #247</span>
      </div>
      <div className="p-4 space-y-2.5">
        {[
          { c: '#ef4444', f: 'auth/jwt.ts:34', m: 'JWT secret falls back to hardcoded value.' },
          { c: '#f59e0b', f: 'api/users.ts:89', m: 'N+1 query — batch with findMany.' },
          { c: '#60a5fa', f: 'utils/cache.ts:12', m: 'Cache TTL is 0 — set minimum 60 s.' },
        ].map((it, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}
            className="rounded-lg p-2.5 border-l-2" style={{ background: `${it.c}08`, borderColor: it.c }}>
            <span className="font-mono text-[10px]" style={{ color: it.c }}>{it.f}</span>
            <p className="mt-0.5 text-[#666]">{it.m}</p>
          </motion.div>
        ))}
        <div className="flex items-center gap-1.5 pt-1 text-[10px] text-[#444]">
          <RiCheckboxCircleLine size={11} className="text-[#22c55e]" />
          Risk: <span className="text-[#f59e0b] font-bold">Medium</span> · 3 issues
        </div>
      </div>
    </div>
  );
}

function InlineMockup() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111113] overflow-hidden font-mono text-[11px]">
      <div className="px-4 py-3 border-b border-white/5 bg-[#0d0d0f] text-[#444]">src/auth/session.ts</div>
      {[
        { line: 42, code: "  const token = sign(payload, key);", hl: false },
        { line: 43, code: "  res.cookie('sid', token, { httpOnly: false });", hl: true },
        { line: 44, code: "  return token;", hl: false },
      ].map((l) => (
        <div key={l.line} className={`flex gap-3 px-4 py-1 ${l.hl ? 'bg-[#f97316]/8 border-l-2 border-[#f97316]' : ''}`}>
          <span className="text-[#333] w-4 shrink-0">{l.line}</span>
          <span className={l.hl ? 'text-[#f97316]/80' : 'text-[#555]'}>{l.code}</span>
        </div>
      ))}
      <div className="mx-4 mb-4 mt-2 rounded-lg p-3 bg-[#f97316]/8 border border-[#f97316]/20 text-[10px] text-[#aaa]">
        <span className="text-[#f97316] font-bold">KangBot:</span> Cookie is missing <code className="text-[#f97316]">httpOnly: true</code> — session tokens are accessible via JS and vulnerable to XSS.
      </div>
    </div>
  );
}

function RiskMockup() {
  const bars = [{ l: 'Complexity', v: 72, c: '#f59e0b' }, { l: 'Test coverage', v: 38, c: '#ef4444' }, { l: 'Blast radius', v: 55, c: '#f97316' }, { l: 'History score', v: 81, c: '#34d399' }];
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111113] p-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-semibold text-[#e8e8e8]">PR Risk Score</span>
        <span className="text-[20px] font-black text-[#f59e0b]">61</span>
      </div>
      {bars.map((b) => (
        <div key={b.l}>
          <div className="flex justify-between text-[10px] text-[#555] mb-1"><span>{b.l}</span><span style={{ color: b.c }}>{b.v}%</span></div>
          <div className="h-1.5 rounded-full bg-white/5">
            <motion.div className="h-full rounded-full" style={{ background: b.c }} initial={{ width: 0 }} animate={{ width: `${b.v}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AutofixMockup() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111113] overflow-hidden text-[12px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0d0d0f]">
        <RiGitPullRequestLine size={12} className="text-[#22c55e]" />
        <span className="text-[#e8e8e8] font-semibold text-[11px]">fix: resolve JWT secret fallback</span>
        <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e]">Opened by KangBot</span>
      </div>
      <div className="p-4 font-mono text-[11px] space-y-0.5">
        {[
          { t: '  const secret = process.env.JWT_SECRET', type: 'rm' },
          { t: "    ?? 'fallback-key';", type: 'rm' },
          { t: '  const secret = process.env.JWT_SECRET;', type: 'add' },
          { t: "  if (!secret) throw new Error('JWT_SECRET required');", type: 'add' },
        ].map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.08 }}
            className="flex gap-2 px-1.5 py-0.5 rounded"
            style={{ background: l.type === 'rm' ? 'rgba(239,68,68,0.07)' : 'rgba(34,197,94,0.07)' }}>
            <span className={`font-bold ${l.type === 'rm' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>{l.type === 'rm' ? '−' : '+'}</span>
            <span className={l.type === 'rm' ? 'text-[#ef4444]/70' : 'text-[#22c55e]/90'}>{l.t}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-2 p-3 border-t border-white/5">
        <button className="flex-1 py-1.5 rounded-lg bg-[#f8423b] text-[11px] font-bold text-white">Merge fix</button>
        <button className="flex-1 py-1.5 rounded-lg border border-white/10 text-[11px] text-[#666]">View diff</button>
      </div>
    </div>
  );
}

function SecurityMockup() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111113] p-5 space-y-3 text-[12px]">
      <div className="flex items-center gap-2 mb-1">
        <RiLockLine size={14} className="text-[#a78bfa]" />
        <span className="font-semibold text-[#e8e8e8]">Security scan complete</span>
      </div>
      {[
        { sev: 'CRITICAL', title: 'SQL injection', file: 'db/queries.ts:71', c: '#ef4444' },
        { sev: 'HIGH', title: 'Missing rate limit', file: 'api/auth.ts:23', c: '#f59e0b' },
        { sev: 'HIGH', title: 'CORS wildcard origin', file: 'server.ts:9', c: '#f59e0b' },
      ].map((v, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-2.5 border border-white/5 bg-white/2">
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: `${v.c}15`, color: v.c }}>{v.sev}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[#bbb] truncate">{v.title}</p>
            <p className="text-[#444] font-mono text-[10px]">{v.file}</p>
          </div>
          <span className="text-[10px] text-[#a78bfa] font-semibold shrink-0">Auto-fix →</span>
        </div>
      ))}
    </div>
  );
}

function PerfMockup() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111113] p-5 text-[12px]">
      <div className="flex items-center gap-2 mb-4">
        <RiSpeedLine size={14} className="text-[#34d399]" />
        <span className="font-semibold text-[#e8e8e8]">Performance fix preview</span>
      </div>
      <div className="space-y-2 font-mono text-[11px]">
        <div className="flex gap-2 px-2 py-1 rounded bg-[#ef4444]/07">
          <span className="text-[#ef4444]">−</span>
          <span className="text-[#ef4444]/70">users.forEach(u =&gt; db.find(u.id));</span>
        </div>
        <div className="flex gap-2 px-2 py-1 rounded bg-[#34d399]/07">
          <span className="text-[#34d399]">+</span>
          <span className="text-[#34d399]/80">db.findMany(&#123; id: &#123; in: ids &#125; &#125;);</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-[10px]">
        <span className="text-[#444]">Estimated improvement</span>
        <span className="text-[#34d399] font-bold">−94% query time</span>
      </div>
    </div>
  );
}

function TeamMockup() {
  const metrics = [{ l: 'Avg review time', v: '4 min', delta: '-67%', c: '#34d399' }, { l: 'PRs merged / day', v: '23', delta: '+2×', c: '#34d399' }, { l: 'Bugs to prod', v: '0.3', delta: '-82%', c: '#34d399' }];
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111113] p-5 space-y-3">
      {metrics.map((m, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3 bg-white/[0.03]">
          <span className="text-[12px] text-[#666]">{m.l}</span>
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-bold text-[#e8e8e8]">{m.v}</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#34d399]/10 text-[#34d399]">{m.delta}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function VelocityMockup() {
  const weeks = [28, 35, 42, 38, 55, 61, 58, 72];
  const max = Math.max(...weeks);
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111113] p-5">
      <div className="flex items-end justify-between gap-1.5 h-20">
        {weeks.map((v, i) => (
          <motion.div key={i} className="flex-1 rounded-sm" style={{ background: `#60a5fa${i === weeks.length - 1 ? '' : '60'}` }}
            initial={{ height: 0 }} animate={{ height: `${(v / max) * 100}%` }} transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' as const }} />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-[#333] mt-2">
        <span>8 wks ago</span><span>This week</span>
      </div>
      <p className="text-[11px] text-[#555] mt-3">PR velocity up <span className="text-[#60a5fa] font-bold">+157%</span> since KangBot</p>
    </div>
  );
}

function BugMockup() {
  const rules = ['Never use `==` for null checks', 'Always validate env vars at startup', 'Batch DB calls inside loops'];
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111113] p-5 text-[12px]">
      <p className="text-[10px] uppercase tracking-widest text-[#444] mb-3">Custom ruleset (from your history)</p>
      <div className="space-y-2">
        {rules.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 bg-white/[0.03]">
            <RiCheckboxCircleLine size={13} className="text-[#34d399] shrink-0 mt-0.5" />
            <span className="text-[#888]">{r}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ZeroConfigMockup() {
  const steps = [
    { t: 'Install GitHub App', done: true },
    { t: 'Authorize repository access', done: true },
    { t: 'KangBot reviewing PRs', done: true, active: true },
  ];
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111113] p-5 text-[12px] space-y-3">
      {steps.map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 ${s.active ? 'bg-[#f97316]/8 border border-[#f97316]/20' : 'bg-white/[0.03]'}`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${s.done ? 'bg-[#22c55e]/15' : 'bg-white/5'}`}>
            {s.done ? <RiCheckboxCircleLine size={12} className="text-[#22c55e]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#444]" />}
          </div>
          <span className={s.active ? 'text-[#f97316] font-semibold' : 'text-[#666]'}>{s.t}</span>
          {s.active && <span className="ml-auto flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-[#f97316] opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f97316]" /></span>}
        </motion.div>
      ))}
      <p className="text-center text-[10px] text-[#333] pt-1">Setup time: <span className="text-[#22c55e] font-bold">87 seconds</span></p>
    </div>
  );
}

function LangMockup() {
  const langs = [['TypeScript', '#3178c6'], ['Python', '#3572A5'], ['Go', '#00ADD8'], ['Rust', '#dea584'], ['Ruby', '#701516'], ['Java', '#f89820']];
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111113] p-5">
      <p className="text-[10px] uppercase tracking-widest text-[#444] mb-4">Supported languages</p>
      <div className="grid grid-cols-3 gap-2">
        {langs.map(([name, color]) => (
          <div key={name} className="flex items-center gap-2 rounded-lg px-3 py-2 bg-white/[0.03] text-[11px]">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-[#888]">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScaleMockup() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#111113] p-5 text-[12px] space-y-3">
      {[
        { tier: 'Startup', repos: '1–10 repos', latency: '~8 s', c: '#34d399' },
        { tier: 'Growth', repos: '10–100 repos', latency: '~15 s', c: '#f97316' },
        { tier: 'Enterprise', repos: '100–1 000+ repos', latency: '<30 s', c: '#60a5fa' },
      ].map((r, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl px-4 py-2.5 bg-white/[0.03]">
          <div>
            <p className="text-[#bbb] font-semibold">{r.tier}</p>
            <p className="text-[10px] text-[#444]">{r.repos}</p>
          </div>
          <span className="text-[13px] font-bold" style={{ color: r.c }}>{r.latency}</span>
        </div>
      ))}
    </div>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: 'KangBot caught a race condition in our payment service that three senior engineers had missed. The auto-fix PR was open before we even read the comment.',
    name: 'Priya Mehta',
    role: 'Staff Engineer, Fintech startup',
    stars: 5,
  },
  {
    quote: 'We went from 45-minute average review cycles to under 5. KangBot handles the mechanical checks so humans can focus on architecture and business logic.',
    name: 'Marco Ricci',
    role: 'VP Engineering, SaaS platform',
    stars: 5,
  },
  {
    quote: 'The risk scoring alone is worth it. Our on-call team uses it to triage which PRs need human eyes and which can just be merged. Night-and-day difference.',
    name: 'Sasha Kowalski',
    role: 'Platform Lead, E-commerce scale-up',
    stars: 5,
  },
];

// ── Gallery cards ─────────────────────────────────────────────────────────────

const GALLERY = [
  { tag: 'Security', title: 'Hardened an auth module in 3 minutes', desc: 'KangBot detected 4 security findings and opened fix PRs automatically — all merged before standup.', accent: '#a78bfa' },
  { tag: 'Performance', title: 'Eliminated 94% of DB query time', desc: 'Auto-detected N+1 pattern across 12 endpoints, batched them, PR merged in one click.', accent: '#34d399' },
  { tag: 'Review speed', title: 'PR review time: 45 min → 4 min', desc: 'End-to-end review cycle dropped after KangBot handled all inline QA and flagged the 2 PRs that truly needed human review.', accent: '#f97316' },
  { tag: 'Onboarding', title: 'New devs ship safely on day 1', desc: 'KangBot enforces team conventions automatically so new contributors never break production patterns.', accent: '#60a5fa' },
];

// ── Scroll section component ──────────────────────────────────────────────────

function ScrollSection({ section, index }: { section: typeof SECTIONS[0]; index: number }) {
  const { active, progress, jumpTo } = useAutoTab(section.tabs.length);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const wordY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative px-6 md:px-10 lg:px-16 py-28 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none blur-[140px] opacity-[0.04]"
        style={{ background: section.accent }} />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: floating decorative word + label */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: 'easeOut' as const }}
            className="relative flex flex-col justify-center"
          >
            {/* Big floating word */}
            <motion.span
              style={{ color: section.accent, y: wordY }}
              className="absolute -top-8 left-0 select-none pointer-events-none font-black text-[clamp(80px,15vw,160px)] leading-none tracking-tighter opacity-[0.04]"
            >
              {section.word}
            </motion.span>

            <div className="relative z-10 pt-24 lg:pt-0">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 rounded-full" style={{ background: section.accent }} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: section.accent }}>
                  {section.label}
                </span>
              </div>

              {/* Tabs */}
              <div className="space-y-2">
                {section.tabs.map((tab, i) => {
                  const Icon = tab.icon;
                  const isActive = active === i;
                  return (
                    <button
                      key={i}
                      onClick={() => jumpTo(i)}
                      className="w-full text-left rounded-2xl px-5 py-4 transition-all duration-300 border"
                      style={{
                        background: isActive ? `${section.accent}0d` : 'transparent',
                        borderColor: isActive ? `${section.accent}30` : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <Icon size={15} style={{ color: isActive ? section.accent : '#555' }} />
                        <span className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-[#555]'}`}>{tab.title}</span>
                      </div>
                      <AnimatePresence>
                        {isActive && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                            <p className="text-[13px] text-[#777] leading-relaxed mt-2">{tab.body}</p>
                            {/* Progress bar */}
                            <div className="mt-3 h-0.5 rounded-full bg-white/5">
                              <motion.div className="h-full rounded-full" style={{ background: section.accent, width: `${progress * 100}%` }} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right: animated mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: 'easeOut' as const, delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {section.tabs[active].mockup}
              </motion.div>
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgentPage() {
  const typed = useTypewriter(ACTIONS);

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white selection:bg-[#f97316]/30 font-[family-name:var(--font-geist-sans)]">
      <HomeHeader />

      {/* ── Hero ── */}
      <section className="relative px-6 md:px-10 lg:px-16 pt-20 pb-28 overflow-hidden">
        {/* Background grain */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '200px' }} />

        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#f97316] opacity-[0.05] blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-4xl">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/20 bg-[#f97316]/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#f97316] mb-8">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-[#f97316] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                </span>
                KangBot Agent
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-[family-name:var(--font-space-grotesk)] text-5xl sm:text-6xl md:text-7xl font-black leading-[1.0] tracking-tighter text-white mb-6"
            >
              10x faster builds.<br />
              <span className="text-[#f97316]">More time</span> for<br />
              creative work.
            </motion.h1>

            {/* Typewriter */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="text-[15px] text-[#555]">Make KangBot</span>
              <div className="flex items-center gap-1 rounded-xl border border-[#f97316]/20 bg-[#f97316]/8 px-4 py-2 min-w-[280px]">
                <span className="text-[14px] font-mono text-[#f97316]">{typed}</span>
                <span className="ml-0.5 inline-block w-0.5 h-4 bg-[#f97316] animate-pulse" />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-[17px] text-white/50 leading-relaxed max-w-2xl mb-10"
            >
              KangBot reviews every pull request with full codebase context, opens auto-fix PRs for detected issues, and keeps your team shipping confidently at any scale.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.52 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link href="/in/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-8 py-4 text-[14px] font-bold text-white hover:bg-[#ea6c0a] transition-all shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:shadow-[0_0_50px_rgba(249,115,22,0.35)]">
                Start for free
                <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/in/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-4 text-[14px] font-bold text-white hover:bg-white/5 transition-all">
                View pricing
                <RiArrowRightSLine size={16} />
              </Link>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              className="mt-5 text-[12px] text-[#333]">
              No credit card required · 14-day free trial · All features included
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── 4 Scroll Sections ── */}
      {SECTIONS.map((section, i) => (
        <ScrollSection key={i} section={section} index={i} />
      ))}

      {/* ── Testimonials ── */}
      <section className="px-6 md:px-10 lg:px-16 py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Teams that ship faster
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } } }}
                className="group relative rounded-2xl border border-white/5 bg-[#111113] p-7 hover:border-[#f97316]/20 transition-colors"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at top left, rgba(249,115,22,0.05), transparent 60%)' }} />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <RiStarFill key={j} size={12} className="text-[#f97316]" />
                  ))}
                </div>
                <p className="text-[14px] text-[#888] leading-relaxed mb-5">"{t.quote}"</p>
                <div>
                  <p className="text-[13px] font-semibold text-[#e8e8e8]">{t.name}</p>
                  <p className="text-[11px] text-[#444]">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="px-6 md:px-10 lg:px-16 py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">Results</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Real outcomes, real teams
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          >
            {GALLERY.map((g, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 24, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } } }}
                className="group rounded-2xl border border-white/5 bg-[#111113] p-6 hover:border-white/10 transition-colors"
              >
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4"
                  style={{ background: `${g.accent}15`, color: g.accent }}>
                  {g.tag}
                </span>
                <h3 className="text-[16px] font-bold text-[#e8e8e8] mb-2">{g.title}</h3>
                <p className="text-[13px] text-[#555] leading-relaxed">{g.desc}</p>
                <div className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: g.accent }}>
                  Learn more <RiArrowRightLine size={13} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-10 lg:px-16 py-28 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-6xl font-black tracking-tighter text-white mb-5">
            Ready to ship<br /><span className="text-[#f97316]">without fear?</span>
          </h2>
          <p className="text-[16px] text-white/40 leading-relaxed mb-10 max-w-xl mx-auto">
            Join engineering teams who trust KangBot to review, fix, and protect every pull request — automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/in/login"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#f97316] px-10 py-4 text-[14px] font-bold text-white hover:bg-[#ea6c0a] transition-all shadow-[0_0_40px_rgba(249,115,22,0.3)] hover:shadow-[0_0_60px_rgba(249,115,22,0.4)]">
              Start free — 14 days
              <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/in/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-10 py-4 text-[14px] font-bold text-white hover:bg-white/5 transition-all">
              Talk to sales
            </Link>
          </div>
          <p className="mt-5 text-[12px] text-[#333]">No credit card · Cancel anytime · Full features from day 1</p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
