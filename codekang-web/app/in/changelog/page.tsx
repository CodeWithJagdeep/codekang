'use client';

import { motion } from 'framer-motion';
import { 
  RiTimeLine, 
  RiFlashlightLine, 
  RiCodeBoxLine, 
  RiArrowRightLine,
  RiGitCommitLine,
  RiMagicLine,
  RiBugLine
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main>
        {/* ── Hero ── */}
        <section className="pt-32 pb-24 px-10 text-center relative border-b-2 border-black/10">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 py-1 border-2 border-[#f97316] text-[#f97316] text-[12px] font-black uppercase tracking-[0.2em] mb-8">
              Shipping Weekly
            </span>
            <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tight leading-none mb-10">
              Constant <br />
              <span className="text-[#f97316]">Evolution</span>
            </h1>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto mb-12 font-medium uppercase tracking-normal leading-relaxed">
              We move as fast as the mission requires at CodeKang. Every Friday, we ship new refinements and capabilities to the Kang engine.
            </p>
          </motion.div>
        </section>

        {/* ── 02. Performance Evolution (New Metrics Section) ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10 bg-[#111] text-white">
           <div className="max-w-7xl mx-auto">
              <div className="mb-20">
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Engine Metrics</span>
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none">System Performance <br /> <span className="text-[#f97316]">Evolution</span></h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                 {[
                   { l: "Review Speed", v: "-85%", d: "Average time to PR resolution vs v0.1" },
                   { l: "Context Window", v: "2M", d: "Tokens processed in a single reasoning pass" },
                   { l: "Fix Accuracy", v: "99.8%", d: "Verified security patches without regression" },
                   { l: "Autonomous ROI", v: "4.8x", d: "Engineering hours saved per developer/month" }
                 ].map((stat, i) => (
                   <div key={i} className="border-l-2 border-[#f97316] pl-8">
                      <span className="block text-5xl font-black text-[#f97316] mb-4">{stat.v}</span>
                      <span className="block text-[14px] font-black uppercase tracking-widest mb-2">{stat.l}</span>
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-tight leading-relaxed">{stat.d}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── 03. Changelog Feed ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10 bg-white">
           <div className="max-w-4xl mx-auto space-y-32">
              
              {[
                {
                  date: "MAY 01, 2026",
                  title: "Predictive Refactoring Engine",
                  desc: "Kang can now analyze your codebase to predict where technical debt is accumulating and propose refactoring PRs before performance degrades.",
                  help: "Reduces future maintenance costs by 25%.",
                  type: "Core Engine",
                  icon: RiMagicLine
                },
                {
                  date: "APR 24, 2026",
                  title: "Autonomous Browser Control v2",
                  desc: "The agent can now interact with complex SPAs, handle authentication flows, and verify UI changes across multiple viewports.",
                  help: "Reduces manual QA time by 40%.",
                  type: "Feature",
                  icon: RiMagicLine
                },
                {
                  date: "APR 17, 2026",
                  title: "Deep Contextual Search",
                  desc: "Integrated vector search across your entire documentation and codebase for even more precise issue resolution.",
                  help: "Agent resolution accuracy increased by 15%.",
                  type: "Optimization",
                  icon: RiFlashlightLine
                },
                {
                  date: "APR 10, 2026",
                  title: "Security Scan Auto-Fix",
                  desc: "When a secret or vulnerability is detected, the agent now automatically creates a patch PR before you even see the alert.",
                  help: "MTTR reduced to near-zero.",
                  type: "Security",
                  icon: RiBugLine
                },
                {
                  date: "APR 03, 2026",
                  title: "Multi-Repo Dependency Mapping",
                  desc: "Kang now understands cross-repository dependencies, ensuring that changes in a shared library are safely propagated to all consuming services.",
                  help: "Prevents breaking changes in distributed systems.",
                  type: "Architecture",
                  icon: RiCodeBoxLine
                },
                {
                  date: "MAR 27, 2026",
                  title: "Zero-Trust Review Protocol",
                  desc: "Implemented a new verification layer that cryptographically signs every review and fix PR, ensuring 100% auditability for enterprise teams.",
                  help: "Meets strict compliance requirements for Fintech and Healthcare.",
                  type: "Compliance",
                  icon: RiGitCommitLine
                },
                {
                  date: "MAR 20, 2026",
                  title: "Kang Kernel v4.0 Release",
                  desc: "A massive overhaul of the underlying reasoning engine. Faster inference times and better handling of extremely large context windows (up to 2M tokens).",
                  help: "Processing speed increased by 3x.",
                  type: "Major Release",
                  icon: RiFlashlightLine
                },
                {
                  date: "MAR 13, 2026",
                  title: "Automated Unit Test Synthesis",
                  desc: "Kang now generates comprehensive Vitest and Jest suites for all new logic introduced in a PR, achieving 90%+ branch coverage automatically.",
                  help: "Eliminates manual test writing for 80% of features.",
                  type: "Quality",
                  icon: RiCodeBoxLine
                },
                {
                  date: "MAR 06, 2026",
                  title: "Semantic Code Search API",
                  desc: "Exposed a high-performance API for searching through your codebase using natural language queries, powered by our custom embeddings.",
                  help: "Developers find relevant code 10x faster.",
                  type: "Infrastructure",
                  icon: RiMagicLine
                }
              ].map((update, i) => (
                <div key={i} className="relative pl-12 border-l-4 border-black">
                   <div className="absolute top-0 -left-[22px] w-10 h-10 border-4 border-black bg-[#f97316] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                      <update.icon size={20} className="text-white" />
                   </div>
                   <div>
                      <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 block">{update.date}</span>
                      <div className="inline-block px-2 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest mb-4">
                         {update.type}
                      </div>
                      <h3 className="text-4xl font-black uppercase tracking-tight mb-6">{update.title}</h3>
                      <p className="text-xl text-gray-500 font-medium uppercase tracking-normal leading-relaxed mb-8">
                         {update.desc}
                      </p>
                      <div className="p-4 bg-[#f97316]/5 border-2 border-dashed border-[#f97316]">
                         <p className="text-[12px] font-black uppercase text-[#f97316]">IMPACT: {update.help}</p>
                      </div>
                   </div>
                </div>
              ))}

           </div>
        </section>

        {/* ── 04. Path to v1.0 (Milestone Archive) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-[#f4f4f5]">
           <div className="max-w-7xl mx-auto">
              <div className="mb-24">
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">The Archive</span>
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none">The Path to <br /> <span className="text-[#f97316]">CodeKang v1.0</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
                 {[
                   { v: "v0.1", t: "Genesis", d: "First autonomous PR review on a private repo.", date: "JAN 2025" },
                   { v: "v0.4", t: "Contextual Awareness", d: "Engine begins understanding cross-file dependencies.", date: "MAY 2025" },
                   { v: "v0.8", t: "Security Guard", d: "Integrated secret scanning and CVE detection.", date: "OCT 2025" },
                   { v: "v1.0", t: "The Partner", d: "Full autonomous resolution and verify launch.", date: "MAR 2026" }
                 ].map((milestone, i) => (
                   <div key={i} className="p-12 border-2 border-black bg-white group hover:bg-black hover:text-white transition-all">
                      <span className="text-sm font-black text-[#f97316] mb-4 block">{milestone.v}</span>
                      <h4 className="text-2xl font-black uppercase mb-4 tracking-tight">{milestone.t}</h4>
                      <p className="text-sm font-bold uppercase tracking-normal leading-relaxed opacity-60 mb-8">{milestone.d}</p>
                      <span className="text-[10px] font-black tracking-widest opacity-40">{milestone.date}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── 05. Roadmap Section ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10 bg-[#fcfcfc]">
           <div className="max-w-4xl mx-auto">
              <div className="mb-20 text-center">
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Looking Ahead</span>
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none">The Future <br /> of CodeKang</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { t: "Autonomous Deployment", d: "Kang will soon be able to manage the entire deployment pipeline, monitoring health metrics and performing auto-rollbacks if anomalies are detected." },
                   { t: "Architectural Co-Pilot", d: "Beyond code, Kang will assist in designing system architectures, drawing diagrams, and suggesting infrastructure-as-code improvements." },
                   { t: "Enhanced Team Memory", d: "Kang will remember past architectural decisions across your entire history, preventing 'architecture drift' as your team scales." },
                   { t: "Native IDE Integration", d: "Bringing the power of Kang directly into VS Code and IntelliJ for even tighter feedback loops during development." }
                 ].map((item, i) => (
                   <div key={i} className="p-10 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <h4 className="text-2xl font-black uppercase mb-4">{item.t}</h4>
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-normal leading-relaxed">{item.d}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-40 px-10 text-center bg-white">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tight leading-none mb-12">
            Stay in the <br /> <span className="text-[#f97316]">loop</span>
          </h2>
          <button className="inline-flex items-center gap-3 border-2 border-black bg-black px-16 py-8 text-[24px] font-black text-white transition-all shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none">
            SUBSCRIBE TO UPDATES <RiArrowRightLine size={32} />
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
