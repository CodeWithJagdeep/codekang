'use client';

import { motion } from 'framer-motion';
import { 
  RiDoubleQuotesL, 
  RiTeamLine, 
  RiFlashlightLine, 
  RiArrowRightLine,
  RiStarFill,
  RiBuildingLine,
  RiGlobalLine
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';

export default function CustomersPage() {
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
              Success Stories
            </span>
            <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tight leading-none mb-10">
              Trusted by <br />
              <span className="text-[#f97316]">Early Adopters</span>
            </h1>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto mb-12 font-medium uppercase tracking-normal leading-relaxed">
              From fast-moving startups to forward-thinking teams, Kang is the engineering partner helping build the future of software at CodeKang.
            </p>
          </motion.div>
        </section>

        {/* ── Featured Testimonial ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <div className="relative">
                <RiDoubleQuotesL className="absolute -top-10 -left-10 text-gray-100" size={160} />
                <div className="relative z-10">
                   <p className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-12">
                      "Kang reduced our average PR review cycle from 6 hours to under 15 minutes. It’s like having an extra senior engineer on every team."
                   </p>
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 border-2 border-black bg-gray-100 flex items-center justify-center">
                         <RiBuildingLine size={32} />
                      </div>
                      <div>
                         <span className="block text-xl font-black uppercase">Sarah Chen</span>
                         <span className="block text-[13px] font-bold text-[#f97316] uppercase tracking-widest">VP Engineering, FintechFlow</span>
                      </div>
                   </div>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-8">
                {[
                  { l: 'Time Saved', v: '2,400 hrs' },
                  { l: 'Bugs Patched', v: '12,000+' },
                  { l: 'Team Scale', v: '80 devs' },
                  { l: 'ROI', v: '4.5x' }
                ].map((s, i) => (
                  <div key={i} className="p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-[#fcfcfc]">
                     <span className="block text-4xl font-black mb-2">{s.v}</span>
                     <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">{s.l}</span>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* ── Case Studies (How it helps) ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10">
           <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-20 text-center">Real impact across industries</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 {[
                   {
                     title: "Early-Stage Startups",
                     desc: "Ship features faster by letting Kang handle documentation and unit tests while the founders focus on core logic.",
                     help: "Reduced time-to-market by 3 weeks."
                   },
                   {
                     title: "Enterprise Fintech",
                     desc: "Automate security compliance and secret scanning across 1,000+ repositories with centralized reporting.",
                     help: "Zero leaked secrets in 12 months."
                   },
                   {
                     title: "Open Source Projects",
                     desc: "Manage high-volume community contributions with autonomous CI verification and architectural reviews.",
                     help: "90% reduction in maintainer burnout."
                   }
                 ].map((item, i) => (
                   <div key={i} className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                      <h3 className="text-2xl font-black uppercase mb-4">{item.title}</h3>
                      <p className="text-gray-500 font-medium leading-tight mb-8 uppercase tracking-tight">{item.desc}</p>
                      <div className="flex items-center gap-3">
                         <RiFlashlightLine className="text-[#f97316]" />
                         <span className="text-[13px] font-black uppercase text-[#f97316]">{item.help}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-40 px-10 text-center bg-[#fcfcfc]">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-12">
            Join the <br /> <span className="text-[#f97316]">elite teams</span> <br /> building with AI
          </h2>
          <Link
            href="/in/login"
            className="inline-flex items-center gap-3 border-2 border-black bg-black px-16 py-8 text-[24px] font-black text-white transition-all shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            START YOUR STORY <RiArrowRightLine size={32} />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
