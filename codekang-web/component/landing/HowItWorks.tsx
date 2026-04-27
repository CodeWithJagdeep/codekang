'use client';

import { motion } from 'framer-motion';
import { RiGitRepositoryLine, RiGitPullRequestLine, RiFlashlightLine } from 'react-icons/ri';

const STEPS = [
  {
    number: '01',
    icon: RiGitRepositoryLine,
    title: 'Install once.',
    subtitle: 'Never configure again.',
    description: 'Authorize the GitHub App. KangBot silently attaches to every repo — existing and future ones. No YAML, no CI changes, no config file to maintain.',
    color: '#f97316',
    outcome: '30 seconds to connect',
  },
  {
    number: '02',
    icon: RiGitPullRequestLine,
    title: 'Your dev opens a PR.',
    subtitle: 'KangBot is already on it.',
    description: "The moment a PR is opened, KangBot reads the diff, the file history, and the broader codebase context. It's not just looking at what changed — it understands why it changed.",
    color: '#a78bfa',
    outcome: 'Review starts in <3s',
  },
  {
    number: '03',
    icon: RiFlashlightLine,
    title: 'Bugs caught. Fix ready.',
    subtitle: 'You just hit merge.',
    description: "KangBot leaves inline comments on exact lines, scores the risk, and opens a fix PR for every issue it can resolve. You don't triage bugs — you approve or skip.",
    color: '#34d399',
    outcome: 'Fix PR in your inbox',
  },
];

const connector = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 1.2, ease: 'easeInOut' as const } },
};

export default function HowItWorks() {
  return (
    <section className="px-6 md:px-10 lg:px-16 py-28 bg-white border-t-2 border-black/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">
            How it works
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-4 uppercase">
            From first push to first fix<br />in under two minutes.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto font-medium">
            You keep doing exactly what you do. KangBot fits around your workflow — not the other way around.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(16.66%+32px)] right-[calc(16.66%+32px)] h-px overflow-visible pointer-events-none">
            <motion.svg
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="absolute inset-0 w-full overflow-visible"
              height="2"
              preserveAspectRatio="none"
            >
              <motion.line
                x1="0" y1="1" x2="100%" y2="1"
                stroke="black"
                strokeWidth="1.5"
                strokeOpacity="0.1"
                strokeDasharray="6 4"
                variants={connector}
              />
            </motion.svg>
          </div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ show: { transition: { staggerChildren: 0.2 } } }}
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
                }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Icon module */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative w-20 h-20 bg-white border-2 border-black flex items-center justify-center mb-8 z-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group-hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
                >
                  <step.icon size={32} style={{ color: step.color }} />
                  <span
                    className="absolute -top-3 -right-3 w-8 h-8 border-2 border-black text-[12px] font-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    style={{ background: step.color, color: 'white' }}
                  >
                    {i + 1}
                  </span>
                </motion.div>

                <h3 className="text-[22px] font-black text-black mb-1 uppercase tracking-tight">{step.title}</h3>
                <p className="text-[13px] font-bold mb-4 uppercase tracking-wider" style={{ color: step.color }}>{step.subtitle}</p>
                <p className="text-[15px] text-gray-500 leading-relaxed max-w-[300px] mb-6 font-medium">
                  {step.description}
                </p>
                <span
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 border-2 border-black text-[11px] font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]"
                  style={{ background: `${step.color}10`, color: step.color }}
                >
                  {step.outcome}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
