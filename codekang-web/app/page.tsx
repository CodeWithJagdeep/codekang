'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  RiArrowRightLine,
  RiFileCopyLine,
  RiMagicFill,
  RiTerminalBoxLine,
  RiShieldFlashLine,
  RiCpuLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiFlashlightLine,
  RiGitPullRequestLine,
  RiShieldLine,
  RiTimeLine,
} from 'react-icons/ri';
import Link from 'next/link';
import HomeHeader from '@/component/HomeHeader';
import LogoMarquee from '@/component/landing/LogoMarquee';
import HowItWorks from '@/component/landing/HowItWorks';
import LandingShowcase from '@/component/LandingShowcase';
import AIReviewDemo from '@/component/landing/AIReviewDemo';
import StatsCounter from '@/component/landing/StatsCounter';
import FeatureDeepDive from '@/component/landing/FeatureDeepDive';
import PricingTeaser from '@/component/landing/PricingTeaser';
import Testimonials from '@/component/landing/Testimonials';
import BottomCTA from '@/component/landing/BottomCTA';
import Footer from '@/component/Footer';

const LIVE_EVENTS = [
  { repo: 'fintech-api', fix: 'SQL injection patched in payment handler', icon: RiShieldLine, color: '#ef4444', time: '2s ago' },
  { repo: 'checkout-flow', fix: 'Fix PR opened for missing null check', icon: RiGitPullRequestLine, color: '#22c55e', time: '31s ago' },
  { repo: 'data-ingestion', fix: 'Memory leak resolved in stream handler', icon: RiFlashlightLine, color: '#f97316', time: '1m ago' },
  { repo: 'api-gateway', fix: 'N+1 query fixed in user resolver', icon: RiTimeLine, color: '#60a5fa', time: '2m ago' },
];

// ── Feature Bento Data ───────────────────────────────────────────────────────

const FEATURES = [
  {
    title: 'You push.',
    label: 'We protect.',
    description:
      'Deep logic audits, pattern recognition, and security hardening on every commit. Flaws are caught before they ever leave the PR.',
    color: 'bg-[#f97316]',
    textColor: 'text-white',
    span: 'col-span-12 md:col-span-8',
    icon: <RiMagicFill size={40} />,
  },
  {
    title: 'Beyond comments.',
    label: 'Real solutions.',
    description: "Kang resolves issues, it doesn't just list them. Receive ready-to-merge fixes for complex logic errors in minutes.",
    color: 'bg-[#151517] border border-white/5',
    textColor: 'text-[#f4f4f5]',
    span: 'col-span-12 md:col-span-4',
    icon: <RiTerminalBoxLine size={32} />,
  },
  {
    title: 'Zero Production',
    label: 'incidents.',
    description: 'Neutralize hardcoded secrets and SQL injections at the source. Secure your pipeline against production vulnerabilities.',
    color: 'bg-[#f4f4f5]',
    textColor: 'text-black',
    span: 'col-span-12 md:col-span-4',
    icon: <RiShieldFlashLine size={32} />,
  },
  {
    title: 'Institutional',
    label: 'Knowledge.',
    description: 'Every fix includes a technical deep-dive. Junior engineers accelerate their growth, and seniors focus on architecture.',
    color: 'bg-white border-2 border-black/5',
    textColor: 'text-black',
    span: 'col-span-12 md:col-span-8',
    icon: <RiCpuLine size={40} />,
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

function LiveActivityTicker() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % LIVE_EVENTS.length), 3000);
    return () => clearInterval(id);
  }, []);

  const event = LIVE_EVENTS[current] || LIVE_EVENTS[0];
  if (!event) return null;
  const Icon = event.icon;

  return (
    <div className="flex items-center gap-3 border-2 border-black/10 bg-white px-5 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] max-w-[520px] w-full overflow-hidden">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22c55e]" />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 shrink-0">LIVE</span>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-2 min-w-0"
        >
          <Icon size={13} style={{ color: event.color }} className="shrink-0" />
          <span className="text-[13px] font-semibold text-black truncate">{event.fix}</span>
          <span className="text-[11px] text-gray-400 shrink-0 ml-auto pl-2">{event.time}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface Feature {
  title: string;
  label: string;
  description: string;
  color: string;
  textColor: string;
  span: string;
  icon: React.ReactNode;
}

