'use client';

import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { RiArrowRightLine, RiDoubleQuotesL } from 'react-icons/ri';

const CUSTOMERS = [
  {
    name: 'TechFlow',
    logo: 'https://lovable.dev/img/logo/lovable-light-png.png', // Placeholder
    story: 'How TechFlow reduced their PR review cycle by 45% using CodeKang AI.',
    category: 'SaaS',
  },
  {
    name: 'QuantumScale',
    logo: 'https://lovable.dev/img/logo/lovable-light-png.png',
    story: 'QuantumScale scales their engineering team 2x faster with autonomous code audits.',
    category: 'Fintech',
  },
  {
    name: 'DevSync',
    logo: 'https://lovable.dev/img/logo/lovable-light-png.png',
    story: 'Automating security compliance at DevSync with CodeKang PR monitoring.',
    category: 'Security',
  }
];

const TESTIMONIALS = [
  {
    quote: "CodeKang has completely transformed how our senior engineers spend their time. We've gone from constant manual reviews to strategic architecture discussions.",
    author: "Sarah Chen",
    role: "VP of Engineering at TechFlow"
  },
  {
    quote: "The accuracy of the AI reviews is staggering. It catches edge cases that even our best developers sometimes miss in a hurry.",
    author: "Marcus Thorne",
    role: "CTO at QuantumScale"
  }
];

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white selection:bg-[#f8423b]/30">
      <HomeHeader />

      <main className="pt-32 pb-20 px-6 md:px-10 lg:px-16">
        {/* ── Hero Section ── */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-6xl font-bold mb-8 leading-tight">
            Trusted by the world's most <br className="hidden md:block" />
            <span className="text-[#f8423b]">innovative</span> engineering teams
          </h1>
          <p className="text-lg md:text-xl text-[#888888] leading-relaxed max-w-2xl mx-auto">
            From fast-growing startups to enterprise leaders, thousands of developers rely on CodeKang to ship better code, faster.
          </p>
        </div>

        {/* ── Logo Cloud ── */}
        <div className="mb-32 border-y border-white/5 py-16">
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="h-8 w-32 bg-white/10 rounded flex items-center justify-center font-bold italic">Logo 1</div>
             <div className="h-8 w-32 bg-white/10 rounded flex items-center justify-center font-bold italic">Logo 2</div>
             <div className="h-8 w-32 bg-white/10 rounded flex items-center justify-center font-bold italic">Logo 3</div>
             <div className="h-8 w-32 bg-white/10 rounded flex items-center justify-center font-bold italic">Logo 4</div>
             <div className="h-8 w-32 bg-white/10 rounded flex items-center justify-center font-bold italic">Logo 5</div>
          </div>
        </div>

        {/* ── Featured Stories ── */}
        <div className="max-w-7xl mx-auto mb-32">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold mb-12">Featured Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CUSTOMERS.map((customer) => (
              <div key={customer.name} className="group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300">
                <div className="text-[10px] uppercase tracking-widest text-[#f8423b] font-bold mb-4">{customer.category}</div>
                <h3 className="text-xl font-bold mb-4 leading-snug group-hover:text-[#f8423b] transition-colors">{customer.story}</h3>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#888888] mt-8 group-hover:text-white transition-colors">
                  Read Case Study <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quote Section ── */}
        <div className="max-w-7xl mx-auto mb-32 grid grid-cols-1 md:grid-cols-2 gap-12">
           {TESTIMONIALS.map((t, i) => (
             <div key={i} className="relative p-10 rounded-3xl bg-[#151517] border border-white/5">
                <RiDoubleQuotesL className="text-4xl text-[#f8423b] mb-6 opacity-50" />
                <p className="text-xl md:text-2xl leading-relaxed mb-8 italic">
                  "{t.quote}"
                </p>
                <div>
                   <div className="font-bold text-white">{t.author}</div>
                   <div className="text-sm text-[#888888]">{t.role}</div>
                </div>
             </div>
           ))}
        </div>

        {/* ── Call to Action ── */}
        <div className="max-w-5xl mx-auto rounded-[40px] bg-gradient-to-br from-[#f8423b] to-[#e63939] p-12 md:p-20 text-center shadow-2xl shadow-[#f8423b]/20">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to empower your team?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Join the elite engineering teams who are already building the future with CodeKang.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/in/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#f8423b] font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/in/contact"
              className="w-full sm:w-auto px-8 py-4 bg-black/20 text-white font-bold rounded-xl border border-white/10 hover:bg-black/30 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
