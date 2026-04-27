'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiSeedlingLine, 
  RiFlashlightLine, 
  RiTeamLine, 
  RiArrowRightLine,
  RiArrowDownSLine,
  RiFocus2Line,
  RiLightbulbLine,
  RiHeart2Line,
  RiGlobalLine,
  RiCodeSSlashLine,
  RiMapPinRangeLine,
  RiTerminalBoxLine,
  RiToolsLine,
  RiStackLine,
  RiShieldFlashLine,
  RiDoubleQuotesL,
  RiFlagLine,
  RiEarthLine,
  RiPulseLine,
  RiSkullLine,
  RiMentalHealthLine,
  RiTestTubeLine,
  RiQuestionLine,
  RiShieldCheckLine,
  RiExchangeLine,
  RiCompass3Line,
  RiGithubFill,
  RiSlackFill,
  RiGitlabFill,
  RiPieChartLine
} from 'react-icons/ri';
import { 
  SiJira, 
  SiLinear, 
  SiNotion, 
  SiSentry, 
  SiVercel, 
  SiDatadog
} from 'react-icons/si';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';

function FaqItem({ faq }: { faq: { q: string; a: string } }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-2 border-black bg-[#fcfcfc] overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex items-center justify-between text-left hover:bg-[#f97316]/5 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <RiQuestionLine size={24} className={`${isOpen ? 'text-[#f97316]' : 'text-black'} transition-colors`} />
          <h4 className="text-xl md:text-2xl font-black uppercase leading-tight">{faq.q}</h4>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="shrink-0 w-10 h-10 border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all"
        >
          <RiArrowDownSLine size={24} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-8 pb-8 pt-0">
               <div className="h-0.5 w-full bg-black/5 mb-8" />
               <p className="text-lg text-gray-500 font-medium uppercase tracking-tight leading-relaxed">
                {faq.a}
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main>
        {/* ── 01. Professional Hero ── */}
        <section className="pt-40 pb-32 px-10 text-center relative border-b-2 border-black/10 overflow-hidden bg-white">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 border-2 border-black bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] mb-12">
              Project CodeKang / Meet Kang
            </span>
            <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tight leading-none mb-12">
              The Journey <br />
              <span className="text-[#f97316]">to Autonomy</span>
            </h1>
            <p className="text-[20px] md:text-[24px] text-gray-400 max-w-4xl mx-auto mb-16 font-medium uppercase tracking-normal leading-relaxed">
              We are at the beginning. Kang is our early step towards building a system that doesn't just assist engineers, but truly understands and partners with them to build better software.
            </p>
          </motion.div>
        </section>

        {/* ── 02. Mission & Vision (Corporate Brutalist) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-[#fcfcfc]">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 border-4 border-black divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-black shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] bg-white">
              <div className="p-16 lg:p-24 flex flex-col justify-between">
                 <div>
                    <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-8 block">Section 01 / Mission</span>
                    <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-10 leading-none">Start <br /> Small</h2>
                    <p className="text-xl text-gray-500 font-medium uppercase tracking-normal leading-relaxed mb-8">
                       Our mission at CodeKang is to slowly eliminate the mechanical friction of software engineering. We're starting with the repetitive tasks, so developers can eventually focus on architecture and pure creativity.
                    </p>
                 </div>
                 <RiFlagLine size={80} className="text-black opacity-10" />
              </div>
              <div className="p-16 lg:p-24 flex flex-col justify-between bg-[#f97316]/5">
                 <div>
                    <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-8 block">Section 02 / Vision</span>
                    <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-10 leading-none">A New <br /> Partner</h2>
                    <p className="text-xl text-gray-500 font-medium uppercase tracking-tight leading-tight mb-8">
                       We're working towards a future where every developer has a partner in Kang — one that handles the tedious details while they focus on the big picture.
                    </p>
                 </div>
                 <RiCompass3Line size={80} className="text-[#f97316] opacity-20" />
              </div>
           </div>
        </section>

        {/* ── 03. Remote DNA (The Motive) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-white">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <div>
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Our Motive</span>
                 <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tight mb-12 leading-none">Built for <br /> <span className="text-[#f97316]">The Async World</span></h2>
                 <p className="text-2xl text-gray-500 font-medium uppercase tracking-normal leading-relaxed mb-12">
                    Working remotely from day zero wasn't a choice; it was our foundation. We realized that the biggest bottleneck in engineering isn't the code — it's the coordination. 
                 </p>
                 <p className="text-lg text-gray-400 font-medium uppercase tracking-normal leading-relaxed mb-12">
                    Without an office to sync in, we had to build a partner that could maintain the context of our entire system. Kang was born out of the necessity for an AI that could "know" the codebase better than any single human could while working across 12 timezones.
                 </p>
                 <div className="flex gap-12">
                    <div>
                       <span className="block text-4xl font-black mb-1">100%</span>
                       <span className="block text-[11px] font-black uppercase tracking-widest text-gray-400">Remote Since Day 0</span>
                    </div>
                    <div>
                       <span className="block text-4xl font-black mb-1">12</span>
                       <span className="block text-[11px] font-black uppercase tracking-widest text-gray-400">Global Timezones</span>
                    </div>
                 </div>
              </div>
              <div className="space-y-8">
                 <div className="border-4 border-black p-12 bg-[#fcfcfc] shadow-[12px_12px_0px_0px_rgba(249,115,22,1)]">
                    <RiGlobalLine size={60} className="text-[#f97316] mb-8" />
                    <p className="text-xl font-black uppercase leading-tight mb-6">
                       "We didn't have an office to sync in, so we built a partner that syncs for us. That partner became Kang."
                    </p>
                    <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">— The Founding Team</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 border-2 border-black bg-white">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f97316] mb-2">Zero Meetings</h4>
                       <p className="text-[11px] font-bold text-gray-400 uppercase">We communicate via Kang's review threads and markdown.</p>
                    </div>
                    <div className="p-6 border-2 border-black bg-white">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f97316] mb-2">High Trust</h4>
                       <p className="text-[11px] font-bold text-gray-400 uppercase">We value output over clock-ins. You own your time.</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ── 04. Engineering Manifesto (Culture) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-black text-white overflow-hidden">
           <div className="max-w-7xl mx-auto">
              <div className="mb-32">
                 <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tight mb-8 leading-none">Cultural <br /> <span className="text-[#f97316]">Core</span></h2>
                 <p className="text-xl text-white/40 max-w-2xl font-medium uppercase tracking-widest">The engineering principles that define our team at CodeKang.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                 {[
                   { t: "Deep Focus", d: "We protect developer flow. Kang handles the noise, context-switching, and manual chores.", icon: RiFocus2Line },
                   { t: "Extreme Ownership", d: "Every engineer is the CEO of their domain. We build it, we ship it, Kang secures it.", icon: RiShieldCheckLine },
                   { t: "Radical Transparency", d: "Everything is documented. Kang's thought process is public, async, and egoless.", icon: RiExchangeLine },
                   { t: "V1 Mentality", d: "We ship fast. Perfection is found in iteration, empowered by Kang's speed.", icon: RiFlashlightLine }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-10 items-start group">
                      <div className="w-20 h-20 border-2 border-white/20 flex items-center justify-center shrink-0 group-hover:bg-[#f97316] group-hover:border-[#f97316] transition-all">
                         <item.icon size={40} className="text-white" />
                      </div>
                      <div>
                         <h3 className="text-3xl font-black uppercase mb-4">{item.t}</h3>
                         <p className="text-lg text-white/50 font-medium uppercase tracking-tight leading-tight">{item.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── 05. The Ecosystem (Codebase Integrated) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-white">
           <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-24">
                 <div className="max-w-2xl">
                    <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Our Ecosystem</span>
                     <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-tight mb-6">Universal <br /> Integrations</h2>
                  </div>
                  <p className="text-xl text-gray-500 font-medium uppercase tracking-normal leading-relaxed max-w-md">
                     Kang isn't an island. He integrates deeply with the tools you already use—from GitHub and Linear to Sentry and Datadog.
                  </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                 {[
                   { name: 'GitHub', icon: RiGithubFill, color: '#000000' },
                   { name: 'GitLab', icon: RiGitlabFill, color: '#fc6d26' },
                   { name: 'Jira', icon: SiJira, color: '#0052CC' },
                   { name: 'Slack', icon: RiSlackFill, color: '#e01e5a' },
                   { name: 'Linear', icon: SiLinear, color: '#5E6AD2' },
                   { name: 'Notion', icon: SiNotion, color: '#000000' },
                   { name: 'Sentry', icon: SiSentry, color: '#362D59' },
                   { name: 'Vercel', icon: SiVercel, color: '#000000' },
                   { name: 'Datadog', icon: SiDatadog, color: '#632CA6' },
                   { name: 'PostHog', icon: RiPulseLine, color: '#000000' },
                   { name: 'Segment', icon: RiPieChartLine, color: '#52BD94' },
                   { name: 'Kang', icon: RiTerminalBoxLine, color: '#f97316' },
                 ].map((tool, i) => (
                   <div key={i} className="group border-2 border-black p-8 bg-white text-center hover:bg-black transition-all cursor-default shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                      <div className="flex flex-col items-center gap-4">
                         <tool.icon size={32} style={{ color: tool.color }} className="group-hover:text-white transition-colors" />
                         <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-white">{tool.name}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── 06. Join the Journey (Action Section) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-[#fcfcfc]">
           <div className="max-w-7xl mx-auto text-center">
              <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-8 block">Project v1.0</span>
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tight mb-12 leading-none">We are just <br /> <span className="text-[#f97316]">Day One</span></h2>
              <p className="text-2xl text-gray-400 max-w-3xl mx-auto font-medium uppercase tracking-normal leading-relaxed mb-16">
                 We're not building the "world's first" anything yet. We're building a partner that we want to use every day at CodeKang. If you want to help us shape it, we'd love to have you.
              </p>
              <Link
                href="/in/contact"
                className="inline-flex items-center gap-3 border-2 border-black bg-black px-12 py-6 text-[18px] font-black text-white transition-all shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)]"
              >
                JOIN THE WAITLIST <RiArrowRightLine size={24} />
              </Link>
           </div>
        </section>

        {/* ── 07. FAQ (Accordion) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-white">
           <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-20 text-center">Trust & <span className="text-[#f97316]">FAQ</span></h2>
              <div className="space-y-4">
                 {[
                    { q: "Is our code safe with Kang?", a: "Kang employs zero-trust principles. We do not use your proprietary code to train our base models. All data is encrypted and isolated within your dedicated instance." },
                    { q: "Why focus on 'Autonomous' instead of 'Copilot'?", a: "Copilots only solve for the typing bottleneck. Kang solves for the coordination bottleneck. True speed comes from an engine that can execute independently." },
                    { q: "How does Kang maintain quality?", a: "Every action Kang takes is verified through passing tests, successful linting, and security scans before it ever reaches a human reviewer." },
                    { q: "How does Kang understand architectural intent?", a: "Kang doesn't just read the current file. It indexes your entire repository, documentation, and PR history to understand the 'why' behind your code patterns." },
                    { q: "Can we deploy Kang on our own infrastructure?", a: "Yes. For Enterprise partners, we offer a containerized deployment that runs entirely within your VPC, ensuring no code ever leaves your network." },
                    { q: "Who owns the code Kang generates?", a: "You do. 100%. All code generated by Kang is considered a work-for-hire and the intellectual property remains entirely with your organization." },
                    { q: "How do we get started with the Alpha?", a: "We are currently onboarding partners in small cohorts to ensure high-quality support. You can join the waitlist, and our team will reach out for a technical deep dive." }
                  ].map((faq, i) => (
                    <FaqItem key={i} faq={faq} />
                  ))}
              </div>
           </div>
        </section>

        {/* ── 08. Final CTA ── */}
        <section className="py-40 px-10 text-center bg-[#fcfcfc]">
          <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tight leading-none mb-12">
            CodeKang <br /> <span className="text-[#f97316]">Is Live</span> <br /> Join us
          </h2>
          <Link
            href="/in/careers"
            className="inline-flex items-center gap-3 border-2 border-black bg-black px-16 py-8 text-[24px] font-black text-white transition-all shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            VIEW CAREERS <RiArrowRightLine size={32} />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
