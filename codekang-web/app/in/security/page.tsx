'use client';

import { motion } from 'framer-motion';
import { 
  RiShieldFlashLine, 
  RiLockPasswordLine, 
  RiShieldCheckLine, 
  RiArrowRightLine,
  RiBugLine,
  RiFileList3Line,
  RiAlarmWarningLine
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';

export default function SecurityPage() {
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
              Zero Trust Engineering
            </span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              Ship code, <br />
              <span className="text-[#f97316]">not vulnerabilities</span>
            </h1>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto mb-12 font-medium uppercase tracking-tighter">
              Kang scans every line of code for secrets, SQLi, and architectural flaws before they ever reach production.
            </p>
          </motion.div>
        </section>

        {/* ── The Value (How it helps) ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                icon: RiLockPasswordLine,
                title: "Secret Detection",
                desc: "Prevents AWS keys, Stripe tokens, and DB credentials from ever leaving a developer's machine.",
                help: "Reduces the risk of data breaches by 99%."
              },
              {
                icon: RiShieldCheckLine,
                title: "SOC2 Compliance",
                desc: "Automatically documents your security controls and ensures every PR meets regulatory standards.",
                help: "Saves your CTO 20+ hours per month on audit prep."
              },
              {
                icon: RiBugLine,
                title: "Vulnerability Patching",
                desc: "Not only finds CVEs but generates an auto-fix PR to resolve the dependency issue instantly.",
                help: "Reduces mean-time-to-remediation (MTTR) by 10x."
              }
            ].map((item, i) => (
              <div key={i} className="p-10 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] transition-all">
                <item.icon size={40} className="text-[#f97316] mb-8" />
                <h3 className="text-2xl font-black uppercase mb-4">{item.title}</h3>
                <p className="text-gray-500 font-medium leading-tight mb-8 uppercase tracking-tight">{item.desc}</p>
                <div className="p-4 bg-[#f97316]/5 border-l-4 border-[#f97316]">
                  <p className="text-[12px] font-black uppercase text-[#f97316]">{item.help}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Real-world Impact ── */}
        <section className="py-32 px-10 border-b-2 border-black/10">
          <div className="max-w-5xl mx-auto border-2 border-black bg-black text-white p-16 shadow-[16px_16px_0px_0px_rgba(249,115,22,1)]">
             <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8">Stop the leak <br /> <span className="text-[#f97316]">before</span> it happens</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
                <div>
                   <h4 className="text-[#f97316] font-black uppercase mb-4">Without Kang</h4>
                   <p className="text-white/60 font-medium uppercase tracking-tight leading-tight">Developer pushes an API key in a test file. The leak is discovered 3 days later by an external audit. Cost: Millions in reputation and rotated keys.</p>
                </div>
                <div>
                   <h4 className="text-emerald-500 font-black uppercase mb-4">With Kang</h4>
                   <p className="text-white/60 font-medium uppercase tracking-tight leading-tight">Kang blocks the commit in 2 seconds. Developer is notified instantly to use an environment variable. Cost: Zero.</p>
                </div>
             </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-40 px-10 text-center bg-[#fcfcfc]">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-12">
            Harden your <br /> <span className="text-[#f97316]">codebase</span> <br /> today
          </h2>
          <Link
            href="/in/login"
            className="inline-flex items-center gap-3 border-2 border-black bg-black px-16 py-8 text-[24px] font-black text-white transition-all shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            ACTIVATE SCANNING <RiArrowRightLine size={32} />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
