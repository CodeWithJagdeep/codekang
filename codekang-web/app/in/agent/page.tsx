'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  RiArrowRightLine,
  RiSearchEyeLine,
  RiShieldFlashLine,
  RiCheckboxCircleLine,
  RiExchangeLine,
  RiTestTubeLine,
  RiStarFill
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';

// ── Data: CodeKang Core Values ───────────────────────────────────────────────

const KANG_CAPABILITIES = [
  {
    id: 'review',
    title: 'Deep Contextual Review',
    subtitle: 'It knows your repo better than you do',
    description: 'Most AI review tools only look at the diff. KangBot ingests your entire repository history to understand how a change in /auth might ripple into /payments.',
    features: [
      { t: 'Architectural Awareness', d: 'Identifies violations of your custom design patterns and structural rules automatically.' },
      { t: 'Risk-Based Scoring', d: 'Predicts PR risk by analyzing code complexity, test coverage, and historical bug hotspots.' },
      { t: 'Educational Inline Feedback', d: 'Provides clear, actionable comments that help your team learn your specific standards.' }
    ],
    accent: '#f97316',
    icon: RiSearchEyeLine,
  },
  {
    id: 'fix',
    title: 'Autonomous Resolution',
    subtitle: 'Don’t just find bugs. Fix them.',
    description: 'When KangBot spots a fixable issue, it doesn’t just leave a comment—it opens a ready-to-merge Pull Request with the corrected code.',
    features: [
      { t: 'Auto-Fix PRs', d: 'Patches N+1 queries, type mismatches, and logic errors before you even finish your morning coffee.' },
      { t: 'Security Hardening', d: 'Automatically closes SQL injection vectors, patches leaked secrets, and fixes missing auth guards.' },
      { t: 'Performance Optimization', d: 'Refactors inefficient loops and suggests caching strategies based on actual usage patterns.' }
    ],
    accent: '#22c55e',
    icon: RiShieldFlashLine,
  },
  {
    id: 'verify',
    title: 'Verified Execution',
    subtitle: 'It runs your tests in a secure sandbox',
    description: 'The agent has full access to a terminal and browser, allowing it to run your test suite and verify every fix before submitting it.',
    features: [
      { t: 'Terminal & CLI Access', d: 'Runs build commands, installs packages, and validates environment configurations.' },
      { t: 'Browser Debugging', d: 'Navigates your frontend to detect UI regressions and verify layout fixes across viewports.' },
      { t: 'Zero-Regression Guarantee', d: 'Iterates on fixes until all unit and integration tests pass successfully.' }
    ],
    accent: '#3b82f6',
    icon: RiTestTubeLine,
  },
  {
    id: 'integrate',
    title: 'Integrated Workflow',
    subtitle: 'Works where your team works',
    description: 'CodeKang fits seamlessly into your existing engineering stack, connecting your VCS, issue tracker, and communication tools.',
    features: [
      { t: 'GitHub & GitLab Native', d: 'Installs as a native app with zero YAML config or complex CI scripts required.' },
      { t: 'Jira & Linear Sync', d: 'Automatically updates ticket status and links fix PRs to their respective issues.' },
      { t: 'Slack & Discord Alerts', d: 'Get live activity feeds of agent progress and high-risk PR alerts where you hang out.' }
    ],
    accent: '#a78bfa',
    icon: RiExchangeLine,
  }
];

// ── Components ───────────────────────────────────────────────────────────────

