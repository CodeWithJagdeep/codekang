'use client';

import { motion } from 'framer-motion';
import { RiDoubleQuotesL, RiStarFill } from 'react-icons/ri';

const TESTIMONIALS = [
  {
    quote: "KangBot caught a SQL injection in a PR that two senior engineers had already approved. We would have shipped it to prod. It paid for itself before the end of day one.",
    name: 'Arjun Mehta',
    role: 'CTO',
    company: 'Stackflow',
    avatar: 'AM',
    color: '#f97316',
    stars: 5,
  },
  {
    quote: "Our PR cycle went from 4 hours to under 30 minutes. The autonomous fix agent is the real unlock — it doesn't tell you what's wrong, it just fixes it and opens a PR. I've never seen anything like it.",
    name: 'Sarah Chen',
    role: 'Staff Engineer',
    company: 'Helix Labs',
    avatar: 'SC',
    color: '#a78bfa',
    stars: 5,
  },
  {
    quote: "I used to spend 2 hours a day reviewing PRs. Now I spend 20 minutes approving KangBot's fixes. I got my mornings back. The team ships faster and I'm not the bottleneck anymore.",
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
    <section className="px-6 md:px-10 lg:px-16 py-28 bg-[#fcfcfc] border-t-2 border-black/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">
            From engineers who made the switch
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black uppercase">
            Real teams. Real hours saved.
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
              }}
              whileHover={{ y: -8, x: -4, boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)' }}
              className="relative flex flex-col p-8 rounded-none border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group"
            >
              <RiDoubleQuotesL size={32} style={{ color: t.color }} className="mb-6 opacity-40" />

              <div className="flex mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <RiStarFill key={j} size={14} className="text-[#f59e0b]" />
                ))}
              </div>

              <p className="text-[16px] text-gray-500 font-medium leading-relaxed flex-1 mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4 pt-6 border-t-2 border-black/5">
                <div
                  className="w-10 h-10 border-2 border-black flex items-center justify-center text-[12px] font-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  style={{ background: `${t.color}20`, color: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[14px] font-black text-black uppercase tracking-tight">{t.name}</p>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
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
