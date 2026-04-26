'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { FaGithub, FaXTwitter } from 'react-icons/fa6';
import Footer from '@/component/Footer';
import MarketingHeader from '@/component/MarketingHeader';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white selection:bg-[#f8423b]/30">
      <MarketingHeader />

      {/* ── Content ── */}
      <section className="pt-20 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Side: Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-[#a1a1aa] bg-clip-text text-transparent">
                Get in touch.
              </h1>
              <p className="text-[16px] text-[#a1a1aa] leading-relaxed max-w-[480px]">
                Have questions about our AI code reviews or need help with your enterprise setup? Our team is here to help you ship better code.
              </p>
            </div>

            <div className="space-y-6">
              <ContactInfoItem
                icon={<Mail size={20} />}
                title="Email us"
                content="support@codekang.com"
                href="mailto:support@codekang.com"
              />
              <ContactInfoItem
                icon={<FaXTwitter size={20} />}
                title="Follow us"
                content="@codekang_ai"
                href="https://twitter.com/codekang_ai"
              />
              <ContactInfoItem
                icon={<FaGithub size={20} />}
                title="Open Source"
                content="github.com/codekang"
                href="https://github.com/codekang"
              />
            </div>

            <div className="pt-8 border-t border-white/5">
              <p className="text-[13px] font-semibold text-white mb-4 uppercase tracking-wider">Our Offices</p>
              <div className="flex items-start gap-3 text-[14px] text-[#71717a]">
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span>123 AI Boulevard, Suite 500<br />San Francisco, CA 94103</span>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#f8423b]/5 blur-3xl rounded-full pointer-events-none" />
            <div className="relative bg-[#111113] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
              {submitted ? (
                <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
                  <p className="text-[#a1a1aa] text-[14px] mb-8">
                    Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-[14px] font-semibold text-[#f8423b] hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">Name</label>
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-white/10 text-white text-[14px] focus:border-[#f8423b]/50 focus:ring-1 focus:ring-[#f8423b]/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">Email</label>
                      <input
                        required
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-white/10 text-white text-[14px] focus:border-[#f8423b]/50 focus:ring-1 focus:ring-[#f8423b]/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">Subject</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-white/10 text-white text-[14px] focus:border-[#f8423b]/50 focus:ring-1 focus:ring-[#f8423b]/50 outline-none transition-all appearance-none"
                    >
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Billing Question</option>
                      <option>Enterprise Quote</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-[#a1a1aa] ml-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl bg-[#1c1c1c] border border-white/10 text-white text-[14px] focus:border-[#f8423b]/50 focus:ring-1 focus:ring-[#f8423b]/50 outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#f8423b] text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#f8423b]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

function ContactInfoItem({ icon, title, content, href }: { icon: React.ReactNode; title: string; content: string; href: string }) {
  return (
    <Link
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      className="flex items-center gap-4 group p-1"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#71717a] group-hover:bg-[#f8423b]/10 group-hover:text-[#f8423b] transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[12px] font-medium text-[#52525b] uppercase tracking-wider">{title}</p>
        <p className="text-[15px] font-medium text-white group-hover:text-[#f8423b] transition-colors">{content}</p>
      </div>
    </Link>
  );
}
