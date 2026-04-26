'use client';

import { motion } from 'framer-motion';
import { RiGitRepositoryLine, RiGitPullRequestLine, RiFlashlightLine } from 'react-icons/ri';

const STEPS = [
  {
    number: '01',
    icon: RiGitRepositoryLine,
    title: 'Connect your repo',
    description: 'Install the GitHub App in 30 seconds. No config files, no YAML — just authorize and go.',
    color: '#f97316',
  },
  {
    number: '02',
    icon: RiGitPullRequestLine,
    title: 'Open a pull request',
    description: 'Every PR triggers an automatic review. CodeKang reads the diff, the context, and the history.',
    color: '#a78bfa',
  },
  {
    number: '03',
    icon: RiFlashlightLine,
    title: 'Ship with confidence',
    description: 'Get inline comments, risk scores, and one-click autonomous fixes — all within seconds.',
    color: '#34d399',
  },
];

const connector = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 1.2, ease: 'easeInOut' as const } },
};

export default function HowItWorks() {
  return (
    <section className="px-6 md:px-10 lg:px-16 py-28">
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
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Zero setup. Instant reviews.
          </h2>
          <p className="text-[#888888] text-lg max-w-xl mx-auto">
            From install to first AI review in under two minutes.
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
                stroke="url(#connectorGrad)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                variants={connector}
              />
              <defs>
                <linearGradient id="connectorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </motion.svg>
          </div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6"
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
                {/* Icon circle */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 z-10"
                  style={{
                    background: `${step.color}12`,
                    border: `1px solid ${step.color}30`,
                    boxShadow: `0 0 0 0 ${step.color}00`,
                  }}
                  whileInView={{
                    boxShadow: [`0 0 0 0 ${step.color}00`, `0 0 32px 0 ${step.color}25`],
                    transition: { delay: 0.4 + i * 0.2, duration: 0.8 },
                  }}
                >
                  <step.icon size={28} style={{ color: step.color }} />
                  <span
                    className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                    style={{ background: step.color, color: '#1c1c1c' }}
                  >
                    {i + 1}
                  </span>
                </motion.div>

                <h3 className="text-[18px] font-bold text-white mb-3">{step.title}</h3>
                <p className="text-[14px] text-[#888888] leading-relaxed max-w-[260px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
