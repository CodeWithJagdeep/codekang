'use client';

import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import LandingShowcase from '@/component/LandingShowcase';
import LogoMarquee from '@/component/landing/LogoMarquee';
import HowItWorks from '@/component/landing/HowItWorks';
import AIReviewDemo from '@/component/landing/AIReviewDemo';
import StatsCounter from '@/component/landing/StatsCounter';
import FeatureDeepDive from '@/component/landing/FeatureDeepDive';
import PricingTeaser from '@/component/landing/PricingTeaser';
import Testimonials from '@/component/landing/Testimonials';
import BottomCTA from '@/component/landing/BottomCTA';
import Link from 'next/link';
import { RiArrowRightLine, RiMagicFill, RiTerminalBoxLine, RiShieldFlashLine, RiCpuLine } from 'react-icons/ri';
import { motion } from 'framer-motion';

// ── Feature Bento ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: 'AI',
    label: 'Code Review.',
    description: 'Context-aware reviews on every PR — logic, style, security, and architecture in seconds.',
    color: 'bg-[#f97316]',
    textColor: 'text-white',
    span: 'col-span-12 md:col-span-8',
    icon: <RiMagicFill size={40} />,
  },
  {
    title: 'Security',
    label: 'Scanning.',
    description: 'Automated vulnerability detection built into your merge workflow.',
    color: 'bg-white/5',
    textColor: 'text-[#888888]',
    span: 'col-span-12 md:col-span-4',
    icon: <RiShieldFlashLine size={30} />,
  },
  {
    title: 'Autonomous',
    label: 'Fix.',
    description: 'KangBot finds a bug, opens a fix PR, and it\'s ready to merge — automatically.',
    color: 'bg-[#151517] border border-white/5',
    textColor: 'text-[#f4f4f5]',
    span: 'col-span-12 md:col-span-4',
    icon: <RiTerminalBoxLine size={30} />,
  },
  {
    title: 'Architecture',
    label: 'Insights.',
    description: 'Deep analysis of how every change ripples through your system architecture.',
    color: 'bg-white/[0.03]',
    textColor: 'text-[#888888]',
    span: 'col-span-12 md:col-span-8',
    icon: <RiCpuLine size={40} />,
  },
];

// ── Hero word-stagger animation ───────────────────────────────────────────────

const HERO_LINE_1 = ['Ship', 'perfect', 'PRs'];
const HERO_LINE_2 = ['with', 'AI', 'intelligence'];

const wordVariant = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' as const },
  }),
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RootPage() {
  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white selection:bg-[#f97316]/30 font-[family-name:var(--font-geist-sans)]">
      <HomeHeader />

      <main>

        {/* ── 1. Hero ── */}
        <section className="relative px-6 pb-24 pt-24 sm:px-8 sm:pt-32 overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 -z-10 pointer-events-none opacity-40">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>

          <div className="relative mx-auto flex max-w-7xl flex-col items-center text-center">


            {/* Word-stagger headline */}
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.05] tracking-tight text-white">
              <span className="flex flex-wrap justify-center gap-x-[0.25em] mb-1">
                {HERO_LINE_1.map((word, i) => (
                  <motion.span
                    key={word}
                    custom={i}
                    initial="hidden"
                    animate="show"
                    variants={wordVariant}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              <span className="flex flex-wrap justify-center gap-x-[0.25em]">
                {HERO_LINE_2.map((word, i) => (
                  <motion.span
                    key={word}
                    custom={HERO_LINE_1.length + i}
                    initial="hidden"
                    animate="show"
                    variants={wordVariant}
                    className={`inline-block ${word === 'AI' ? 'text-[#f8433d]' : ''}`}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mx-auto max-w-2xl text-lg text-white/60 leading-relaxed mb-10"
            >
              The only AI code reviewer that doesn&apos;t just comment — it fixes.
              Catch bugs, security issues, and bad patterns before they merge.
              Automatically.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.68 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/in/login"
                className="group w-full sm:w-auto rounded-xl bg-[#f97316] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[#ea6c0a] shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:shadow-[0_0_50px_rgba(249,115,22,0.35)] flex items-center gap-2 justify-center"
              >
                Start free — 14 days
                <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/in/pricing"
                className="w-full sm:w-auto rounded-xl border border-white/10 bg-black/40 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-black/60"
              >
                View pricing
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-5 text-[12px] text-[#444]"
            >
              No credit card required · Full features for 14 days
            </motion.p>
          </div>
        </section>

        {/* ── 2. Logo Marquee ── */}
        <LogoMarquee />

        {/* ── 3. Feature Bento ── */}
        <section className="px-6 md:px-10 lg:px-16 pb-32">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">
                Features
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Everything your team needs
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.15 } },
              }}
              className="grid grid-cols-12 gap-4"
            >
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'circOut' } },
                  }}
                  whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2 } }}
                  className={`${feature.span} h-[380px] rounded-[40px] md:rounded-[60px] ${feature.color} p-10 flex flex-col justify-between group overflow-hidden relative cursor-pointer border border-white/0 hover:border-white/10 transition-colors`}
                >
                  {/* Animated gradient border on hover */}
                  <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08), transparent 60%)' }}
                  />

                  <div className="relative z-10">
                    <motion.h2
                      className={`text-4xl md:text-6xl font-bold ${feature.textColor} tracking-tighter leading-[0.9]`}
                    >
                      {feature.title} <br />
                      <motion.span
                        className="opacity-20 uppercase inline-block"
                        whileHover={{ x: 10, opacity: 0.5 }}
                      >
                        {feature.label}
                      </motion.span>
                    </motion.h2>
                  </div>

                  <div className="relative z-10 flex items-end justify-between">
                    <p className={`text-lg md:text-xl max-w-xs ${feature.textColor} opacity-80 font-medium`}>
                      {feature.description}
                    </p>
                    <motion.div
                      className="hidden md:block text-white opacity-20"
                      whileHover={{ scale: 1.3, rotate: 15, opacity: 0.5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {feature.icon}
                    </motion.div>
                  </div>

                  <motion.div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── 4. How It Works ── */}
        <HowItWorks />

        {/* ── 5. AI Review Demo ── */}
        <AIReviewDemo />

        {/* ── 6. Stats Counter ── */}
        <StatsCounter />

        {/* ── 7. Feature Deep-Dive ── */}
        <FeatureDeepDive />

        {/* ── 8. Dashboard Showcase ── */}
        <section className="px-6 md:px-10 lg:px-16 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto text-center mb-16"
          >
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">
              Product tour
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
              Your entire codebase,{' '}
              <span className="text-[#f97316]">under control</span>.
            </h2>
            <p className="text-[#888888] text-lg max-w-2xl mx-auto">
              One dashboard. Every repo, PR, and review — with real-time AI monitoring on every change.
            </p>
          </motion.div>
          <LandingShowcase />
        </section>

        {/* ── 9. Pricing Teaser ── */}
        <PricingTeaser />

        {/* ── 10. Testimonials ── */}
        <Testimonials />

        {/* ── 11. Bottom CTA ── */}
        <BottomCTA />

      </main>

      <Footer />
    </div>
  );
}
