'use client';

import { motion } from 'framer-motion';
import { 
  RiTeamLine, 
  RiRocket2Line, 
  RiHeartPulseLine, 
  RiArrowRightLine,
  RiGlobalLine,
  RiCodeSSlashLine,
  RiMacbookLine,
  RiShieldFlashLine,
  RiFlashlightLine,
  RiFocus2Line,
  RiCupLine,
  RiMentalHealthLine,
  RiPulseLine,
  RiLightbulbLine,
  RiDoubleQuotesL,
  RiSeedlingLine,
  RiToolsLine,
  RiStackLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main>
        {/* ── 01. Hero (Standardized 7xl) ── */}
        <section className="pt-40 pb-32 px-10 text-center relative border-b-2 border-black/10 bg-white overflow-hidden">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 border-2 border-black bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] mb-12">
              Recruitment v1.0 / Project CodeKang
            </span>
            <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tight leading-none mb-12">
              Help us Build <br />
              <span className="text-[#f97316]">The Engineering Future</span>
            </h1>
            <p className="text-[20px] md:text-[24px] text-gray-400 max-w-4xl mx-auto mb-16 font-medium uppercase tracking-normal leading-relaxed">
              We are at the very beginning of a decade-long mission at CodeKang. We're looking for obsessive builders who want to help Kang evolve into the world's most capable engineering partner.
            </p>
            <div className="flex justify-center gap-6">
               <Link href="#roles" className="border-2 border-black bg-black text-white px-10 py-5 text-[14px] font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                  View Open Roles
               </Link>
            </div>
          </motion.div>
        </section>

        {/* ── 02. Why Join Us? (Professional Bento) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-[#fcfcfc]">
           <div className="max-w-7xl mx-auto">
              <div className="mb-24">
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Section 01 / The Hook</span>
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-6">Why Join Us?</h2>
                 <p className="text-xl text-gray-400 font-medium uppercase tracking-normal leading-relaxed max-w-2xl">We're building more than a product at CodeKang; we're building a new way of working — one that prioritizes code over meetings.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                   { icon: RiGlobalLine, t: "Async First", d: "We don't do status meetings. We communicate through documentation, code reviews, and Kang's thread history.", h: "100% Remote & Async" },
                   { icon: RiFlashlightLine, t: "High Velocity", d: "We ship improvements to Kang every single day. Your work starts helping engineers within hours of merging.", h: "Daily Deployments" },
                   { icon: RiShieldFlashLine, t: "Pure Engineering", d: "Zero management fluff. Every person on the team is a builder, from the founders to the latest hire.", h: "Flat Organization" },
                   { icon: RiFocus2Line, t: "Deep Focus", d: "We protect your flow. Kang handles the noise, manual chores, and chores so you can handle the architecture.", h: "Flow-State Optimized" }
                 ].map((item, i) => (
                   <div key={i} className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] transition-all group">
                      <div className="w-16 h-16 border-2 border-black flex items-center justify-center mb-8 group-hover:bg-[#f97316] group-hover:text-white transition-all">
                        <item.icon size={32} />
                      </div>
                      <h3 className="text-2xl font-black uppercase mb-4">{item.t}</h3>
                      <p className="text-gray-500 font-medium uppercase tracking-normal leading-relaxed mb-8">{item.d}</p>
                      <div className="pt-6 border-t border-black/5">
                         <span className="text-[11px] font-black uppercase text-[#f97316] tracking-widest">{item.h}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── 03. The Mission (Humble Deep Dive) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-white">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <div className="order-2 lg:order-1">
                 <div className="border-4 border-black p-12 bg-[#f97316]/5 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                    <RiCodeSSlashLine size={60} className="text-[#f97316] mb-8" />
                    <h3 className="text-3xl font-black uppercase mb-6">Building the Partner</h3>
                    <p className="text-xl text-gray-500 font-medium uppercase tracking-tight leading-tight mb-8">
                       Most AI tools today are just sophisticated autocompletes. We're building Kang to be a teammate — one that can understand architectural intent, verify its own work, and secure systems autonomously.
                    </p>
                    <div className="flex gap-4">
                       <div className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase">Phase 01: Assistance</div>
                       <div className="px-3 py-1 border-2 border-black text-[10px] font-black uppercase">Phase 02: Partnership</div>
                    </div>
                 </div>
              </div>
              <div className="order-1 lg:order-2">
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Section 02 / The Mission</span>
                 <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tight mb-12 leading-none">We're just <br /> <span className="text-[#f97316]">Getting Started</span></h2>
                 <p className="text-2xl text-gray-500 font-medium uppercase tracking-normal leading-relaxed mb-12">
                    Joined at the ground floor at CodeKang. You won't just be maintaining systems; you'll be defining the rules of AI-human collaboration for the next decade.
                 </p>
              </div>
           </div>
        </section>

        {/* ── 04. Remote DNA (The Culture) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-[#fcfcfc]">
           <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                 <div>
                    <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Section 03 / Culture</span>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-12">Small Team <br /> <span className="text-[#f97316]">Big Impact</span></h2>
                    <p className="text-2xl text-gray-500 font-medium uppercase tracking-normal leading-relaxed mb-12">
                       We are a lean, focused group of builders. We don't believe in massive hierarchies or bloated teams. We believe in 3 obsessive engineers doing the work of 30.
                    </p>
                    <div className="space-y-6">
                       {[
                         { t: "Radical Focus", d: "With a small team, there's nowhere to hide. Every line of code you write has a massive impact on Kang's evolution." },
                         { t: "Deep Work Blocks", d: "We encourage 4-hour uninterrupted blocks. Kang handles the routine so you can stay in flow." },
                         { t: "Direct Collaboration", d: "No middle managers. You work directly with the founders to define the future of autonomous engineering." }
                       ].map((item, i) => (
                         <div key={i} className="flex gap-4">
                            <RiCheckboxCircleLine className="text-[#f97316] shrink-0 mt-1" size={20} />
                            <div>
                               <h4 className="text-lg font-black uppercase tracking-tight leading-none mb-2">{item.t}</h4>
                               <p className="text-sm text-gray-400 font-bold uppercase tracking-normal leading-relaxed">{item.d}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="relative">
                    <div className="border-4 border-black p-10 bg-white shadow-[16px_16px_0px_0px_rgba(249,115,22,1)]">
                       <h3 className="text-3xl font-black uppercase mb-8">Current Team</h3>
                       <div className="space-y-4">
                          {[
                            { role: "Core Engine", count: "1 Builder" },
                            { role: "Product & UX", count: "1 Builder" },
                            { role: "Infrastructure", count: "1 Builder" }
                          ].map((loc, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-black/5 pb-2">
                               <span className="text-[12px] font-black uppercase tracking-widest">{loc.role}</span>
                               <span className="text-[10px] font-black text-[#f97316] uppercase">{loc.count}</span>
                            </div>
                          ))}
                       </div>
                       <p className="mt-10 text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] text-center italic">
                          "3 builders. 1 mission. Total focus."
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ── 05. The Stack (Technical Deep Dive) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-white">
           <div className="max-w-7xl mx-auto">
              <div className="mb-24">
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Section 04 / Infrastructure</span>
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-6">Built for <br /> <span className="text-[#f97316]">Performance</span></h2>
                 <p className="text-xl text-gray-400 font-medium uppercase tracking-normal leading-relaxed max-w-2xl">We don't just use AI; we build the infrastructure that makes it reliable at scale.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 {[
                   { icon: RiStackLine, t: "Inference Kernels", d: "Low-latency C++ and Rust kernels for real-time code reasoning and architectural analysis." },
                   { icon: RiToolsLine, t: "Verification Engine", d: "Formal verification and symbolic execution layers that ensure Kang's suggestions are sound." },
                   { icon: RiPulseLine, t: "Distributed Indexing", d: "Massive-scale vector stores and graph databases representing trillions of lines of code." }
                 ].map((item, i) => (
                   <div key={i} className="p-10 border-2 border-black bg-[#fcfcfc] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <item.icon size={40} className="text-[#f97316] mb-6" />
                      <h4 className="text-2xl font-black uppercase mb-4 tracking-tight leading-none">{item.t}</h4>
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-normal leading-relaxed">{item.d}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── 06. Engineering Manifesto (The Hook) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-black text-white">
           <div className="max-w-7xl mx-auto">
              <div className="mb-24 text-center">
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-6">The Engineering <br /> <span className="text-[#f97316]">Manifesto</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                 {[
                   { t: "Deep Focus > Meetings", d: "We protect developer flow. If it can be a PR comment or a documentation update, it shouldn't be a meeting.", icon: RiFocus2Line },
                   { t: "Ownership > Permission", d: "We hire builders, not order-takers. You own your features from architectural design to production monitoring.", icon: RiShieldFlashLine },
                   { t: "Shipping > Perfection", d: "We find perfection in iteration. We ship fast, gather feedback from Kang and users, and improve constantly.", icon: RiFlashlightLine },
                   { t: "Truth > Ego", d: "We are radicals about transparency. We debate ideas, not hierarchies. The best solution always wins.", icon: RiSeedlingLine }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-10 items-start group">
                      <div className="w-20 h-20 border-2 border-white/20 flex items-center justify-center shrink-0 group-hover:bg-[#f97316] group-hover:border-[#f97316] transition-all">
                         <item.icon size={40} className="text-white" />
                      </div>
                      <div>
                         <h3 className="text-3xl font-black uppercase mb-4 tracking-tight leading-none">{item.t}</h3>
                         <p className="text-lg text-white/40 font-medium uppercase tracking-normal leading-relaxed">{item.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── 07. Recruitment Process (The Timeline) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-white">
           <div className="max-w-7xl mx-auto">
              <div className="mb-24">
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Section 05 / Process</span>
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-6">How we hire</h2>
                 <p className="text-xl text-gray-400 font-medium uppercase tracking-normal leading-relaxed">Our process is designed to be fast, fair, and focused on your craft.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 {[
                   { step: "01", t: "Deep Dive", d: "A 45-minute conversation with a founder about your journey, your obsessions, and why you build." },
                   { step: "02", t: "Take-Home Task", d: "A real-world engineering problem designed to take 4-6 hours. No LeetCode, just architecture and code." },
                   { step: "03", t: "Pairing Session", d: "Review your task with the team. We care more about how you think than the final syntax." },
                   { step: "04", t: "The Offer", d: "We move fast. Expect a decision and a competitive offer within 48 hours of your final round." }
                 ].map((s, i) => (
                   <div key={i} className="relative p-10 border-2 border-black bg-white group hover:bg-black hover:text-white transition-all">
                      <span className="absolute -top-6 left-6 px-4 py-2 bg-[#f97316] text-white text-[12px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{s.step}</span>
                      <h4 className="text-2xl font-black uppercase mb-4 mt-4 tracking-tight leading-none">{s.t}</h4>
                      <p className="text-[14px] text-gray-500 font-bold uppercase tracking-normal leading-relaxed group-hover:text-white/60">{s.d}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── 08. Perks (Professional Details) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-[#fcfcfc]">
           <div className="max-w-7xl mx-auto">
              <div className="mb-24">
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Section 06 / Support</span>
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-6">Built to <br /> Support You</h2>
                 <p className="text-xl text-gray-400 font-medium uppercase tracking-normal leading-relaxed">Everything you need to do your best work from anywhere in the world.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-black divide-y-4 md:divide-y-0 md:divide-x-4 divide-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] bg-white">
                 <div className="p-12">
                    <RiCupLine size={40} className="text-[#f97316] mb-8" />
                    <h4 className="text-2xl font-black uppercase mb-4 tracking-tight leading-none">Remote Setup</h4>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-normal leading-relaxed">Work from anywhere. We provide a $4,000 initial home-office stipend and $1,000 annually for refreshes.</p>
                 </div>
                 <div className="p-12 bg-[#f97316]/5">
                    <RiPulseLine size={40} className="text-[#f97316] mb-8" />
                    <h4 className="text-2xl font-black uppercase mb-4 tracking-tight leading-none">Health & Flow</h4>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-normal leading-relaxed">Premium health, dental, and vision insurance globally. Unlimited PTO with a 3-week mandatory minimum.</p>
                 </div>
                 <div className="p-12">
                    <RiLightbulbLine size={40} className="text-[#f97316] mb-8" />
                    <h4 className="text-2xl font-black uppercase mb-4 tracking-tight leading-none">Growth Budget</h4>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-normal leading-relaxed">$5,000 annual budget for books, conferences, or specialized courses to keep your edge sharp.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* ── 09. Open Roles ── */}
        <section id="roles" className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-white">
           <div className="max-w-5xl mx-auto">
              <div className="mb-20 text-center">
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-4 block">Section 07 / Opportunity</span>
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none">Join the <br /> Foundation</h2>
                 <p className="text-xl text-gray-400 font-medium uppercase tracking-widest mt-6">We are hiring for our core engineering team.</p>
              </div>
              
              <div className="space-y-6">
                 {[
                   { title: "Senior AI Engineer", loc: "Remote", team: "Core Intelligence", slug: "senior-ai-engineer", impact: "Build the kernels of Kang's reasoning." },
                   { title: "Product Designer", loc: "Remote", team: "UX & Brand", slug: "product-designer", impact: "Define the visual language of AI collaboration." },
                   { title: "Backend Systems Architect", loc: "Remote", team: "Infrastructure", slug: "backend-systems-architect", impact: "Scale the engine to millions of repositories." },
                   { title: "Security Researcher", loc: "Remote", team: "Security", slug: "security-researcher", impact: "Make Kang the world's safest engineer." }
                 ].map((role, i) => (
                   <Link 
                     key={i} 
                     href={`/in/careers/${role.slug}`}
                     className="group border-2 border-black p-10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer"
                   >
                      <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-3xl font-black uppercase tracking-tight leading-none">{role.title}</h4>
                         </div>
                         <p className="text-[13px] font-bold text-gray-400 uppercase tracking-normal leading-relaxed mb-4">{role.impact}</p>
                         <div className="flex gap-6 text-[12px] font-black uppercase tracking-widest text-gray-400">
                            <span className="flex items-center gap-2"><RiGlobalLine /> {role.loc}</span>
                            <span className="flex items-center gap-2 text-[#f97316]"><RiTeamLine /> {role.team}</span>
                         </div>
                      </div>
                      <div className="w-16 h-16 border-2 border-black flex items-center justify-center group-hover:bg-[#f97316] group-hover:text-white transition-all">
                         <RiArrowRightLine size={32} />
                      </div>
                   </Link>
                 ))}
              </div>
           </div>
        </section>

        {/* ── 07. Final CTA ── */}
        <section className="py-40 px-10 text-center bg-[#fcfcfc]">
          <h2 className="text-6xl md:text-[10rem] font-black uppercase tracking-tight leading-none mb-12">
            Don't just <br /> <span className="text-[#f97316]">Build tools</span> <br /> Build a partner
          </h2>
          <Link
            href="#roles"
            className="inline-flex items-center gap-3 border-2 border-black bg-black px-16 py-8 text-[24px] font-black text-white transition-all shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            JOIN THE MISSION <RiArrowRightLine size={32} />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
