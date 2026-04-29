'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const STATS = [
  {
    prefix: '<',
    value: 3,
    suffix: ' min',
    label: 'Fix PR in your inbox',
    description: 'From review start to ready-to-merge',
  },
  {
    prefix: '',
    value: 500,
    suffix: '+',
    label: 'Engineers in beta',
    description: 'Teams who switched from review hell',
  },
  {
    prefix: '',
    value: 0,
    suffix: '',
    label: 'Auto-merges ever',
    description: 'Every fix waits for your approval',
  },
  {
    prefix: '',
    value: 6,
    suffix: ' classes',
    label: 'Bug types caught',
    description: 'SQLi · secrets · null · N+1 · races · injection',
  },
];

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

function StatCard({ stat, active, index }: { stat: typeof STATS[0]; active: boolean; index: number }) {
  const count = useCountUp(stat.value, active, 1600);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: 'easeOut' }}
      whileHover={{ y: -5, x: -2, boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
      className="flex flex-col items-center text-center p-8 rounded-none border-2 border-black bg-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="text-[52px] md:text-[64px] font-black tracking-tighter leading-none text-black mb-3">
        <span className="text-[#f97316]">{stat.prefix}</span>
        {active ? count : 0}
        <span className="text-[#f97316]">{stat.suffix}</span>
      </div>
      <p className="text-[13px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
      <p className="text-[13px] text-gray-500 font-medium">{stat.description}</p>
    </motion.div>
  );
}

export default function StatsCounter() {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="px-6 md:px-10 lg:px-16 py-32 bg-[#fcfcfc] border-t-2 border-black/10">
      <div className="max-w-7xl mx-auto">
        <div className="relative text-center mb-20">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">
            By the numbers
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tight">
            Real numbers.<br />No rounding up.
          </h2>
        </div>
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} active={active} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
