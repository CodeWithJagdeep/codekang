'use client';

import { useState } from 'react';
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { RiDiscordFill, RiTwitterXFill, RiLinkedinBoxFill, RiGithubFill, RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';
import LogoBlackFont from '@/public/logo/logo_black_font.png';
import { API_URL } from '@/lib/auth';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'footer' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message ?? 'You\'re in.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect. Try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 border-2 border-[#22c55e] bg-[#22c55e]/5 px-4 py-3 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.3)]">
        <RiCheckLine size={18} className="text-[#22c55e] shrink-0" />
        <span className="text-[12px] font-black uppercase tracking-widest text-[#22c55e]">{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-2 bg-white group focus-within:shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] focus-within:border-[#f97316] transition-all">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="YOU@COMPANY.COM"
          className="bg-transparent px-4 py-3 text-[12px] font-black uppercase outline-none flex-1 text-black placeholder:text-gray-300"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-black text-white px-6 text-[12px] font-black uppercase tracking-widest hover:bg-[#f97316] transition-colors disabled:opacity-60"
        >
          {status === 'loading' ? '...' : 'JOIN'}
        </button>
      </div>
      {status === 'error' && (
        <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 uppercase tracking-wide">
          <RiErrorWarningLine size={13} />
          {message}
        </div>
      )}
    </form>
  );
}

function Footer() {
  return (
    <footer className="relative bg-[#fcfcfc] w-full border-t-2 border-black/10 pt-24 pb-0 overflow-hidden font-[family-name:var(--font-space-grotesk)]">
      <div className="w-full px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr_1fr_1fr_1.2fr] gap-16 text-sm text-black">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-2.5">
              <Image
                src={LogoBlackFont}
                alt="logo"
                width={160}
                height={40}
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <p className="text-[15px] text-gray-500 font-medium leading-tight max-w-xs uppercase tracking-tight">
              Empowering engineers with autonomous code intelligence. Build secure, high-quality software at scale.
            </p>
            <div className="flex items-center gap-1.5 text-black font-black uppercase tracking-widest text-[11px] cursor-pointer hover:text-[#f97316] transition-colors">
              <span>English (US)</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <FooterColumn
            title="Products"
            links={[
              { label: "Agent", href: "/in/agent" },
              { label: "Security Scan", href: "/in/security" },
              { label: "Team Insights", href: "/in/insights" },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: "About Us", href: "/in/about" },
              { label: "Pricing", href: "/in/pricing" },
              { label: "Customers", href: "/in/customers" },
              { label: "Careers", href: "/in/careers" },
              { label: "Contact", href: "/in/contact" },
            ]}
          />
          <FooterColumn
            title="Resources"
            links={[
              { label: "Blog", href: "/in/blog" },
              { label: "Community", href: "/in/community" },
              { label: "Security Guide", href: "/in/security-guide" },
              { label: "Changelog", href: "/in/changelog" },
              { label: "Brand Kit", href: "/in/brand-kit" },
            ]}
          />

          <div>
            <h4 className="text-black mb-6 text-[12px] font-black uppercase tracking-[0.25em]">
              Stay Connected
            </h4>
            <p className="text-[14px] text-gray-500 font-medium leading-tight mb-6 uppercase tracking-tight">
              Get the latest on AI security and autonomous development.
            </p>
            <NewsletterForm />

            <div className="flex gap-2 mt-8">
              {[
                { Icon: RiDiscordFill, label: 'Discord' },
                { Icon: RiTwitterXFill, label: 'X' },
                { Icon: RiLinkedinBoxFill, label: 'LinkedIn' },
                { Icon: RiGithubFill, label: 'GitHub' }
              ].map((social) => (
                <button
                  key={social.label}
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:border-[#f97316] hover:text-[#f97316] transition-all"
                >
                  <social.Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Massive Background Text */}
        <div className="relative text-center mt-32 overflow-hidden pointer-events-none select-none leading-none opacity-[0.08]">
          <span
            className="font-black italic uppercase"
            style={{
              fontSize: "clamp(100px, 24vw, 320px)",
              color: "transparent",
              WebkitTextStroke: "2px black",
              display: "block",
              lineHeight: 0.75,
              paddingBottom: "0.05em",
              letterSpacing: "-0.04em",
            }}
          >
            CodeKang
          </span>
        </div>

        {/* Legal Bar */}
        <div className="relative z-10 py-10 flex flex-col md:flex-row items-center justify-between border-t-2 border-black/10 gap-6 mt-10">
          <div className="flex gap-10 text-[11px] font-black uppercase tracking-widest text-gray-400">
            <Link href="#" className="hover:text-black transition-colors">Terms</Link>
            <Link href="#" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-black transition-colors">Security</Link>
          </div>
          <span className="text-[11px] text-gray-300 font-black uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} CodeKang Inc.
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-black mb-6 text-[12px] font-black uppercase tracking-[0.25em]">
        {title}
      </h4>
      <ul className="space-y-4">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-gray-400 hover:text-[#f97316] font-bold uppercase tracking-tight text-[13px] transition-colors duration-200"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Footer;
