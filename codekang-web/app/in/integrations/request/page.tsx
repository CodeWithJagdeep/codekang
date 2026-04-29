'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  RiArrowRightLine,
  RiArrowLeftLine,
  RiZapFill,
  RiSparklesFill,
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';

export default function RequestIntegrationPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    toolName: '',
    category: 'Source Control',
    priority: 'Medium',
    useCase: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main className="w-full pt-32 pb-24 px-10 flex flex-col items-center">
        <div className="w-full max-w-xl">
          <Link
            href="/in/integrations"
            className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none mb-12 text-sm"
          >
            <RiArrowLeftLine size={18} /> Back to Integrations
          </Link>

          {submitted ? (
            <div className="border-2 border-black bg-white p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="w-16 h-16 border-2 border-black bg-[#f97316] text-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mx-auto mb-8 animate-bounce">
                <RiSparklesFill size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">
                Request Received!
              </h2>
              <p className="text-gray-500 font-medium text-lg leading-relaxed mb-8 max-w-xs mx-auto">
                Thanks for helping us improve. We will review your request for <span className="text-black font-black uppercase">{formData.toolName}</span>.
              </p>
              <Link
                href="/in/integrations"
                className="inline-flex items-center gap-2 border-2 border-black bg-black text-white px-8 py-4 text-[16px] font-black uppercase transition-all shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
              >
                CONTINUE EXPLORING <RiArrowRightLine size={20} />
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-12">
                <div className="w-16 h-16 border-2 border-black bg-[#f97316] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
                  <RiZapFill size={32} />
                </div>
                <div>
                  <span className="text-[#f97316] text-[12px] font-black uppercase tracking-[0.3em]">Expand Ecosystem</span>
                  <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                    Request Tool
                  </h1>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="border-2 border-black bg-white p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-8">
                <div>
                  <label htmlFor="toolName" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Tool Name
                  </label>
                  <input
                    type="text"
                    id="toolName"
                    required
                    value={formData.toolName}
                    onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
                    placeholder="e.g. Sentry, Datadog, Linear"
                    className="w-full px-5 py-4 border-2 border-black text-[16px] font-bold text-black placeholder-gray-300 focus:outline-none focus:border-[#f97316] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-black text-[16px] font-bold text-black focus:outline-none focus:border-[#f97316] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] appearance-none bg-white"
                    >
                      <option value="Source Control">Source Control</option>
                      <option value="Communication">Communication</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Observation">Observation</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none">
                      <RiArrowRightLine className="transform rotate-90" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['Low', 'Medium', 'High'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: p })}
                        className={`py-3 border-2 font-black uppercase tracking-wider text-sm transition-all ${formData.priority === p
                            ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]'
                            : 'bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="useCase" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    How will your team use this?
                  </label>
                  <textarea
                    id="useCase"
                    rows={4}
                    required
                    value={formData.useCase}
                    onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                    placeholder="Describe the exact workflow you need…"
                    className="w-full px-5 py-4 border-2 border-black text-[16px] font-bold text-black placeholder-gray-300 focus:outline-none focus:border-[#f97316] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#f97316] text-white py-5 text-[18px] font-black uppercase tracking-wider transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {submitting ? 'Submitting…' : (
                    <>
                      Submit Request <RiArrowRightLine size={24} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
