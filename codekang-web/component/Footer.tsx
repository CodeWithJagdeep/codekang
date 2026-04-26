'use client';

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import LogoWhiteFont from '@/public/logo/logo_white_font.png';

function Footer() {
  return (
    <footer className="relative mt-20 bg-[#1c1c1c] w-full border-t border-white/5 pt-20 pb-0 overflow-hidden">
      <div className="w-full px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_1fr_1fr_1.2fr] gap-12 text-sm text-[#4a4a52]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2.5">
              <Image
                src={LogoWhiteFont}
                alt="logo"
                width={140}
                height={35}
              />
            </div>
            <p className="text-[13px] text-[#8a8a90] leading-relaxed max-w-xs">
              Empowering developers with AI-driven code intelligence. Trusted by forward-thinking teams to build secure, high-quality software at scale.
            </p>
            <div className="flex items-center gap-1.5 text-[#5a5a62] hover:text-[#8a8a90] transition cursor-pointer text-[13px]">
              <span>English (US)</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <FooterColumn
            title="Products"
            links={[
              { label: "AI Code Review", href: "#" },
              { label: "Vulnerability Scanning", href: "#" },
              { label: "PR Automation", href: "#" },
              { label: "Architecture Insights", href: "#" },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: "About Us", href: "#" },
              { label: "Enterprise", href: "#" },
              { label: "Customers", href: "/in/customers" },
              { label: "Careers", href: "#" },
              { label: "Contact", href: "/in/contact" },
            ]}
          />
          <FooterColumn
            title="Resources"
            links={[
              { label: "Documentation", href: "#" },
              { label: "API Reference", href: "#" },
              { label: "Security Guide", href: "#" },
              { label: "Changelog", href: "#" },
              { label: "Community", href: "#" },
            ]}
          />

          <div>
            <h4 className="text-[#f4f4f5] mb-5 text-[12px] font-bold uppercase tracking-[0.15em]">
              Stay Updated
            </h4>
            <p className="text-[13px] text-[#8a8a90] leading-relaxed mb-5">
              Get the latest on AI security and development tips — delivered weekly.
            </p>
            <div className="flex border border-white/10 rounded-xl overflow-hidden mb-4 focus-within:border-[#f8423b]/50 transition-all bg-white/5">
              <input
                placeholder="you@company.com"
                className="bg-transparent px-4 py-3 text-[13px] outline-none flex-1 text-[#ffffff] placeholder:text-[#3a3a3e]"
              />
              <button className="bg-[#f8423b] hover:bg-[#e63939] transition-colors text-white px-5 text-[13px] font-bold">
                Join
              </button>
            </div>
            <p className="text-[11px] text-[#3a3a3e] leading-relaxed">
              By subscribing, you agree to our{" "}
              <span className="text-[#f8423b]/80 hover:text-[#f8423b] underline cursor-pointer transition-colors">
                Terms
              </span>{" "}
              and{" "}
              <span className="text-[#f8423b]/80 hover:text-[#f8423b] underline cursor-pointer transition-colors">
                Privacy Policy
              </span>
            </p>

            <div className="flex gap-3 mt-6">
              {["Discord", "X", "LinkedIn", "GitHub"].map((label) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-md border border-white/5 text-[#5a5a62] hover:text-[#f4f4f5] hover:border-white/10 hover:bg-white/5 transition-all duration-200 text-[11px] font-bold"
                >
                  {label[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative text-center mt-20 overflow-hidden pointer-events-none select-none leading-none">
          <span
            className="font-black"
            style={{
              fontSize: "clamp(100px, 22vw, 260px)",
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(248, 66, 59, 0.45)",
              display: "block",
              lineHeight: 0.8,
              paddingBottom: "0.05em",
              letterSpacing: "-0.02em",
            }}
          >
            CodeKang
          </span>
        </div>

        <div className="relative z-10 py-8 flex flex-col md:flex-row items-center justify-between border-t border-white/5 gap-4">
          <div className="flex gap-8 text-[12px] text-[#5a5a62]">
            <Link href="#" className="hover:text-[#f4f4f5] cursor-pointer transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-[#f4f4f5] cursor-pointer transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-[#f4f4f5] cursor-pointer transition-colors">
              Security
            </Link>
          </div>
          <span className="text-[12px] text-[#3a3a3e] font-medium">
            © {new Date().getFullYear()} CodeKang Inc. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-[#f4f4f5] mb-5 text-[12px] font-bold uppercase tracking-[0.15em]">
        {title}
      </h4>
      <ul className="space-y-3.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-[#8a8a90] hover:text-[#f4f4f5] cursor-pointer transition-colors duration-200 text-[13px] font-medium"
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
