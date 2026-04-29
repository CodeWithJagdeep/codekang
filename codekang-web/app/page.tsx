'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { getAccessToken } from '@/lib/auth';
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
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (getAccessToken()) {
      router.replace('/dashboard');
    }
  }, [router]);

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
            </div>

            {/* ── Headline ── */}
            <motion.h1
              className="text-3xl sm:text-5xl lg:text-7xl uppercase font-bold leading-[1.08] text-black mb-6 w-full"
            >
              AI that reviews your PRs,<br />
              <span className="text-[#f97316]">fixes real bugs,</span><br />
              opens the fix PR.
            </motion.h1>

            {/* ── Sub-bullets ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mb-6 text-[14px] font-semibold text-gray-500"
            >
              {[
                'Not just comments — actual fix PRs',
                'Reads codebase context, not just the diff',
                'Catches SQLi, hardcoded secrets, null bugs, N+1 queries',
              ].map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <RiCheckLine size={13} className="text-[#22c55e] shrink-0" />
                  {b}
                </span>
              ))}
            </motion.div>

            {/* ── Subtitle ── */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[17px] md:text-[20px] text-gray-500 leading-relaxed mb-10 w-full max-w-2xl font-medium tracking-normal"
            >
              Kang installs in 60 seconds, attaches to every PR automatically, and opens a ready-to-merge fix when it finds a real bug. You review and approve — it never auto-merges anything.
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
              { label: 'FIX PR LATENCY', value: '< 3 MIN' },
              { label: 'BETA ENGINEERS', value: '500+' },
              { label: 'AUTO-MERGES', value: '0 — EVER' },
              { label: 'SETUP TIME', value: '< 60 SEC' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`flex-1 px-10 py-14 ${i < 3 ? 'border-b-2 sm:border-b-0 sm:border-r-2' : ''} border-black/10 text-center sm:text-left hover:bg-[#f97316]/5 transition-colors group`}
              >
                <p className="text-[11px] font-bold tracking-[0.3em] text-[#f97316] mb-4 group-hover:translate-x-1 transition-transform">
                  {stat.label}
                </p>
                <p className="text-[2rem] lg:text-[2.6rem] font-bold text-black tracking-normal leading-none">{stat.value}</p>
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

          {/* ── Positioning: Not X, Not Y ── */}
          <section className="px-6 md:px-14 py-20 bg-white border-b-2 border-black/10">
            <div className="max-w-5xl mx-auto text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#f97316] mb-6">Clear positioning</p>
              <h2 className="text-2xl md:text-4xl font-black text-black uppercase tracking-tight mb-10">
                Kang is not a code generator.<br />Not a scanner. Not a chatbot.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {[
                  {
                    versus: 'vs GitHub Copilot',
                    theirs: 'Suggests code as you type. Doesn\'t review what you already wrote.',
                    ours: 'Kang reviews every PR after it\'s written and opens a fix when it finds a real bug.',
                  },
                  {
                    versus: 'vs Snyk / SAST',
                    theirs: 'Reports vulnerabilities in a dashboard. You still have to fix them manually.',
                    ours: 'Kang fixes what it finds. The fix PR is ready before you finish reading the alert.',
                  },
                  {
                    versus: 'vs CodeRabbit / PR bots',
                    theirs: 'Leaves AI-generated comments on your PR. Still just comments.',
                    ours: 'Kang opens a separate fix PR with a correct code diff. You approve or skip.',
                  },
                ].map((item, i) => (
                  <div key={i} className="border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#f97316] mb-4">{item.versus}</p>
                    <p className="text-[13px] text-gray-400 mb-3 leading-relaxed line-through decoration-gray-300">{item.theirs}</p>
                    <p className="text-[14px] text-black font-semibold leading-relaxed">{item.ours}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

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
          {/* ── What Kang does NOT do ── */}
          <section className="px-6 md:px-14 py-24 bg-white border-t-2 border-black/10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#f97316] mb-4">Trust & control</p>
                <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tight">
                  What Kang does<br /><span className="text-[#f97316]">not</span> do.
                </h2>
                <p className="text-gray-500 text-lg mt-4 font-medium max-w-xl mx-auto">
                  We think you should know the boundaries before you hand us access to your codebase.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { point: 'Never auto-merges', detail: 'Every fix PR waits for your explicit approval. Kang can\'t merge anything without you.' },
                  { point: 'Never touches production', detail: 'Kang only opens PRs on your branches. It has no deployment access and can\'t trigger releases.' },
                  { point: 'Never stores your code', detail: 'We analyze diffs in-memory during review. Your source code is not stored on our servers.' },
                  { point: 'Never rewrites your architecture', detail: 'Kang fixes bugs and security issues in existing code. It doesn\'t redesign, refactor, or restructure.' },
                  { point: 'Never learns from your private code', detail: 'Your repos are not used to train or fine-tune any model. Your code is yours.' },
                  { point: 'Never acts without a trigger', detail: 'Kang only runs when a PR is opened or updated. It doesn\'t run background jobs on your codebase.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 border border-black/10 bg-[#fcfcfc]">
                    <div className="w-5 h-5 border-2 border-black bg-black flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-[10px] font-black">✕</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-black uppercase tracking-tight mb-1">{item.point}</p>
                      <p className="text-[13px] text-gray-500 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Security & Privacy ── */}
          <section className="px-6 md:px-14 py-20 bg-black border-t-2 border-black">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#f97316] mb-4">Security & Privacy</p>
                  <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
                    You&apos;re handing us<br />access to your code.<br />Here&apos;s what we do with it.
                  </h2>
                  <p className="text-gray-400 text-[15px] leading-relaxed font-medium">
                    We take a minimal-access approach by design. Kang requests only the permissions it needs to read PRs and open fix branches — nothing more.
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'GitHub OAuth scope', value: 'Read PRs · Write comments · Open branches. No admin access.' },
                    { label: 'Code storage', value: 'Diffs are analyzed in-memory. Source code is never persisted.' },
                    { label: 'Data retention', value: 'PR metadata only. Deleted on disconnect.' },
                    { label: 'SOC 2', value: 'In progress. Available Q3 2025. Contact us for current posture doc.' },
                    { label: 'Private code & AI training', value: 'Your code is never used to train any model. Ever.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 border-b border-white/5 pb-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#f97316] w-36 shrink-0 mt-0.5">{item.label}</p>
                      <p className="text-[13px] text-gray-300 leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

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
