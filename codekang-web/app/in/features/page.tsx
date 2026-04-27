'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  RiArrowRightLine,
  RiCodeSSlashLine,
  RiBugLine,
  RiSpeedUpLine,
  RiTeamLine,
  RiShieldCheckLine,
  RiFlowChart,
  RiTerminalBoxLine,
  RiLockPasswordLine,
  RiDatabase2Line,
  RiCheckboxCircleLine
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';

const FEATURES = [
  {
    icon: RiCodeSSlashLine,
    title: 'Context-Aware Reviews',
    desc: 'Never merge a breaking change again. Catch architectural flaws before they ripple across your codebase.',
    color: '#f97316'
  },
  {
    icon: RiBugLine,
    title: 'Autonomous Bug Fixing',
    desc: 'Reclaim hours of engineering time. Watch complex bugs get resolved automatically while you sleep.',
    color: '#22c55e'
  },
  {
    icon: RiSpeedUpLine,
    title: 'Performance Optimization',
    desc: 'Keep your users happy with lightning-fast load times. Eliminate N+1 queries automatically.',
    color: '#3b82f6'
  },
  {
    icon: RiTeamLine,
    title: 'Team Standards',
    desc: 'Onboard new engineers faster. Stop arguing about conventions and let the agent enforce your exact standards.',
    color: '#a78bfa'
  },
  {
    icon: RiShieldCheckLine,
    title: 'Security Hardening',
    desc: 'Pass your next compliance audit with ease. Auto-patch vulnerabilities to keep your user data secure.',
    color: '#ec4899'
  },
  {
    icon: RiFlowChart,
    title: 'Architecture Mapping',
    desc: 'Gain total clarity over your monolithic legacy code and refactor with absolute confidence.',
    color: '#eab308'
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main className="w-full">
        {/* ── Hero ── */}
        <section className="pt-32 pb-24 px-10 text-center relative border-b-2 border-black/10 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 py-1 border-2 border-[#f97316] text-[#f97316] text-[12px] font-black uppercase tracking-[0.2em] mb-8">
              Your Engineering Catalyst
            </span>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              Ship higher quality <br />
              <span className="text-[#f97316]">with less effort</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto mb-14 leading-tight uppercase tracking-tighter">
              Stop wasting your brightest minds on tedious reviews. Reclaim 20+ hours a week for creative problem solving.
            </p>
          </motion.div>
        </section>

        {/* ── Features Grid ── */}
        <section className="py-32 px-10 md:px-14 border-b-2 border-black/10 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="p-10 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] hover:border-[#f97316] transition-all group bg-[#fcfcfc]">
                  <div className="w-16 h-16 border-2 border-black mb-8 flex items-center justify-center bg-white group-hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Icon size={32} style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Deep Dive: Workflow ── */}
        <section className="py-32 px-10 border-b-2 border-black/10 bg-[#f97316]/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-4 block">The CodeKang Workflow</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">How KangBot operates</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Analyze Context',
                  desc: 'KangBot pulls your entire repository graph, understanding dependencies, internal APIs, and coding patterns before reviewing a single line of the new PR.',
                  icon: RiDatabase2Line
                },
                {
                  step: '02',
                  title: 'Detect & Plan',
                  desc: 'It identifies logical flaws, security vulnerabilities, and performance bottlenecks, then drafts a step-by-step resolution plan.',
                  icon: RiTerminalBoxLine
                },
                {
                  step: '03',
                  title: 'Execute & Verify',
                  desc: 'The agent writes the fix, runs your unit tests in a secure sandbox, and automatically pushes the verified commit to your branch.',
                  icon: RiCheckboxCircleLine
                }
              ].map((item, i) => (
                <div key={i} className="bg-white p-10 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                  <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#f97316] text-white font-black text-xl flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {item.step}
                  </div>
                  <item.icon size={40} className="text-[#f97316] mb-6 mt-4" />
                  <h4 className="text-2xl font-black uppercase mb-4">{item.title}</h4>
                  <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Enterprise Security ── */}
        <section className="py-32 px-10 border-b-2 border-black/10 bg-black text-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-4 block">Zero-Trust Architecture</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8">Bank-grade security built in</h2>
              <p className="text-xl text-gray-400 font-medium leading-relaxed mb-10">
                Your code is your most valuable asset. CodeKang runs in isolated, ephemeral containers that are instantly destroyed after every session.
              </p>
              <ul className="space-y-6">
                {[
                  'SOC2 Type II Certified',
                  'GDPR & CCPA Compliant',
                  'Zero Data Retention Policy',
                  'End-to-End Encryption (AES-256)'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg font-bold uppercase tracking-tight">
                    <RiLockPasswordLine className="text-[#f97316]" size={24} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative border-2 border-[#f97316] p-8 shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] bg-[#111]">
              <div className="font-mono text-sm space-y-2 text-emerald-400">
                <p>{'>'} initializing secure sandbox...</p>
                <p className="text-gray-500">{'>'} attaching ephemeral volume: vol_928fja</p>
                <p>{'>'} cloning repository (depth=1)...</p>
                <p>{'>'} running security analysis...</p>
                <p className="text-[#f97316]">{'>'} INFO: 0 vulnerabilities found</p>
                <p className="text-gray-500">{'>'} shredding container data...</p>
                <p>{'>'} session terminated securely.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-32 px-10 text-center bg-[#fcfcfc]">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-10">
            Ready to <span className="text-[#f97316]">transform</span> your workflow?
          </h2>
          <Link
            href="/in/signup"
            className="inline-flex items-center gap-3 border-2 border-black bg-black px-16 py-8 text-[20px] font-black text-white transition-all shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            START YOUR FREE TRIAL <RiArrowRightLine size={28} />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
