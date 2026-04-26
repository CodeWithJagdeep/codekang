'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { RiCloseLine, RiMenu4Line } from 'react-icons/ri';
import LogoWhiteFont from '@/public/logo/logo_white_font.png';
import WhiteLogo from '@/public/logo/white_logo.png';

const NAV_LINKS = [
  { label: 'Pricing', href: '/in/pricing' },
  { label: 'FAQ', href: '/in/faq' },
  { label: 'Contact', href: '/in/contact' },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MarketingHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#09090b]/82 shadow-[0_22px_80px_-36px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/"
                className="flex min-w-0 items-center"
                onClick={closeMenu}
                aria-label="CodeKang home"
              >
                <Image
                  src={LogoWhiteFont}
                  alt="CodeKang"
                  width={240}
                  className="h-auto w-[170px] sm:w-[210px]"
                  priority={false}
                />
              </Link>

              <div className="hidden xl:flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                <Image
                  src={WhiteLogo}
                  alt=""
                  width={18}
                  height={18}
                  className="h-4 w-4 object-contain opacity-90"
                />
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#a1a1aa]">
                  AI Review Platform
                </span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.025] p-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-4 py-2 text-[14px] font-medium transition-all ${
                      active
                        ? 'bg-white text-[#09090b]'
                        : 'text-[#a1a1aa] hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/in/login"
                className="rounded-full px-4 py-2 text-[14px] font-medium text-[#c7c7cf] transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/in/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#f8423b] px-5 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[#fb923c]"
              >
                Start free
              </Link>
            </div>

            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#e4e4e7] transition-colors hover:bg-white/[0.08] md:hidden"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileOpen((value) => !value)}
            >
              {mobileOpen ? <RiCloseLine size={20} /> : <RiMenu4Line size={20} />}
            </button>
          </div>

          {mobileOpen && (
            <div className="border-t border-white/8 px-4 pb-4 pt-3 md:hidden">
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => {
                  const active = isActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className={`rounded-2xl px-4 py-3 text-[14px] font-medium transition-all ${
                        active
                          ? 'bg-white text-[#09090b]'
                          : 'bg-white/[0.03] text-[#c7c7cf] hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/in/login"
                  onClick={closeMenu}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-center text-[14px] font-medium text-[#d4d4d8] transition-colors hover:border-white/20 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/in/login"
                  onClick={closeMenu}
                  className="rounded-2xl bg-[#f8423b] px-4 py-3 text-center text-[14px] font-semibold text-white transition-colors hover:bg-[#fb923c]"
                >
                  Start free
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