function FeatureTextBlock({ feature, index, setActiveIndex }: { feature: Feature; index: number; setActiveIndex: (i: number) => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-45% 0px -45% 0px' });

  useEffect(() => {
    if (isInView) setActiveIndex(index);
  }, [isInView, index, setActiveIndex]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0.3 }}
      animate={{ opacity: isInView ? 1 : 0.3 }}
      className="transition-opacity duration-500"
    >
      <div className="flex items-center gap-4 mb-8">
        <span className="text-[12px] font-bold tracking-[0.3em] text-[#f97316] uppercase">
          Phase 0{index + 1}
        </span>
        <div className="h-px w-12 bg-black/10" />
      </div>

      <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-black uppercase leading-[0.85] mb-8">
        {feature.title}
        <br />
        <span className="text-[#f97316]">
          {feature.label}
        </span>
      </h2>

      <p className="text-xl md:text-2xl text-[#52525b] font-medium leading-relaxed max-w-xl mb-12">
        {feature.description}
      </p>

      <div className="flex flex-wrap gap-4">
        <button className="px-8 py-4 bg-black text-white rounded-full font-bold uppercase text-[13px] tracking-widest hover:bg-[#f97316] transition-all active:scale-95 shadow-xl">
          See it in action
        </button>
      </div>
    </motion.div>
  );
}

function FeatureVisual({ index }: { index: number }) {
  const visuals = [
    // Phase 1: Push (Terminal)
    <div className="p-8 font-mono flex item-center justify-center h-full flex-col text-[13px] leading-relaxed" key="push">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
        <span className="ml-2 text-[#71717a] text-[11px] uppercase tracking-widest">zsh — 80x24</span>
      </div>
      <div className="space-y-2">
        <div className="flex gap-3">
          <span className="text-green-500">➜</span>
          <span className="text-white">git push origin main</span>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[#a1a1aa] space-y-1"
        >
          <div>Enumerating objects: 14, done.</div>
          <div>Counting objects: 100% (14/14), done.</div>
          <div>Delta compression using up to 8 threads</div>
          <div>Compressing objects: 100% (8/8), done.</div>
          <div className="text-[#f97316] font-bold mt-2">Kang Hook: Initializing audit...</div>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block px-2 py-0.5 bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 rounded mt-2"
          >
            ANALYZING LOGIC PATTERNS
          </motion.div>
        </motion.div>
      </div>
    </div>,

    // Phase 2: Audit (Scanning)
    <div className="h-full w-full relative flex items-center justify-center" key="audit">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1)_0%,transparent_70%)]" />
      <div className="w-64 h-64 relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 border-2 border-dashed border-[#f97316]/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-4 border border-dashed border-[#f97316]/10 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[#f97316]"
          >
            <RiMagicFill size={64} />
          </motion.div>
        </div>
        {/* Floating Data Points */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#f97316] rounded-full"
            animate={{
              x: [0, Math.cos(i * 60) * 120, 0],
              y: [0, Math.sin(i * 60) * 120, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>
      <div className="absolute bottom-12 text-center">
        <div className="text-[10px] font-bold tracking-[0.4em] text-[#71717a] uppercase mb-2">Cross-referencing logic</div>
        <div className="flex gap-1 justify-center">
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, delay: i * 0.2 }} className="w-1 h-1 bg-[#f97316]" />
          ))}
        </div>
      </div>
    </div>,

    // Phase 3: Fix (Diff)
    <div className="p-8 h-full flex flex-col" key="fix">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
            <RiGitPullRequestLine size={16} />
          </div>
          <span className="text-[13px] font-bold text-white tracking-tight">PR #402: Resolve Auth Leak</span>
        </div>
        <span className="px-3 py-1 bg-green-500 text-black text-[10px] font-black uppercase rounded-full">Ready to merge</span>
      </div>

      <div className="flex-1 bg-[#151517] rounded-xl border border-white/5 overflow-hidden font-mono text-[11px]">
        <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
        </div>
        <div className="p-4 space-y-1">
          <div className="opacity-40">@@ -24,4 +24,4 @@</div>
          <div className="bg-red-500/10 text-red-400 px-2 py-0.5 line-through">
            - return user.token;
          </div>
          <div className="bg-green-500/10 text-green-400 px-2 py-0.5">
            + return sanitize(user.token);
          </div>
          <div className="opacity-40 mt-4">{"// Fix generated by KangBot"}</div>
          <div className="opacity-40">{"// Security audit passed: 100%"}</div>
        </div>
      </div>
    </div>,

    // Phase 4: Education (Explanation)
    <div className="p-12 h-full flex flex-col justify-center" key="education">
      <div className="relative mb-10">
        <div className="absolute -inset-4 bg-gradient-to-r from-[#f97316]/20 to-transparent blur-xl opacity-50" />
        <h3 className="relative text-2xl font-bold text-white mb-4">Why we opened this PR</h3>
        <p className="relative text-[#a1a1aa] text-[15px] leading-relaxed">
          The previous implementation was exposing the raw JWT token in the client response.
          This could lead to token theft via XSS if the frontend isn&apos;t properly hardened.
          Our <span className="text-[#f97316] font-bold italic">Sanitization Pattern</span> ensures only non-sensitive claims are returned.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[10px] uppercase font-black text-[#f97316] mb-2 tracking-widest">Impact</div>
          <div className="text-white font-bold">Critical Fix</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[10px] uppercase font-black text-green-500 mb-2 tracking-widest">Growth</div>
          <div className="text-white font-bold">+1 Security IQ</div>
        </div>
      </div>
    </div>
  ];

  return visuals[index];
}

