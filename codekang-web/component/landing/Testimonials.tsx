'use client';

import { motion } from 'framer-motion';
import { RiDoubleQuotesL, RiStarFill } from 'react-icons/ri';

const TESTIMONIALS = [
  {
    quote: "CodeKang caught a SQL injection vulnerability in a PR that had already been approved by two senior engineers. It paid for itself on day one.",
    name: 'Arjun Mehta',
    role: 'CTO',
    company: 'Stackflow',
    avatar: 'AM',
    color: '#f97316',
    stars: 5,
  },
  {
    quote: "We went from 4-hour PR review cycles to under 30 minutes. The autonomous fix feature is genuinely magical — it just opens a PR and fixes the issue.",
    name: 'Sarah Chen',
    role: 'Staff Engineer',
    company: 'Helix Labs',
    avatar: 'SC',
    color: '#a78bfa',
    stars: 5,
  },
  {
    quote: "Switched from CodeRabbit and never looked back. Same quality reviews at a third of the price, plus the autonomous bug fix feature they don't even offer.",
    name: 'Lucas Oliveira',
    role: 'Engineering Manager',
    company: 'Vortex Systems',
    avatar: 'LO',
    color: '#34d399',
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="px-6 md:px-10 lg:px-16 py-28">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">
            What teams say
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Loved by engineering teams
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative flex flex-col p-7 rounded-2xl border border-white/6 bg-[#111113] overflow-hidden group"
            >
              {/* Subtle corner glow on hover */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${t.color}15, transparent 70%)` }}
              />

              <RiDoubleQuotesL size={28} style={{ color: t.color }} className="mb-4 opacity-60" />

              <div className="flex mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <RiStarFill key={j} size={12} className="text-[#f59e0b]" />
                ))}
              </div>

              <p className="text-[14px] text-[#999] leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black shrink-0"
                  style={{ background: `${t.color}20`, color: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{t.name}</p>
                  <p className="text-[11.5px] text-[#555]">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
