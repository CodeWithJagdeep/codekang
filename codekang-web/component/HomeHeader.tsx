'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RiCloseLine, RiMenu4Line, RiArrowRightSLine, RiArrowDownSLine } from 'react-icons/ri';
import LogoBlackFont from '@/public/logo/logo_black_font.png';
import { motion } from 'framer-motion';

interface NavLink {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Agent', href: '/in/agent' },
  { label: 'Pricing', href: '/in/pricing' },
  { label: 'Features', href: '/in/features' },
  { label: 'Integrations', href: '/in/integrations' },
  { label: 'Blog', href: '/in/blog' },
];

export default function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="top-0 z-50 sticky font-[family-name:var(--font-space-grotesk)]">
      {/* ── Announcement bar ── */}
      <div className="flex items-center border-b-2 border-black/10 bg-white">

        <div className="flex-1 flex items-center px-8 py-4 overflow-hidden">
          <Link
            href="/in/agent"
            className="flex items-center gap-3 text-[13px] font-bold text-gray-600 hover:text-[#f97316] transition-colors whitespace-nowrap"
          >
            <span className="inline-flex items-center gap-1.5 border-2 border-black bg-black px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-tighter">
              NEW
            </span>
            CodeKang v1 Beta is now live: Start shipping faster &nbsp;→
          </Link>
        </div>
      </div>

      {/* ── Main Header ── */}
      <div className="w-full border-b-2 border-black/10 bg-white">
        <div className="flex items-stretch h-[64px]">
          {/* Logo */}
          <div className="flex items-center px-8 border-r-2 border-black/10 shrink-0">
            <Link href="/" onClick={closeMenu} className="flex items-center">
              <Image src={LogoBlackFont} alt="CodeKang" width={150} height={35} priority />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-stretch flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-1 px-6 text-[15px] font-bold text-gray-700 border-r-2 border-black/10 hover:bg-[#f97316] hover:text-white transition-all uppercase tracking-tight"
              >
                {link.label}
                {link.hasDropdown && <RiArrowDownSLine size={16} className="opacity-50" />}
              </Link>
            ))}
          </nav>

          {/* Login */}
          <div className="hidden md:flex items-center border-l-2 border-black/10">
            <Link href="/in/login" className="h-full">
              <motion.div
                whileHover="hover"
                initial="initial"
                className="relative flex items-center gap-2 px-8 h-full text-[15px] font-bold text-black transition-colors uppercase overflow-hidden group"
              >
                <motion.div
                  variants={{ initial: { x: '-100%' }, hover: { x: 0 } }}
                  transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
                  className="absolute inset-0 bg-[#f97316] z-0"
                />
                <span className="relative z-10 flex items-center gap-2 text-black group-hover:text-white transition-colors duration-200">
                  LOGIN
                  <motion.span variants={{ hover: { x: 5 } }} transition={{ type: 'spring', stiffness: 400 }}>
                    <RiArrowRightSLine size={18} />
                  </motion.span>
                </span>
              </motion.div>
            </Link>
          </div>

          {/* Start Trial */}
          <div className="hidden lg:flex items-center">
            <Link href="/in/signup" className="h-full">
              <motion.div
                whileHover="hover"
                initial="initial"
                className="relative flex items-center gap-2 px-8 h-full text-[13px] font-black text-white bg-[#f97316] transition-colors uppercase tracking-widest overflow-hidden group"
              >
                <motion.div
                  variants={{ initial: { x: '-100%' }, hover: { x: 0 } }}
                  transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
                  className="absolute inset-0 bg-white z-0"
                />
                <span className="relative z-10 flex items-center gap-2 text-white group-hover:text-black transition-colors duration-200">
                  START FREE TRIAL
                  <motion.span variants={{ hover: { x: 5 } }} transition={{ type: 'spring', stiffness: 400 }}>
                    <RiArrowRightSLine size={18} />
                  </motion.span>
                </span>
              </motion.div>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center w-16 border-l-2 border-black/10 text-black md:hidden"
          >
            {mobileOpen ? <RiCloseLine size={24} /> : <RiMenu4Line size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center justify-between px-6 py-4 text-[15px] font-medium text-gray-700 border-b border-gray-100"
              >
                {link.label}
                <RiArrowRightSLine size={18} />
              </Link>
            ))}
            <Link href="/in/signup" onClick={closeMenu} className="px-6 py-4 text-[#f97316] font-bold uppercase">
              Start Free Trial
            </Link>
            <Link href="/in/login" onClick={closeMenu} className="px-6 py-4 text-black font-medium border-t">
              Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
