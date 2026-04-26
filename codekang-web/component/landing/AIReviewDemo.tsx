'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiFlashlightLine, RiShieldLine, RiRefreshLine, RiCheckboxCircleLine, RiErrorWarningLine } from 'react-icons/ri';

const CODE_LINES = [
  { n: 1,  text: 'async function fetchUser(userId: string) {', type: 'normal' },
  { n: 2,  text: '  const query = `SELECT * FROM users', type: 'normal' },
  { n: 3,  text: '    WHERE id = ${userId}`', type: 'danger' },
  { n: 4,  text: '  const result = await db.execute(query)', type: 'danger' },
  { n: 5,  text: '  return result.rows[0]', type: 'normal' },
  { n: 6,  text: '}', type: 'normal' },
];

const AI_COMMENTS = [
  {
    line: 3,
    severity: 'error' as const,
    title: 'SQL Injection',
    body: 'String interpolation in SQL is dangerous. Use parameterized queries: db.execute(\'SELECT * FROM users WHERE id = $1\', [userId])',
    icon: RiErrorWarningLine,
    color: '#ef4444',
  },
  {
    line: 4,
    severity: 'warning' as const,
    title: 'Missing error handling',
    body: 'Wrap in try/catch — unhandled DB errors will bubble up as 500s.',
    icon: RiShieldLine,
    color: '#f59e0b',
  },
];

type Phase = 'idle' | 'scanning' | 'done';

export default function AIReviewDemo() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [visibleComments, setVisibleComments] = useState(0);
  const [typedText, setTypedText] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  const SUMMARY = 'Found 2 issues: 1 critical, 1 warning. Risk: High.';

  function runAnimation() {
    setPhase('scanning');
    setVisibleComments(0);
    setTypedText('');

    let i = 0;
    setTimeout(() => {
      setPhase('done');
      // Type the summary text
      const interval = setInterval(() => {
        i++;
        setTypedText(SUMMARY.slice(0, i));
        if (i >= SUMMARY.length) clearInterval(interval);
      }, 28);
      // Reveal comments one by one
      setTimeout(() => setVisibleComments(1), 600);
      setTimeout(() => setVisibleComments(2), 1100);
    }, 1800);
  }

  // Auto-trigger on scroll into view (once)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          setTimeout(runAnimation, 300);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function replay() {
    triggered.current = false;
    setPhase('idle');
    setTypedText('');
    setVisibleComments(0);
    setTimeout(runAnimation, 200);
  }

  return (
    <section className="px-6 md:px-10 lg:px-16 py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">
            Live demo
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Watch KangBot review your PR
          </h2>
          <p className="text-[#888888] text-lg max-w-xl mx-auto">
            Real issues, caught in real time — before they reach production.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl border border-white/8 bg-[#111113] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#0e0e10]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]/60" />
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]/60" />
              <div className="w-3 h-3 rounded-full bg-[#22c55e]/60" />
              <span className="ml-3 text-[12px] text-[#555] font-mono">auth/user.service.ts</span>
            </div>
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {phase === 'scanning' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-[12px] text-[#f97316]"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    >
                      <RiFlashlightLine size={13} />
                    </motion.div>
                    Analyzing…
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={replay}
                className="flex items-center gap-1.5 text-[11px] text-[#555] hover:text-[#888] transition-colors"
              >
                <RiRefreshLine size={13} />
                Replay
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 min-h-[420px]">
            {/* Code panel */}
            <div className="border-r border-white/5 p-6 font-mono text-[13px] overflow-x-auto">
              <div className="space-y-0.5">
                {CODE_LINES.map((line) => {
                  const hasDanger = line.type === 'danger' && phase !== 'idle';
                  return (
                    <motion.div
                      key={line.n}
                      animate={hasDanger ? { backgroundColor: 'rgba(239,68,68,0.08)' } : { backgroundColor: 'transparent' }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex rounded px-2 py-0.5 leading-6"
                    >
                      <span className="w-7 shrink-0 text-[#333] select-none">{line.n}</span>
                      <span className={hasDanger ? 'text-[#ef4444]/90' : 'text-[#888]'}>
                        {line.text}
                      </span>
                      {hasDanger && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6, type: 'spring' }}
                          className="ml-2 self-center w-2 h-2 rounded-full bg-[#ef4444] shrink-0"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Review panel */}
            <div className="flex flex-col p-6 gap-4">
              {/* Header */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                <div className="w-6 h-6 rounded-lg bg-[#f8423b]/15 flex items-center justify-center">
                  <RiFlashlightLine size={13} className="text-[#f8423b]" />
                </div>
                <span className="text-[13px] font-semibold text-white">KangBot Review</span>
                <AnimatePresence>
                  {phase === 'done' && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] font-semibold"
                    >
                      2 issues
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Summary */}
              <AnimatePresence>
                {phase === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[12.5px] text-[#888] leading-relaxed font-mono"
                  >
                    {typedText}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="inline-block w-[2px] h-[14px] bg-[#f97316] ml-0.5 align-text-bottom"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Comments */}
              <div className="space-y-3 flex-1">
                {AI_COMMENTS.slice(0, visibleComments).map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className="rounded-lg p-3.5 border-l-2"
                    style={{ background: `${c.color}08`, borderColor: c.color }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <c.icon size={13} style={{ color: c.color }} />
                      <span className="text-[12px] font-bold" style={{ color: c.color }}>
                        {c.title}
                      </span>
                      <span className="ml-auto font-mono text-[10px] text-[#555]">
                        line {c.line}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#777] leading-relaxed">{c.body}</p>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <AnimatePresence>
                {phase === 'done' && visibleComments >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-2 pt-2 border-t border-white/5"
                  >
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#f8423b] text-[12px] font-bold text-white hover:opacity-90 transition-opacity">
                      <RiFlashlightLine size={12} />
                      Auto-fix
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 text-[12px] font-semibold text-[#888] hover:bg-white/5 transition-colors">
                      <RiCheckboxCircleLine size={12} />
                      Approve
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Idle state */}
              {phase === 'idle' && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[13px] text-[#444]">Scroll down to trigger review…</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
