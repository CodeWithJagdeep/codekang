'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const STATS = [
  { prefix: '<', value: 30, suffix: 's', label: 'Average review time', description: 'Faster than any human reviewer' },
  { prefix: '',  value: 94, suffix: '%', label: 'Issues caught pre-merge', description: 'Before they reach production' },
  { prefix: '',  value: 3,  suffix: 'x', label: 'Faster PR cycle time', description: 'Ship more with less friction' },
  { prefix: '',  value: 50, suffix: 'K+', label: 'PRs reviewed', description: 'And growing every day' },
];

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
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
      className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
    >
      <div className="text-[52px] md:text-[64px] font-black tracking-tight leading-none text-white mb-3 group-hover:text-[#f97316] transition-colors duration-300">
        <span className="text-[#f97316]">{stat.prefix}</span>
        {active ? count : 0}
        <span className="text-[#f97316]">{stat.suffix}</span>
      </div>
      <p className="text-[15px] font-semibold text-white mb-1">{stat.label}</p>
      <p className="text-[13px] text-[#555]">{stat.description}</p>
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
    <section className="px-6 md:px-10 lg:px-16 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl border border-white/5 bg-[#111113] overflow-hidden p-12 md:p-16">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#f97316] opacity-[0.04] rounded-full blur-[80px]" />
          </div>

          <div className="relative text-center mb-14">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">
              By the numbers
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Built for teams that care about quality
            </h2>
          </div>

          <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <StatCard key={i} stat={stat} active={active} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