export default function RootPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className="min-h-screen text-black  font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main className="w-full">
        {/* Full-width subtle background grid - Black dots for white theme */}
        <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* ═══════════════════════════════════════════════════════════════
            HERO — WHITE BRUTALIST FULL WIDTH
        ═══════════════════════════════════════════════════════════════ */}
        <section className="border-b-2 border-black/10">
          {/* ── Centered Hero Content ── */}
          <div className="px-10 md:px-14 py-16 lg:pt-18 flex flex-col items-center text-center relative overflow-hidden">

            {/* ── Social proof badge ── */}
            <div className="flex flex-col items-center gap-6 mb-12">
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.4 }}
                 className="flex items-center gap-3 border-2 border-black/10 bg-white px-5 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)]"
               >
                 <div className="flex -space-x-2">
                   {['#f97316', '#22c55e', '#60a5fa', '#a78bfa', '#ef4444'].map((color, i) => (
                     <div
                       key={i}
                       className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white"
                       style={{ backgroundColor: color, zIndex: 5 - i }}
                     >
                       {['A', 'S', 'R', 'M', 'T'][i]}
                     </div>
                   ))}
                 </div>
                 <span className="text-[13px] font-bold text-gray-700">
                   Join 500+ engineers
                 </span>
               </motion.div>
               <LiveActivityTicker />
            </div>

            {/* ── Headline ── */}
            <motion.h1

              className="text-3xl sm:text-5xl lg:text-7xl uppercase font-bold leading-[1.08] text-black mb-8 w-full"
            >
              Your team ships code. <br />
              <span className="text-[#f97316]">Kang ships</span> <br />
              the fix.
            </motion.h1>

            {/* ── Subtitle ── */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[18px] md:text-[22px] text-gray-500 leading-relaxed mb-10 w-full max-w-3xl font-medium tracking-normal"
            >
              Stop losing sleep over broken reviews. Kang catches logic flaws, secrets, and
              security holes on every PR — then opens a ready-to-merge fix in under 3 minutes.
            </motion.p>


            {/* ── CTAs ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="flex flex-col sm:flex-row items-center gap-5 mb-5"
            >
              <Link
                href="/in/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-black bg-[#f97316] px-12 py-4 text-[18px] font-black text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                Start Free Trial
              </Link>
              <Link
                href="/in/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 border-2 border-black bg-white px-12 py-4 text-[18px] font-black text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                PRICING
              </Link>
            </motion.div>

            {/* ── Trust signals ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-14 text-[13px] font-semibold text-gray-400"
            >
              {[
                'No credit card required',
                'Setup in 60 seconds',
                'Free for first 50 PRs',
                'Cancel anytime here',
              ].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <RiCheckLine size={13} className="text-[#22c55e]" />
                  {t}
                </span>
              ))}
            </motion.div>


          </div>

          {/* ── Brutalist Stats Row ── */}
          <div className="flex flex-col sm:flex-row border-t-2 border-black/10">
            {[
              { label: 'STATUS: BETA', value: '10,000+ PRs FIXED' },
              { label: 'COMMUNITY', value: '500+ BETA USERS' },
              { label: 'LATENCY', value: '< 3 MIN FIXES' },
              { label: 'RELIABILITY', value: '99.9% UPTIME' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`flex-1 px-14 py-16 ${i < 3 ? 'border-b-2 sm:border-b-0 sm:border-r-2' : ''} border-black/10 text-center sm:text-left hover:bg-[#f97316]/5 transition-colors group`}
              >
                <p className="text-[12px] font-bold tracking-[0.3em] text-[#f97316] mb-4 group-hover:translate-x-1 transition-transform">
                  {stat.label}
                </p>
                <p className="text-[2.2rem] lg:text-[3rem] font-bold text-black tracking-normal leading-none">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* ── Full Width Marquee ── */}
          <div className="w-full bg-black text-[#f97316] text-[16px] font-mono py-5 overflow-hidden whitespace-nowrap select-none border-t-2 border-black">
            <div className="inline-block animate-[marquee_20s_linear_infinite] font-bold">
              {Array(6)
                .fill(
                  ' [ AUTONOMOUS_RESOLUTION_SYSTEM ] :: DEPLOYING_FIX_AGENT_001 :: KANG_CORE_v1.0 :: [ SYSTEM_ONLINE ] :: RECOVERY_ENGAGED :: '
                )
                .join('')}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            LOWER SECTIONS — Full Width (Off-White Theme)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-[#fcfcfc] text-black">
          <div className="border-b-2 border-black/10">
            <LogoMarquee />
          </div>

          <section className="px-6 md:px-14 pb-48 pt-32 bg-[#fcfcfc]">
            <div className="w-full max-w-screen-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-24"
              >
                <span className="inline-block text-[14px] font-bold uppercase tracking-[0.4em] text-[#f97316] mb-6">
                  What changes for you
                </span>
                <h2 className="text-5xl md:text-8xl font-bold tracking-tight text-black uppercase leading-none">
                  You ship code. <br /> We secure the standard.
                </h2>
              </motion.div>

              <div className="border-2 border-black/10 bg-white flex flex-col md:flex-row relative shadow-[0_64px_128px_-32px_rgba(0,0,0,0.08)]">
                {/* Left Box: Scrolling Text Blocks */}
                <div className="w-full md:w-1/2 border-b-2 md:border-b-0 md:border-r-2 border-black/10 px-8 md:px-20 py-[15vh]">
                  <div className="space-y-[40vh]">
                    {FEATURES.map((feature, i) => (
                      <FeatureTextBlock
                        key={i}
                        feature={feature}
                        index={i}
                        setActiveIndex={setActiveIndex}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Box: Sticky Visual Container */}
                <div className="hidden md:block w-1/2 sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full h-full relative bg-[#0c0c0e]  overflow-hidden border border-black/10">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, ease: 'circOut' }}
                        className="absolute inset-0"
                      >
                        <FeatureVisual index={activeIndex} />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Corner accents for a boxy feel */}
                  <div className="absolute top-12 left-12 w-6 h-6 border-t-2 border-l-2 border-black/10" />
                  <div className="absolute top-12 right-12 w-6 h-6 border-t-2 border-r-2 border-black/10" />
                  <div className="absolute bottom-12 left-12 w-6 h-6 border-b-2 border-l-2 border-black/10" />
                  <div className="absolute bottom-12 right-12 w-6 h-6 border-b-2 border-r-2 border-black/10" />
                </div>
              </div>
            </div>
          </section>

          <HowItWorks />
          <AIReviewDemo />
          <StatsCounter />
          <FeatureDeepDive />

          {/* Dashboard Showcase */}
          <section className="px-10 md:px-14 pb-48 pt-32 bg-white border-t-2 border-black/10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full text-center mb-24"
            >
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.4em] text-[#f97316] mb-6">
                Your command center
              </span>
              <h2 className="text-4xl md:text-7xl font-black tracking-tight mb-8 uppercase leading-none text-black">
                One place to see <br /> <span className="text-[#f97316]">everything KangBot caught.</span>
              </h2>
              <p className="text-gray-500 text-xl max-w-4xl mx-auto font-medium uppercase leading-relaxed tracking-normal">
                Every repo, every PR, every fix — live. Know what was reviewed, what was flagged, and what KangBot already resolved.
              </p>
            </motion.div>
            <LandingShowcase />
          </section>

          <PricingTeaser />
          <Testimonials />
          <BottomCTA />
          <Footer />
        </div>
      </main>

      <style jsx global>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
