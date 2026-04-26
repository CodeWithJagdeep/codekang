'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RiCloseLine, RiMenu4Line, RiArrowRightSLine, RiSparklingLine } from 'react-icons/ri';
import LogoWhiteFont from '@/public/logo/logo_white_font.png';

const NAV_LINKS = [
  { label: 'Agent', href: '/in/agent' },
  { label: 'Enterprise', href: '/in/enterprise' },
  { label: 'Customers', href: '/in/customers' },
  { label: 'Pricing', href: '/in/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Resources', href: '#resources' },
] as const;

export default function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled
            ? 'border-b border-white/10'
            : 'border-b border-transparent'
          }`}
        style={{
          background: scrolled
            ? '#1c1c1c'
            : '#1c1c1c',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* ── Ambient top glow ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.4) 30%, rgba(249,115,22,0.55) 50%, rgba(249,115,22,0.4) 70%, transparent 100%)',
          }}
        />

        <div className="flex w-full items-center justify-between gap-6 px-6 md:px-10 lg:px-16 py-3.5">
          {/* ── Logo ── */}
          <Link
            href="/"
            onClick={closeMenu}
            aria-label="CodeKang home"
            className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-85"
          >
            <Image
              src={LogoWhiteFont}
              alt="CodeKang"
              width={220}
              className="h-auto w-[130px] sm:w-[155px]"
              priority
            />
            {/* AI badge */}
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#f8423b]/25 bg-[#f8423b]/8 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-[#f8423b]/80 uppercase">
              <RiSparklingLine size={10} />
              AI
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center">
            <div
              className="flex items-center gap-0.5 rounded-full p-1"
              style={{
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative rounded-full px-4 py-1.5 text-[14px] font-medium text-[#888888] transition-all duration-200 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* ── Desktop CTAs ── */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/in/login"
              className="text-[14px] font-medium text-white transition-all hover:text-[#ff5c00]"
            >
              Log In
            </Link>

            <div
              className="h-4 w-px"
              style={{ background: 'rgba(255,255,255,0.2)', width: '1px', height: '14px' }}
              aria-hidden
            />

            <Link
              href="/in/contact"
              className="group relative flex items-center gap-1.5 overflow-hidden rounded-[8px] border border-[#ff5c00] px-5 py-2 text-[14px] font-semibold text-white transition-all duration-300 hover:bg-[#ff5c00]/10"
            >
              <span className="relative z-10">Get a free trial</span>
            </Link>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors md:hidden"
            style={{
              background: mobileOpen
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#ffffff',
            }}
          >
            {mobileOpen ? <RiCloseLine size={18} /> : <RiMenu4Line size={18} />}
          </button>
        </div>

        {/* ── Mobile menu (inline, no full-screen takeover) ── */}
        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          style={{ borderTop: mobileOpen ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
        >
          <div className="flex flex-col gap-1 px-4 pb-4 pt-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium text-[#888888] transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                {link.label}
                <RiArrowRightSLine size={18} className="opacity-40" />
              </Link>
            ))}

            <div
              className="my-2 h-px"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            />

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/in/login"
                onClick={closeMenu}
                className="flex h-11 items-center justify-center rounded-xl border border-white/10 text-[14px] font-medium text-[#888888] transition-colors hover:border-white/20 hover:text-white"
              >
                Log In
              </Link>
              <Link
                href="/in/contact"
                onClick={closeMenu}
                className="flex h-11 items-center justify-center rounded-xl text-[14px] font-bold text-white transition-opacity hover:opacity-90"
                style={{
                  background: 'transparent',
                  border: '1px solid #ff5c00',
                }}
              >
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer so page content isn't hidden under fixed header */}
      <div className="h-[57px]" aria-hidden />
    </>
  );
}
