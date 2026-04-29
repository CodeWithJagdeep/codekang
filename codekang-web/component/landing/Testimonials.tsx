'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiDoubleQuotesL, RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';

const TESTIMONIALS = [
  {
    quote: "Caught a Prisma N+1 query inside a GraphQL resolver — our senior reviewer had already approved it. Kang opened a fix PR with a batched findMany. Correct on first try, merged in 10 minutes.",
    name: 'Rahul Sharma',
    role: 'Senior Engineer',
    company: 'Fintech startup · Bangalore',
    stack: 'Node.js · Prisma · PostgreSQL',
    avatar: 'RS',
    color: '#f97316',
  },
  {
    quote: "Had a hardcoded JWT fallback that had been in prod for 6 months. Kang flagged it on the next PR touch, explained the exact attack vector (token forgery via known key), and opened a fix that added the missing env guard. 8 minutes total.",
    name: 'Priya Nair',
    role: 'Tech Lead',
    company: 'SaaS company · Remote',
    stack: 'TypeScript · Express · AWS',
    avatar: 'PN',
    color: '#a78bfa',
  },
  {
    quote: "I was the bottleneck. 12-person team, every PR waited on me. Now Kang does first-pass — I spend 20 minutes approving fixes instead of 3 hours writing comments that nobody reads anyway. Junior engineers grow faster too; explanation is inline.",
    name: 'David Kim',
    role: 'Engineering Manager',
    company: '12-person startup',
    stack: 'Python · Django · React',
    avatar: 'DK',
    color: '#34d399',
  },
  {
    quote: "We have a strict no-secrets-in-git policy. Three engineers had violated it before Kang. Zero violations since. It caught an AWS key in a config file before the PR even got a reviewer assigned.",
    name: 'Aisha Okonkwo',
    role: 'Platform Engineer',
    company: 'Series B startup · Lagos',
    stack: 'Go · Terraform · AWS',
    avatar: 'AO',
    color: '#60a5fa',
  },
  {
    quote: "The fix for a race condition in our job queue was genuinely correct — not just a workaround. It added a mutex in exactly the right place. I honestly wasn't sure it would get it right. It did.",
    name: 'Sven Larsson',
    role: 'Staff Engineer',
    company: 'Dev tools company · Stockholm',
    stack: 'Rust · PostgreSQL · Redis',
    avatar: 'SL',
    color: '#f43f5e',
  },
  {
    quote: "Junior devs on my team are shipping safer code. The inline explanations from Kang teach them why something is dangerous, not just that it is. Code quality has measurably improved in 6 weeks.",
    name: 'Meera Iyer',
    role: 'Engineering Lead',
    company: 'EdTech startup · Chennai',
    stack: 'Next.js · Supabase · TypeScript',
    avatar: 'MI',
    color: '#a78bfa',
  },
  {
    quote: "Caught a missing null check on a user object that would have caused a 500 on a high-traffic endpoint. We push 30+ PRs a day. There's no way we would have caught that manually before it hit prod.",
    name: 'Carlos Mendes',
    role: 'CTO',
    company: 'E-commerce platform · São Paulo',
    stack: 'Node.js · MongoDB · React',
    avatar: 'CM',
    color: '#34d399',
  },
  {
    quote: "Setup took 4 minutes including reading the docs. First review fired automatically on the next PR. No YAML, no config, no CI changes. I keep waiting for the catch. There isn't one.",
    name: 'Tom Eriksen',
    role: 'Solo founder',
    company: 'Indie SaaS · Copenhagen',
    stack: 'Rails · PostgreSQL · Heroku',
    avatar: 'TE',
    color: '#f97316',
  },
];

const CARDS_PER_VIEW = 3;
const AUTO_INTERVAL = 4000;

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = TESTIMONIALS.length;

  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + total) % total);
  }, [total]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) go(1);
    }, AUTO_INTERVAL);
  }, [go]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const getSlice = () => {
    const cards = [];
    for (let i = 0; i < CARDS_PER_VIEW; i++) {
      cards.push(TESTIMONIALS[(index + i) % total]);
    }
    return cards;
  };

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.3 } }),
  };

  return (
    <section
      className="px-6 md:px-10 lg:px-16 py-28 bg-[#fcfcfc] border-t-2 border-black/10 overflow-hidden"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16"
        >
          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">
              From engineers in beta
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black uppercase leading-none">
              Specific bugs.<br />Real teams.
            </h2>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mr-2">
              {index + 1} / {total}
            </span>
            <button
              onClick={() => { go(-1); startTimer(); }}
              aria-label="Previous"
              className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
            >
              <RiArrowLeftLine size={18} />
            </button>
            <button
              onClick={() => { go(1); startTimer(); }}
              aria-label="Next"
              className="w-12 h-12 border-2 border-black bg-black text-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
            >
              <RiArrowRightLine size={18} />
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {getSlice().map((t, i) => (
                <div
                  key={`${t.name}-${i}`}
                  className="flex flex-col p-8 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-full"
                >
                  <RiDoubleQuotesL size={26} style={{ color: t.color }} className="mb-5 opacity-50 shrink-0" />

                  <p className="text-[15px] text-gray-600 font-medium leading-relaxed flex-1 mb-8">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="pt-5 border-t-2 border-black/5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 border-2 border-black flex items-center justify-center text-[11px] font-black shrink-0"
                        style={{ background: `${t.color}20`, color: t.color }}
                      >
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-black uppercase tracking-tight">{t.name}</p>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                          {t.role} · {t.company}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest pl-12">{t.stack}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); startTimer(); }}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`transition-all duration-300 border border-black ${
                i === index
                  ? 'w-8 h-2 bg-black'
                  : 'w-2 h-2 bg-transparent hover:bg-black/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