function CapabilitySection({ item, index }: { item: typeof KANG_CAPABILITIES[0], index: number }) {
  const Icon = item.icon;
  const isEven = index % 2 === 0;

  return (
    <section id={item.id} className={`py-32 px-10 md:px-14 border-b-2 border-black/10 ${isEven ? 'bg-white' : 'bg-[#fcfcfc]'}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        <div className={!isEven ? 'lg:order-2' : ''}>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[12px] font-black uppercase tracking-[0.3em]" style={{ color: item.accent }}>{item.title}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
            {item.subtitle}
          </h2>
          <p className="text-lg text-gray-500 font-medium leading-relaxed mb-10">
            {item.description}
          </p>

          <div className="space-y-10">
            {item.features.map((f, i) => (
              <div key={i} className="group">
                <h4 className="text-lg font-black uppercase mb-2 group-hover:text-[#f97316] transition-colors">{f.t}</h4>
                <p className="text-gray-500 font-medium leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`relative h-[550px] border-2 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex items-center justify-center ${!isEven ? 'lg:order-1' : ''}`}>
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
           
           <div className="relative z-10 w-full px-12">
              <div className="grid grid-cols-2 gap-4">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="h-32 border-2 border-black/5 bg-gray-50/50 flex items-center justify-center">
                       {i === 1 && <Icon size={48} style={{ color: item.accent }} />}
                    </div>
                 ))}
              </div>
              <div className="mt-8 p-6 border-2 border-black bg-black text-white font-mono text-[11px] leading-tight shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
                    <span className="text-[#f97316] font-bold">KANGBOT_CORE_EXECUTION</span>
                 </div>
                 {index === 0 && "> Scanning architecture... detected cyclic dependency in /models"}
                 {index === 1 && "> Analysis complete... opening fix PR for SQL injection in user_search.ts"}
                 {index === 2 && "> Running integration tests... all 48 tests passed in 12.4s"}
                 {index === 3 && "> Syncing with Jira... ticket ENG-442 updated to 'RESOLVED'"}
              </div>
           </div>
        </div>

      </div>
    </section>
  );
}

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main className="w-full">
        {/* ── Hero ── */}
        <section className="pt-32 pb-40 px-10 text-center relative border-b-2 border-black/10 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            <span className="inline-block px-3 py-1 border-2 border-black text-black text-[12px] font-black uppercase tracking-[0.2em] mb-8">
              CodeKang v1 Beta
            </span>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              Hire the <br />
              <span className="text-[#f97316]">AI Engineer</span> <br />
              you always wanted
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto mb-14 leading-tight uppercase tracking-tighter">
              CodeKang reviews every PR with full context and opens auto-fix PRs for bugs, security, and performance.
            </p>

            <Link
              href="/in/login"
              className="inline-flex items-center gap-3 border-2 border-black bg-[#f97316] px-14 py-7 text-[22px] font-black text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              HIRE KANGBOT FOR FREE <RiArrowRightLine size={28} />
            </Link>
          </motion.div>
        </section>

        {/* ── Capabilities Sections ── */}
        {KANG_CAPABILITIES.map((item, i) => (
          <CapabilitySection key={item.id} item={item} index={i} />
        ))}

        {/* ── Comparison ── */}
        <section className="py-32 px-10 border-b-2 border-black/10 bg-white">
           <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-center mb-20">The Agent <span className="text-[#f97316]">Advantage</span></h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="p-10 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-2xl font-black uppercase mb-8 border-b-2 border-black pb-4">Standard Flow</h3>
                    <ul className="space-y-6">
                       <li className="text-gray-400 font-bold uppercase line-through">Wait 4 hours for review</li>
                       <li className="text-gray-400 font-bold uppercase line-through">Manually fix N+1 queries</li>
                       <li className="text-gray-400 font-bold uppercase line-through">Hope security isn't broken</li>
                       <li className="text-gray-400 font-bold uppercase line-through">Write tests manually</li>
                    </ul>
                 </div>
                 <div className="p-10 border-2 border-[#f97316] shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] bg-[#f97316]/5">
                    <h3 className="text-2xl font-black uppercase mb-8 border-b-2 border-[#f97316] pb-4 text-[#f97316]">CodeKang Flow</h3>
                    <ul className="space-y-6">
                       <li className="font-bold uppercase">Review in 30 seconds</li>
                       <li className="font-bold uppercase">Auto-fix PRs delivered</li>
                       <li className="font-bold uppercase">SOC2 & GDPR hardened</li>
                       <li className="font-bold uppercase">Verified in sandbox</li>
                    </ul>
                 </div>
              </div>
           </div>
        </section>

        {/* ── Real-world Example ── */}
        <section className="py-32 px-10 border-b-2 border-black/10 bg-[#f97316]/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-4">Real-world impact</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">From 4 hours to 4 minutes</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-black border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              {/* Before: Human Review */}
              <div className="bg-white p-12">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 border-2 border-black bg-gray-100 flex items-center justify-center">
                    <span className="font-black">01</span>
                  </div>
                  <h4 className="text-xl font-black uppercase">The Human Wait</h4>
                </div>
                <div className="space-y-6">
                  <div className="p-6 border-2 border-black bg-gray-50 font-mono text-[13px] opacity-50">
                    <span className="text-red-500">- return res.status(400).send();</span>
                    <p className="mt-2 text-gray-400">// Dev pushes a typo (400 instead of 404)</p>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 font-bold uppercase text-[12px]">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    PR sits in queue for 3.5 hours
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 font-bold uppercase text-[12px]">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    Lead finds typo, requests change
                  </div>
                  <div className="text-4xl font-black mt-8 text-gray-300 uppercase italic">~ 4 Hours</div>
                </div>
              </div>

              {/* After: CodeKang Agent */}
              <div className="bg-white p-12">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 border-2 border-black bg-[#f97316] text-white flex items-center justify-center">
                    <span className="font-black">02</span>
                  </div>
                  <h4 className="text-xl font-black uppercase">The KangBot Pulse</h4>
                </div>
                <div className="space-y-6">
                  <div className="p-6 border-2 border-[#f97316] bg-[#f97316]/5 font-mono text-[13px]">
                    <span className="text-emerald-500">+ return res.status(404).send();</span>
                    <p className="mt-2 text-[#f97316] font-bold">// AI detects incorrect status code & fixes it</p>
                  </div>
                  <div className="flex items-center gap-3 text-black font-bold uppercase text-[12px]">
                    <div className="w-2 h-2 rounded-full bg-[#f97316]" />
                    AI notifies team in 30 seconds
                  </div>
                  <div className="flex items-center gap-3 text-black font-bold uppercase text-[12px]">
                    <div className="w-2 h-2 rounded-full bg-[#f97316]" />
                    AI pushes fixed code automatically
                  </div>
                  <div className="text-4xl font-black mt-8 text-[#f97316] uppercase italic">~ 4 Minutes</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-40 px-10 text-center bg-[#fcfcfc]">
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-10">
            Scale your <br /> <span className="text-[#f97316]">engineering</span> <br /> without hiring
          </h2>
          <Link
            href="/in/login"
            className="inline-flex items-center gap-3 border-2 border-black bg-black px-16 py-8 text-[24px] font-black text-white transition-all shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            GET STARTED NOW <RiArrowRightLine size={32} />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
