'use client';

import { motion } from 'framer-motion';
import { RiFlashlightLine, RiShieldFlashLine, RiGitPullRequestLine, RiCheckboxCircleLine, RiArrowRightLine } from 'react-icons/ri';
import Link from 'next/link';

const slideIn = (dir: 'left' | 'right') => ({
  hidden: { opacity: 0, x: dir === 'left' ? -60 : 60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' as const } },
});

// ── Feature 1: AI Code Review ─────────────────────────────────────────────────

function ReviewMockup() {
  return (
    <div className="rounded-none border-2 border-black bg-white overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 px-4 py-4 border-b-2 border-black bg-black/[0.02]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/80" />
        <span className="ml-2 text-[11px] text-gray-400 font-mono font-bold uppercase tracking-wider">KangBot · PR #412</span>
      </div>
      <div className="p-5 space-y-3">
        {[
          { severity: 'error', color: '#ef4444', file: 'src/auth/jwt.ts:34', msg: 'JWT secret falls back to hardcoded value — use env var only.' },
          { severity: 'warning', color: '#f59e0b', file: 'src/api/users.ts:89', msg: 'N+1 query detected. Batch with findMany({ where: { id: { in: ids } } }).' },
          { severity: 'info', color: '#60a5fa', file: 'src/utils/cache.ts:12', msg: 'Cache TTL is 0 — consider setting a minimum of 60s for this route.' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="rounded-lg p-3 border-l-2 text-[12px]"
            style={{ background: `${item.color}08`, borderColor: item.color }}
          >
            <span className="font-mono text-[10.5px]" style={{ color: item.color }}>{item.file}</span>
            <p className="mt-1 text-[#777]">{item.msg}</p>
          </motion.div>
        ))}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-500 font-bold uppercase tracking-tight">
          <RiCheckboxCircleLine size={12} className="text-[#22c55e]" />
          Risk score: <span className="text-[#f97316]">Medium</span> · 3 issues found
        </div>
      </div>
    </div>
  );
}

// ── Feature 2: Autonomous Fix ─────────────────────────────────────────────────

function AutofixMockup() {
  return (
    <div className="rounded-none border-2 border-black bg-white overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 px-4 py-4 border-b-2 border-black bg-black/[0.02]">
        <div className="flex items-center gap-1.5">
          <RiGitPullRequestLine size={13} className="text-[#22c55e]" />
          <span className="text-[12px] font-black text-black uppercase">fix: resolve JWT secret fallback</span>
        </div>
        <span className="ml-auto text-[10px] px-2 py-0.5 border border-black bg-[#22c55e] text-white font-black uppercase">
          Opened by KangBot
        </span>
      </div>
      <div className="p-5 font-mono text-[12px] space-y-1">
        {[
          { text: '  const secret = process.env.JWT_SECRET', type: 'remove' },
          { text: '    ?? "fallback-secret-key";', type: 'remove' },
          { text: '  const secret = process.env.JWT_SECRET;', type: 'add' },
          { text: '  if (!secret) throw new Error(', type: 'add' },
          { text: '    \'JWT_SECRET env var is required\');', type: 'add' },
        ].map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex items-start gap-2 px-2 py-0.5 rounded"
            style={{
              background: line.type === 'remove' ? 'rgba(239,68,68,0.08)' : line.type === 'add' ? 'rgba(34,197,94,0.08)' : 'transparent',
            }}
          >
            <span className={`shrink-0 font-bold ${line.type === 'remove' ? 'text-[#ef4444]' : line.type === 'add' ? 'text-[#22c55e]' : 'text-[#555]'}`}>
              {line.type === 'remove' ? '−' : line.type === 'add' ? '+' : ' '}
            </span>
            <span className={line.type === 'remove' ? 'text-[#ef4444]/70' : line.type === 'add' ? 'text-[#22c55e]/90' : 'text-[#666]'}>
              {line.text}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-2 p-4 border-t-2 border-black">
        <button className="flex-1 py-2.5 border-2 border-black bg-[#f8423b] text-[12px] font-black text-white hover:translate-x-[-1px] hover:translate-y-[-1px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all uppercase">
          Merge fix
        </button>
        <button className="flex-1 py-2.5 border-2 border-black bg-white text-[12px] font-black text-black hover:translate-x-[-1px] hover:translate-y-[-1px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all uppercase">
          View diff
        </button>
      </div>
    </div>
  );
}

// ── Rows ──────────────────────────────────────────────────────────────────────

const ROWS = [
  {
    tag: 'AI Code Review',
    icon: RiFlashlightLine,
    iconColor: '#f97316',
    title: 'Your PR is reviewed before you finish your coffee.',
    description: "Stop waiting 4 hours for a senior engineer to review a 20-line change. KangBot reads the diff and the codebase around it — not just what changed, but what it affects. You get inline comments on exact lines, a risk score, and security findings in under 30 seconds.",
    bullets: [
      'Comments on exact lines, not vague summaries',
      'Risk score so you know what to prioritize',
      'Catches issues that pass linting and SAST',
      'Architecture impact — knows what your change breaks upstream',
    ],
    href: '/in/pricing',
    Mockup: ReviewMockup,
    direction: 'ltr' as const,
  },
  {
    tag: 'Autonomous Fix Agent',
    icon: RiShieldFlashLine,
    iconColor: '#a78bfa',
    title: "KangBot finds the bug, writes the fix, opens the PR. You approve.",
    description: "Most AI tools leave you a comment. KangBot leaves you a ready-to-merge pull request. It identifies the root cause, writes the correct fix, and opens a PR with a clear explanation. You don't write a fix — you review one. That's the difference between a tool and an agent.",
    bullets: [
      'Fix PR opened in your repo within seconds',
      'Handles security patches, null checks, query fixes, and more',
      'Clear diff so you always know what changed and why',
      'Works across TypeScript, Python, Go, Rust, and more',
    ],
    href: '/in/pricing',
    Mockup: AutofixMockup,
    direction: 'rtl' as const,
  },
];

export default function FeatureDeepDive() {
  return (
    <section className="px-6 md:px-10 lg:px-16 py-28">
      <div className="max-w-7xl mx-auto space-y-32">
        {ROWS.map((row, i) => {
          const isRtl = row.direction === 'rtl';
          const text = (
            <motion.div
              variants={slideIn(isRtl ? 'right' : 'left')}
              className="flex flex-col justify-center"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${row.iconColor}15` }}>
                  <row.icon size={16} style={{ color: row.iconColor }} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: row.iconColor }}>
                  {row.tag}
                </span>
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-black leading-tight mb-6 uppercase tracking-tight">
                {row.title}
              </h3>
              <p className="text-[17px] text-gray-500 font-medium leading-relaxed mb-8">{row.description}</p>
              <ul className="space-y-4 mb-10">
                {row.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-[15px] text-gray-700 font-bold uppercase tracking-tight">
                    <div className="w-2 h-2 border border-black shrink-0" style={{ background: row.iconColor }} />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href={row.href}
                className="inline-flex items-center gap-3 border-2 border-black bg-white px-8 py-3 text-[14px] font-black text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                See pricing <RiArrowRightLine size={16} />
              </Link>
            </motion.div>
          );

          const mockup = (
            <motion.div variants={slideIn(isRtl ? 'left' : 'right')}>
              <row.Mockup />
            </motion.div>
          );

          return (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={{ show: { transition: { staggerChildren: 0.15 } } }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center"
            >
              {isRtl ? <>{mockup}{text}</> : <>{text}{mockup}</>}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
