'use client';

import { motion } from 'framer-motion';
import { 
  RiShieldFlashLine, 
  RiLockPasswordLine, 
  RiShieldCheckLine, 
  RiArrowRightLine,
  RiBugLine,
  RiFileList3Line,
  RiAlarmWarningLine,
  RiBankCardLine,
  RiShieldStarLine,
  RiServerLine,
  RiLockUnlockLine,
  RiEyeOffLine,
  RiCheckboxCircleLine
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
        <section className="pt-32 pb-24 px-10 text-center relative border-b-2 border-black/10 bg-white">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 py-1 border-2 border-black bg-black text-white text-[12px] font-black uppercase tracking-[0.2em] mb-8">
              Trust & Engineering Excellence
            </span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              Fortified <br />
              <span className="text-[#f97316]">Intelligence</span>
            </h1>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto mb-12 font-medium uppercase tracking-tighter">
              At CodeKang, security isn't a feature—it's the foundation of every line of code we scan, analyze, and generate.
            </p>
          </motion.div>
        </section>

        {/* ── Core Capabilities ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10 bg-[#fcfcfc]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                icon: RiLockPasswordLine,
                title: "Secret Detection",
                desc: "Prevents AWS keys, Stripe tokens, and DB credentials from ever leaving a developer's machine.",
                help: "Blocks 99% of accidental leaks."
              },
              {
                icon: RiShieldCheckLine,
                title: "SOC2 Type II",
                desc: "Our platform is built to the highest industry standards, with regular audits and compliance checks.",
                help: "Enterprise-ready assurance."
              },
              {
                icon: RiBugLine,
                title: "Auto-Patching",
                desc: "We don't just find vulnerabilities; we generate the PRs to fix them before they hit production.",
                help: "10x faster remediation."
              }
            ].map((item, i) => (
              <div key={i} className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] transition-all">
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

        {/* ── Payment & Transaction Security ── */}
        <section className="py-32 px-10 border-b-2 border-black/10 bg-white">
          <div className="max-w-7xl mx-auto">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                   <span className="text-[#f97316] font-black uppercase tracking-[0.3em] mb-6 block">Transactions</span>
                   <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-10">
                      Payment <br /> <span className="text-[#f97316]">Integrity</span>
                   </h2>
                   <p className="text-xl text-gray-500 font-medium uppercase tracking-tight mb-12">
                      Your financial data is never stored on our servers. We partner with world-class payment processors to ensure every transaction is secure, encrypted, and compliant.
                   </p>
                   <div className="space-y-6">
                      {[
                        { t: "PCI-DSS Level 1 Compliance", d: "We use Stripe for all payment processing, ensuring the highest level of security standards in the industry." },
                        { t: "End-to-End Encryption", d: "All payment data is encrypted from the moment it's entered until it reaches our secure processor." },
                        { t: "Fraud Prevention", d: "Real-time monitoring and 3D Secure verification to protect against unauthorized transactions." }
                      ].map((p, i) => (
                        <div key={i} className="flex gap-4 items-start">
                           <RiCheckboxCircleLine size={24} className="text-[#f97316] shrink-0" />
                           <div>
                              <h4 className="font-black uppercase text-sm">{p.t}</h4>
                              <p className="text-gray-400 text-xs font-bold uppercase tracking-tight">{p.d}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="relative">
                   <div className="border-4 border-black p-12 bg-black text-white shadow-[20px_20px_0px_0px_rgba(249,115,22,1)]">
                      <RiBankCardLine size={80} className="text-[#f97316] mb-8" />
                      <h3 className="text-3xl font-black uppercase mb-6">Zero-Storage <br /> Policy</h3>
                      <p className="text-white/60 font-medium uppercase tracking-tight leading-relaxed">
                        We do not store your credit card numbers, CVVs, or billing addresses. Everything is tokenized and handled by PCI-compliant partners.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* ── Infrastructure & Privacy ── */}
        <section className="py-32 px-10 border-b-2 border-black/10 bg-[#fcfcfc]">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24">
                 <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8">Infrastructure <br /> <span className="text-[#f97316]">Hardened</span></h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                   { icon: RiServerLine, title: "Cloud Security", desc: "Hosted on AWS/GCP with isolated VPCs and strict firewall rules." },
                   { icon: RiLockUnlockLine, title: "Data at Rest", desc: "All user data and codebases are encrypted using AES-256 at rest." },
                   { icon: RiShieldStarLine, title: "Audit Logs", desc: "Every action in the system is logged and immutable for audit purposes." },
                   { icon: RiEyeOffLine, title: "Privacy First", desc: "We never use your proprietary code to train our base models." }
                 ].map((box, i) => (
                   <div key={i} className="border-2 border-black p-10 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <box.icon size={32} className="text-[#f97316] mb-6" />
                      <h4 className="text-lg font-black uppercase mb-4">{box.title}</h4>
                      <p className="text-gray-400 text-[12px] font-black uppercase tracking-tight leading-tight">{box.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── Real-world Impact ── */}
        <section className="py-32 px-10 border-b-2 border-black/10 bg-white">
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
