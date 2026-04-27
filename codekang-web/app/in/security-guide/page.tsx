'use client';

import { motion } from 'framer-motion';
import { 
  RiShieldCheckLine, 
  RiLock2Line, 
  RiCodeSSlashLine, 
  RiArrowRightLine,
  RiFileShield2Line,
  RiKey2Line,
  RiDoorLockLine
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';

export default function SecurityGuidePage() {
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
              Best Practices
            </span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight leading-none mb-10">
              Security <br />
              <span className="text-[#f97316]">Playbook</span>
            </h1>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto mb-12 font-medium uppercase tracking-normal leading-relaxed">
              How to harden your engineering organization at CodeKang using Kang's autonomous security layers.
            </p>
          </motion.div>
        </section>

        {/* ── 01. Security Pillars ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10 bg-white">
           <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
              
              {[
                {
                  title: "Secret Management",
                  desc: "Configure Kang to detect and block 500+ types of secrets before they ever touch your git history.",
                  help: "Prevents accidental data breaches in real-time.",
                  icon: RiKey2Line
                },
                {
                  title: "Dependency Hardening",
                  desc: "Learn how to enable auto-patching for critical CVEs in your node_modules and python packages.",
                  help: "Reduces your attack surface by 80%.",
                  icon: RiFileShield2Line
                },
                {
                  title: "Access Control",
                  desc: "Implement the principle of least privilege for Kang's tool access in your production environments.",
                  help: "Ensures total control over autonomous actions.",
                  icon: RiDoorLockLine
                },
                {
                  title: "Audit Logging",
                  desc: "Every thought and action taken by Kang is logged and exportable for SOC2/ISO27001 audits.",
                  help: "Makes compliance a background process.",
                  icon: RiShieldCheckLine
                }
              ].map((guide, i) => (
                <div key={i} className="group border-2 border-black p-12 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] transition-all">
                   <guide.icon size={48} className="text-[#f97316] mb-8" />
                   <h3 className="text-3xl font-black uppercase mb-6 tracking-tight leading-none">{guide.title}</h3>
                   <p className="text-xl text-gray-500 font-medium uppercase tracking-normal leading-relaxed mb-8">
                      {guide.desc}
                   </p>
                   <div className="p-4 bg-black text-white">
                      <p className="text-[11px] font-black uppercase tracking-widest text-[#f97316]">VALUE: {guide.help}</p>
                   </div>
                </div>
              ))}

           </div>
        </section>

        {/* ── 02. Architecture (Technical Deep Dive) ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-[#fcfcfc]">
           <div className="max-w-7xl mx-auto">
              <div className="mb-24 text-center">
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Our Architecture</span>
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none">Built for <br /> <span className="text-[#f97316]">Zero Trust</span></h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 {[
                   { t: "Isolated Compute", d: "Every Kang review task runs in a fresh, isolated ephemeral container. No state is shared between reviews, and all compute environments are destroyed immediately upon completion." },
                   { t: "End-to-End Encryption", d: "All data in transit is protected via TLS 1.3. At rest, sensitive review metadata and configuration are encrypted using AES-256 with keys managed in specialized hardware security modules (HSMs)." },
                   { t: "Granular Permissions", d: "Kang operates on a 'Need-to-Know' basis. You specify exactly which repositories, branches, and files the agent can access, with the ability to revoke access instantly." }
                 ].map((item, i) => (
                   <div key={i} className="p-10 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <h4 className="text-2xl font-black uppercase mb-6 tracking-tight leading-none">{item.t}</h4>
                      <p className="text-[14px] text-gray-500 font-bold uppercase tracking-normal leading-relaxed">{item.d}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── 03. Compliance & Data Handling ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-white">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <div>
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Compliance</span>
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-12">Enterprise <br /> <span className="text-[#f97316]">Standards</span></h2>
                 <p className="text-2xl text-gray-400 font-medium uppercase tracking-normal leading-relaxed mb-12">
                    We maintain rigorous compliance standards to ensure your data is handled with the highest level of care.
                 </p>
                 <div className="grid grid-cols-2 gap-6">
                    {['SOC 2 TYPE II', 'GDPR READY', 'HIPAA READY', 'ISO 27001'].map((c, i) => (
                      <div key={i} className="border-2 border-black p-4 text-center font-black uppercase text-[12px] tracking-[0.2em]">
                         {c}
                      </div>
                    ))}
                 </div>
              </div>
              <div className="border-4 border-black p-12 bg-black text-white shadow-[16px_16px_0px_0px_rgba(249,115,22,1)]">
                 <h3 className="text-3xl font-black uppercase mb-8 text-[#f97316]">Data Handling Policy</h3>
                 <ul className="space-y-6">
                    {[
                      "We never train our models on your private source code.",
                      "Code is pulled only for the duration of the review and purged immediately.",
                      "All review activity is cryptographically signed and stored in immutable logs.",
                      "Data residency options available for EU, US, and APAC regions."
                    ].map((li, i) => (
                      <li key={i} className="flex gap-4 text-sm font-bold uppercase tracking-normal leading-relaxed">
                         <RiShieldCheckLine className="text-[#f97316] shrink-0" size={20} />
                         {li}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>
        </section>

        {/* ── 04. Security FAQ ── */}
        <section className="px-10 md:px-14 py-40 border-b-2 border-black/10 bg-[#fcfcfc]">
           <div className="max-w-4xl mx-auto">
              <div className="mb-24 text-center">
                 <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none">Security FAQ</h2>
              </div>
              <div className="space-y-12">
                 {[
                   { q: "Does Kang store my source code?", a: "No. Kang clones the repository into an ephemeral container for the duration of the review task. Once the task is complete, the container and all associated data are purged." },
                   { q: "How are my integration keys stored?", a: "Integration keys (e.g., GitHub App tokens) are stored in a dedicated, hardware-encrypted vault. They are never logged and are only accessible by the isolated review engine during active tasks." },
                   { q: "How do you prevent unauthorized actions?", a: "All autonomous actions require a 'Policy Definition' that you control. You can set Kang to 'Suggest Only' mode, requiring human approval for every PR opened." }
                 ].map((faq, i) => (
                   <div key={i} className="border-b-2 border-black pb-8">
                      <h4 className="text-2xl font-black uppercase mb-4 tracking-tight leading-tight">{faq.q}</h4>
                      <p className="text-lg text-gray-500 font-medium uppercase tracking-normal leading-relaxed">{faq.a}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-40 px-10 text-center bg-white">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tight leading-none mb-12">
            Secure your <br /> <span className="text-[#f97316]">future</span>
          </h2>
          <Link
            href="/docs"
            className="inline-flex items-center gap-3 border-2 border-black bg-black px-16 py-8 text-[24px] font-black text-white transition-all shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            VIEW FULL DOCS <RiArrowRightLine size={32} />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
