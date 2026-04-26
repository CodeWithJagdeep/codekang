'use client';

import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { RiArrowRightUpLine, RiPlayFill } from 'react-icons/ri';

const CASE_STUDIES = [
  {
    title: "10x",
    subtitle: "faster reviews.",
    description: "TechFlow automated their security checks and reduced PR cycle time by 90%.",
    color: "bg-[#f8423b]",
    textColor: "text-white",
    size: "col-span-12 md:col-span-8 lg:col-span-7",
  },
  {
    title: "Build",
    subtitle: "Together.",
    description: "QuantumScale scales their engineering team 2x faster with autonomous code audits.",
    color: "bg-white/5",
    textColor: "text-[#888888]",
    size: "col-span-12 md:col-span-4 lg:col-span-5",
  },
  {
    title: "Design",
    subtitle: "Freely.",
    description: "Automating security compliance at DevSync with CodeKang PR monitoring.",
    color: "bg-[#1c1c1c] border border-white/10",
    textColor: "text-[#f4f4f5]",
    size: "col-span-12 md:col-span-5 lg:col-span-5",
  },
  {
    title: "Ship",
    subtitle: "Anything.",
    description: "From legacy monoliths to modern microservices, CodeKang handles it all.",
    color: "bg-white/[0.03]",
    textColor: "text-[#888888]",
    size: "col-span-12 md:col-span-7 lg:col-span-7",
  }
];

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white selection:bg-[#f8423b]/30 font-[family-name:var(--font-geist-sans)]">
      <HomeHeader />

      <main className="pt-32 pb-20">
        {/* ── Hero Section (Replit Style) ── */}
        <section className="px-6 md:px-10 lg:px-16 mb-24">
          <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto items-end">
            <div className="col-span-12 lg:col-span-8">
              <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-8">
                TRUSTED BY <br />
                <span className="text-[#f8423b]">THE BEST</span> TEAMS.
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 pb-4">
              <p className="text-lg md:text-xl text-[#888888] leading-relaxed max-w-sm">
                Engineering leaders at fast-growing startups and enterprises use CodeKang to build secure, high-quality software.
              </p>
            </div>
          </div>
        </section>

        {/* ── High-End Grid (Inspired by Replit/Agent 4) ── */}
        <section className="px-6 md:px-10 lg:px-16 mb-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-4">
              
              {/* Feature Card: Large Animated Style */}
              <div className="col-span-12 lg:col-span-7 h-[400px] md:h-[500px] rounded-[40px] md:rounded-[60px] bg-[#f8423b] p-8 md:p-12 flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10">
                  <span className="text-white/70 text-sm font-bold tracking-widest uppercase mb-4 block">Case Study</span>
                  <h2 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                    10x <br />
                    <span className="text-black/20">FASTER BUILDS.</span>
                  </h2>
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <p className="text-white/90 text-lg md:text-xl max-w-xs font-medium">
                    How TechFlow reduced their PR cycle by 90% using AI.
                  </p>
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#f8423b] group-hover:scale-110 transition-transform">
                    <RiArrowRightUpLine size={32} />
                  </div>
                </div>
                {/* Decorative SVG Pattern */}
                <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
                  <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
                    <circle cx="200" cy="200" r="200" fill="white" />
                  </svg>
                </div>
              </div>

              {/* Video Card: Build Together */}
              <div className="col-span-12 lg:col-span-5 h-[400px] md:h-[500px] rounded-[40px] md:rounded-[60px] bg-white/5 border border-white/5 p-8 flex flex-col justify-end relative overflow-hidden group">
                 <div className="absolute inset-0 grayscale opacity-40 group-hover:opacity-60 transition-opacity">
                    <Image 
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                      alt="Team collaborating" 
                      fill 
                      className="object-cover"
                    />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c] via-transparent to-transparent" />
                 <div className="relative z-10">
                    <h3 className="text-3xl font-bold mb-2">Build Together.</h3>
                    <p className="text-[#888888] mb-6">Real-time collaboration for distributed teams.</p>
                    <div className="flex items-center gap-3 text-sm font-bold text-[#f8423b] uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                      Watch Story <RiPlayFill />
                    </div>
                 </div>
              </div>

              {/* Smaller Stat Cards */}
              <div className="col-span-12 md:col-span-4 h-[300px] rounded-[40px] bg-[#151517] border border-white/5 p-8 flex flex-col justify-center text-center">
                 <div className="text-5xl font-bold text-[#f8423b] mb-2">99.9%</div>
                 <div className="text-[#888888] font-medium tracking-wide uppercase text-xs">Uptime Guaranteed</div>
              </div>

              <div className="col-span-12 md:col-span-8 h-[300px] rounded-[40px] bg-white/[0.02] border border-white/5 p-8 flex items-center justify-between group">
                 <div className="max-w-md">
                    <h3 className="text-2xl font-bold mb-4">Design in code on an <span className="text-[#f8423b]">infinite canvas.</span></h3>
                    <p className="text-[#888888]">Tweak designs visually, apply them directly to your app.</p>
                 </div>
                 <div className="hidden md:flex w-24 h-24 rounded-3xl bg-white/5 items-center justify-center border border-white/10 group-hover:bg-[#f8423b]/20 transition-colors">
                    <div className="w-10 h-10 border-2 border-[#f8423b] rounded-lg" />
                 </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Logo Cloud (Ticker Style) ── */}
        <section className="mb-32 overflow-hidden py-10 border-y border-white/5">
           <div className="flex gap-20 animate-infinite-scroll whitespace-nowrap opacity-30 grayscale items-center">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="text-4xl font-black italic tracking-tighter flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-white/20" /> LOGO_NAME
                </div>
              ))}
           </div>
        </section>

        {/* ── Testimonial Grid ── */}
        <section className="px-6 md:px-10 lg:px-16 mb-32">
           <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-12 rounded-[50px] bg-[#151517] border border-white/5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 text-white/5 text-9xl font-black leading-none pointer-events-none">"</div>
                 <p className="text-2xl md:text-3xl font-medium leading-snug mb-10 relative z-10">
                   "CodeKang has completely transformed how our senior engineers spend their time."
                 </p>
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-[#f8423b]" />
                    <div>
                       <div className="font-bold">Sarah Chen</div>
                       <div className="text-sm text-[#888888]">VP of Engineering at TechFlow</div>
                    </div>
                 </div>
              </div>
              <div className="p-12 rounded-[50px] bg-white/[0.03] border border-white/5">
                 <p className="text-2xl md:text-3xl font-medium leading-snug mb-10">
                   "The accuracy of the AI reviews is staggering. It catches edge cases we miss."
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10" />
                    <div>
                       <div className="font-bold">Marcus Thorne</div>
                       <div className="text-sm text-[#888888]">CTO at QuantumScale</div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ── Footer CTA ── */}
        <section className="px-6 md:px-10 lg:px-16">
           <div className="max-w-7xl mx-auto bg-[#f8423b] rounded-[60px] p-12 md:p-24 text-center">
              <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mb-8 leading-none">
                READY TO SHIP <br className="hidden md:block" /> 10X FASTER?
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                 <Link href="/in/login" className="px-10 py-5 bg-black text-white rounded-full font-bold text-lg hover:bg-black/80 transition-all">
                    Start Building
                 </Link>
                 <Link href="/in/contact" className="px-10 py-5 bg-white text-[#f8423b] rounded-full font-bold text-lg hover:bg-opacity-90 transition-all">
                    Contact Sales
                 </Link>
              </div>
           </div>
        </section>
      </main>

      <Footer />
      
      <style jsx global>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
