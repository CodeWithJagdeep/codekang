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
  RiTimeLine,
  RiServerLine,
  RiShieldKeyholeLine
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';

export default function SecurityPolicyPage() {
  const lastUpdated = "April 27, 2026";

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main>
        {/* ── Hero ── */}
        <section className="pt-32 pb-20 px-10 text-center relative border-b-2 border-black/10 bg-white">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 py-1 border-2 border-black bg-black text-white text-[12px] font-black uppercase tracking-[0.2em] mb-8">
              Trust & Compliance
            </span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              Security <br />
              <span className="text-[#f97316]">Policy</span>
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-500 font-bold uppercase tracking-widest text-[12px]">
              <RiTimeLine className="text-[#f97316]" />
              Last Updated: {lastUpdated}
            </div>
          </motion.div>
        </section>

        {/* ── Content ── */}
        <section className="px-6 md:px-10 py-24 bg-[#fcfcfc]">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-12">
              
              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm">01</span>
                  Infrastructure Security
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <p>
                    CodeKang is hosted on highly secure, enterprise-grade cloud infrastructure. We utilize multi-region redundancy and automated failover systems to ensure maximum availability.
                  </p>
                  <p>
                    All servers are hardened according to CIS benchmarks and are regularly patched against known vulnerabilities.
                  </p>
                </div>
              </div>

              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-[#f97316] text-white flex items-center justify-center text-sm">02</span>
                  Data Encryption
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <p>
                    Data is encrypted at rest using AES-256 and in transit using TLS 1.3. We manage our own encryption keys through a secure, hardware-backed Key Management Service (KMS).
                  </p>
                  <p>
                    Sensitive data, such as API keys and database credentials, are never stored in plain text and are isolated in a dedicated vault.
                  </p>
                </div>
              </div>

              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm">03</span>
                  Access Control
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <p>
                    We implement the principle of least privilege (PoLP) across our entire organization. Employee access to production systems is strictly controlled, logged, and requires multi-factor authentication (MFA).
                  </p>
                  <p>
                    Regular access reviews are conducted to ensure that only necessary personnel have access to sensitive systems.
                  </p>
                </div>
              </div>

              <div className="p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-[#f97316] text-white flex items-center justify-center text-sm">04</span>
                  Incident Response
                </h2>
                <div className="space-y-4 text-gray-600 font-medium leading-relaxed uppercase tracking-tight">
                  <p>
                    We have a dedicated security team that monitors our systems 24/7 for potential threats. In the event of a security incident, we follow a rigorous incident response plan.
                  </p>
                  <p>
                    We commit to notifying affected users of any significant data breach within 72 hours of discovery.
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-20 p-12 border-4 border-black bg-black text-white text-center">
              <RiShieldKeyholeLine size={48} className="mx-auto mb-6 text-[#f97316]" />
              <h3 className="text-2xl font-black uppercase mb-4">SOC2 Type II Certified</h3>
              <p className="text-white/60 mb-8 uppercase tracking-widest text-sm">We undergo regular third-party audits to verify our security controls.</p>
              <Link
                href="/in/security-guide"
                className="inline-flex items-center gap-2 border-2 border-[#f97316] text-[#f97316] px-8 py-3 font-black uppercase tracking-widest hover:bg-[#f97316] hover:text-white transition-all"
              >
                Download Security Whitepaper <RiArrowRightLine />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
