'use client';

import {
  LifeBuoy,
  MessageSquare,
  BookOpen,
  Mail,
  ChevronRight,
  ExternalLink,
  X,
  Send,
  Check,
} from 'lucide-react';
import { SiGithub, SiX } from 'react-icons/si';
import { useState } from 'react';

export default function SupportPage() {
  const [activeForm, setActiveForm] = useState<'chat' | 'email' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setActiveForm(null);
    }, 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-[#e8e8e8]">Support</h1>
        <p className="text-[14px] text-[#71717a] mt-1">
          Get help from our team of engineers and AI specialists.
        </p>
      </div>

      {/* ── Contact Support ── */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveForm('chat')}
            className={`flex items-start gap-4 p-5 rounded-xl border transition-all text-left group ${
              activeForm === 'chat'
                ? 'bg-[#252529] border-[#3b82f6]'
                : 'border-[#2a2a2a] bg-[#1c1c1c] hover:bg-[#252529] hover:border-[#3f3f46]'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-500">
              <MessageSquare size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[14px] font-semibold text-[#f4f4f5]">
                  Live Chat
                </span>
                <ChevronRight
                  size={14}
                  className="text-[#3f3f46] group-hover:text-[#71717a]"
                />
              </div>
              <p className="text-[12px] text-[#71717a] leading-relaxed">
                Chat in real-time. Average response:{' '}
                <span className="text-emerald-500/80">5 mins</span>
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveForm('email')}
            className={`flex items-start gap-4 p-5 rounded-xl border transition-all text-left group ${
              activeForm === 'email'
                ? 'bg-[#252529] border-[#3b82f6]'
                : 'border-[#2a2a2a] bg-[#1c1c1c] hover:bg-[#252529] hover:border-[#3f3f46]'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
              <Mail size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[14px] font-semibold text-[#f4f4f5]">
                  Email Support
                </span>
                <ChevronRight
                  size={14}
                  className="text-[#3f3f46] group-hover:text-[#71717a]"
                />
              </div>
              <p className="text-[12px] text-[#71717a] leading-relaxed">
                Send a detailed message. Response within{' '}
                <span className="text-blue-500/80">24 hours</span>.
              </p>
            </div>
          </button>
        </div>

        {/* Dynamic Form Area */}
        {activeForm && (
          <div className="mt-4 p-6 rounded-2xl bg-[#1c1c1c] border border-[#3b82f6]/30 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[15px] font-bold text-[#f4f4f5]">
                {activeForm === 'chat'
                  ? 'Start a Live Conversation'
                  : 'Create Support Ticket'}
              </h3>
              <button
                onClick={() => setActiveForm(null)}
                className="text-[#71717a] hover:text-[#e8e8e8]"
              >
                <X size={16} />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-emerald-500/20">
                  <Check size={20} />
                </div>
                <p className="text-[14px] font-semibold text-[#e8e8e8]">
                  Message sent successfully!
                </p>
                <p className="text-[12px] text-[#71717a] mt-1">
                  We&apos;ll get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-[#71717a]">
                    Subject
                  </label>
                  <input
                    autoFocus
                    placeholder="Briefly describe your issue"
                    className="w-full bg-[#18181b] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#3b82f6] transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-[#71717a]">
                    Message
                  </label>
                  <textarea
                    placeholder="Explain what you need help with..."
                    className="w-full bg-[#18181b] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#3b82f6] transition-colors h-32 resize-none"
                    required
                  />
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] transition-all text-[13px] font-bold text-white">
                  <Send size={14} />
                  Send Message
                </button>
              </form>
            )}
          </div>
        )}
      </section>

      {/* ── Resources ── */}
      <section>
        <h2 className="text-[14px] font-bold text-[#e8e8e8] mb-4">Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              label: 'Documentation',
              icon: BookOpen,
              description: 'Learn integration best practices.',
              color: 'text-blue-400',
            },
            {
              label: 'API Reference',
              icon: ExternalLink,
              description: 'Technical docs for developers.',
              color: 'text-purple-400',
            },
            {
              label: 'Community',
              icon: LifeBuoy,
              description: 'Connect with other builders.',
              color: 'text-amber-400',
            },
          ].map((item, i) => (
            <a
              key={i}
              href="#"
              className="flex flex-col p-5 rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] hover:bg-[#252529] transition-all group"
            >
              <item.icon size={20} className={`${item.color} mb-3`} />
              <div className="text-[13px] text-[#e8e8e8] font-bold mb-1">
                {item.label}
              </div>
              <div className="text-[11.5px] text-[#6d6d6d] leading-relaxed">
                {item.description}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Community ── */}
      <section>
        <h2 className="text-[14px] font-bold text-[#e8e8e8] mb-4">Connect</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="#"
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#18181b] border border-[#2a2a2a] text-[13px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-all"
          >
            <SiGithub size={16} />
            GitHub
          </a>
          <a
            href="#"
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#18181b] border border-[#2a2a2a] text-[13px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#27272a] transition-all"
          >
            <SiX size={16} />
            Twitter
          </a>
        </div>
      </section>

      {/* ── Version Info ── */}
      <footer className="pt-12 border-t border-[#2a2a2a]/40 text-center">
        <p className="text-[11px] text-[#3f3f46] uppercase tracking-widest font-bold mb-2">
          CodeKang Platform
        </p>
        <p className="text-[12px] text-[#52525b]">
          v2.4.0-stable • Running on K-01 Agent
        </p>
      </footer>
    </div>
  );
}
