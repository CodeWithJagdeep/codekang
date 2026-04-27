'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiMailLine,
  RiMessage3Line,
  RiEarthLine,
  RiSendPlane2Line,
  RiCheckLine,
  RiErrorWarningLine,
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import { API_URL } from '@/lib/auth';

type Status = 'idle' | 'loading' | 'success' | 'error';

const INQUIRY_TYPES = ['Sales & Enterprise', 'Technical Support', 'Partnerships', 'Other'];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', inquiryType: INQUIRY_TYPES[0], message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setErrorMsg(data.message ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Could not reach the server. Check your connection.');
    }
  }

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
              Get in Touch
            </span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              Talk to a <br />
              <span className="text-[#f97316]">human</span>
            </h1>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto mb-12 font-medium uppercase tracking-tighter">
              Whether you're looking for an enterprise demo or technical support, the team behind Kang is here to help.
            </p>
          </motion.div>
        </section>

        {/* ── Contact Form & Details ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">

            {/* Form */}
            <div className="border-2 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
              <h3 className="text-3xl font-black uppercase mb-10">Send a message</h3>

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 gap-6 text-center"
                >
                  <div className="w-20 h-20 border-4 border-[#f97316] flex items-center justify-center">
                    <RiCheckLine size={48} className="text-[#f97316]" />
                  </div>
                  <h4 className="text-2xl font-black uppercase">Message Received</h4>
                  <p className="text-gray-500 font-bold uppercase tracking-tight max-w-xs">
                    Our team will get back to you within 2 hours.
                  </p>
                  <button
                    onClick={() => { setStatus('idle'); setForm({ name: '', email: '', company: '', inquiryType: INQUIRY_TYPES[0], message: '' }); }}
                    className="text-[12px] font-black uppercase underline hover:text-[#f97316] transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={set('name')}
                        className="border-2 border-black px-4 py-3 text-[14px] font-bold uppercase outline-none focus:border-[#f97316] transition-colors"
                        placeholder="JANE DOE"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Work Email *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={set('email')}
                        className="border-2 border-black px-4 py-3 text-[14px] font-bold uppercase outline-none focus:border-[#f97316] transition-colors"
                        placeholder="JANE@COMPANY.COM"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Company</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={set('company')}
                      className="border-2 border-black px-4 py-3 text-[14px] font-bold uppercase outline-none focus:border-[#f97316] transition-colors"
                      placeholder="ACME CORP"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Inquiry Type *</label>
                    <select
                      required
                      value={form.inquiryType}
                      onChange={set('inquiryType')}
                      className="border-2 border-black px-4 py-3 text-[14px] font-bold uppercase outline-none focus:border-[#f97316] transition-colors appearance-none bg-white"
                    >
                      {INQUIRY_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={set('message')}
                      className="border-2 border-black px-4 py-3 text-[14px] font-bold uppercase outline-none focus:border-[#f97316] transition-colors resize-none"
                      placeholder="HOW CAN WE HELP YOU?"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 border-2 border-red-400 px-4 py-3 text-[13px] font-bold text-red-500 uppercase tracking-tight">
                      <RiErrorWarningLine size={18} className="shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full flex items-center justify-center gap-3 border-2 border-black bg-black text-white py-5 text-[15px] font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE'} <RiSendPlane2Line size={20} />
                  </button>
                </form>
              )}
            </div>

            {/* Info Cards */}
            <div className="space-y-12">
              <div>
                <h3 className="text-3xl font-black uppercase mb-10">Connect directly</h3>
                <div className="space-y-8">
                  {[
                    { icon: RiMailLine, title: "Email us", v: "CODE.KANG@ZOHOMAIL.COM", desc: "Response time: < 2 hours" },
                    { icon: RiMessage3Line, title: "Live Chat", v: "DASHBOARD WIDGET", desc: "Available 24/7 for Enterprise" },
                    { icon: RiEarthLine, title: "Remote First", v: "GLOBAL TEAM", desc: "Working across 12 timezones" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start group">
                      <div className="w-14 h-14 border-2 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-[#f97316] group-hover:text-white group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <item.icon size={24} />
                      </div>
                      <div>
                        <span className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.title}</span>
                        <span className="block text-xl font-black uppercase leading-none mb-1">{item.v}</span>
                        <span className="block text-[13px] font-bold text-[#f97316] uppercase tracking-tight">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-10 border-2 border-black bg-[#f97316]/5">
                <h4 className="text-lg font-black uppercase mb-4">Enterprise Inquiries</h4>
                <p className="text-gray-500 font-medium uppercase tracking-tight leading-tight mb-6">
                  Need a custom demo, security questionnaire, or SOC2 Type II report? Our enterprise team is ready to assist.
                </p>
                <button className="text-[13px] font-black uppercase underline hover:text-[#f97316] transition-colors">
                  Book a meeting
                </button>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
