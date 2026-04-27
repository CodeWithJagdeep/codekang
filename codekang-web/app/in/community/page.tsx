'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RiDiscordFill, 
  RiTwitterXFill, 
  RiGithubFill, 
  RiRedditFill,
  RiArrowRightLine,
  RiTeamLine,
  RiGroupLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiDoubleQuotesL,
  RiFlashlightLine,
  RiFocus2Line,
  RiShieldCheckLine,
  RiExchangeLine,
  RiCompass3Line,
  RiFlagLine,
  RiArrowRightUpLine
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';
import { API_URL } from '@/lib/auth';

export default function CommunityPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'community' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message ?? "You're in.");
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

  const scrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const PLATFORMS = [
    {
      name: 'Discord',
      description: 'Real-time discussions, support, and community events.',
      icon: RiDiscordFill,
      color: '#5865F2',
      link: 'https://discord.gg/codekang',
      members: '5k+ Members'
    },
    {
      name: 'GitHub',
      description: 'Contribute to our open-source tools and view our roadmap.',
      icon: RiGithubFill,
      color: '#000000',
      link: 'https://github.com/codekang',
      members: '1.2k Stars'
    },
    {
      name: 'X / Twitter',
      description: 'Latest updates, feature releases, and engineering tips.',
      icon: RiTwitterXFill,
      color: '#000000',
      link: 'https://x.com/codekang',
      members: '10k+ Followers'
    },
    {
      name: 'Reddit',
      description: 'Deep dives and long-form community discussions.',
      icon: RiRedditFill,
      color: '#FF4500',
      link: 'https://reddit.com/r/codekang',
      members: '2k+ Members'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main>
        {/* ── Hero Section ── */}
        <section className="pt-40 pb-32 px-10 text-center relative border-b-2 border-black/10 overflow-hidden bg-white">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 border-2 border-black bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] mb-12">
              CodeKang Community / v1.0
            </span>
            <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-12">
              Join the <br />
              <span className="text-[#f97316]">Collective</span>
            </h1>
            <p className="text-[20px] md:text-[24px] text-gray-500 max-w-4xl mx-auto mb-16 font-medium uppercase tracking-tighter leading-relaxed">
              We're building more than just tools. We're building an engine for the next generation of engineers. Join us in shaping the future of autonomous development.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <button 
                onClick={() => scrollTo('platforms')}
                className="bg-black text-white px-10 py-5 text-[18px] font-black uppercase shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              >
                Find Your Platform
              </button>
              <button 
                onClick={() => scrollTo('newsletter')}
                className="border-2 border-black px-10 py-5 text-[18px] font-black uppercase hover:bg-black hover:text-white transition-all"
              >
                Get Weekly Updates
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── Platforms Grid ── */}
        <section id="platforms" className="px-10 py-32 border-b-2 border-black/10 bg-[#fcfcfc]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-20">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Our Platforms</h2>
              <div className="h-1 flex-1 mx-12 bg-black/5 hidden md:block" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {PLATFORMS.map((platform, i) => (
                <motion.a
                  key={platform.name}
                  href={platform.link}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_var(--platform-color)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all"
                  style={{ '--platform-color': platform.color } as any}
                >
                  <platform.icon size={64} className="mb-8" style={{ color: platform.color }} />
                  <h3 className="text-3xl font-black uppercase mb-4">{platform.name}</h3>
                  <p className="text-[14px] text-gray-500 font-medium uppercase tracking-tight leading-tight mb-8">
                    {platform.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                      {platform.members}
                    </span>
                    <RiArrowRightUpLine size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Community Values ── */}
        <section className="px-10 py-40 border-b-2 border-black/10 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-6 block">Community Core</span>
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tight mb-12 leading-none">Built on <br /> <span className="text-[#f97316]">High Trust</span></h2>
                <div className="space-y-12">
                  {[
                    { t: "Radical Transparency", d: "We share our roadmap, our failures, and our thought process openly.", icon: RiExchangeLine },
                    { t: "Deep Focus", d: "We respect developer flow. Our community is high-signal, zero-noise.", icon: RiFocus2Line },
                    { t: "Collective Intelligence", d: "We believe the best tools are built by many, not by a few in a silo.", icon: RiTeamLine }
                  ].map((val, i) => (
                    <div key={val.t} className="flex gap-8 group">
                      <div className="w-16 h-16 border-2 border-black flex items-center justify-center shrink-0 group-hover:bg-[#f97316] group-hover:border-[#f97316] group-hover:text-white transition-all">
                        <val.icon size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase mb-2">{val.t}</h3>
                        <p className="text-gray-500 font-medium uppercase tracking-tight leading-tight">{val.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="border-4 border-black p-12 bg-[#fcfcfc] shadow-[20px_20px_0px_0px_rgba(249,115,22,1)] relative z-10">
                  <RiDoubleQuotesL size={64} className="text-[#f97316] mb-8" />
                  <p className="text-3xl font-black uppercase leading-[1.1] mb-10 italic">
                    "The CodeKang community isn't just about using a tool. It's about rethinking how we build software entirely. It's a high-signal group of builders."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black" />
                    <div>
                      <p className="font-black uppercase text-[14px]">Marcus Thorne</p>
                      <p className="text-[12px] font-medium text-gray-400 uppercase">Early Pioneer / CTO @ FlowState</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-full h-full border-2 border-black -z-0 opacity-10" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Ambassador Program ── */}
        <section className="px-10 py-40 border-b-2 border-black/10 bg-black text-white">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-12 block">The Program</span>
            <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tight mb-16 leading-none">CodeKang <br /> <span className="text-[#f97316]">Pioneers</span></h2>
            <p className="text-2xl text-white/40 max-w-3xl mx-auto font-medium uppercase tracking-normal leading-relaxed mb-16">
              A select group of engineers shaping the future of autonomous tools. Get early access, direct influence on the roadmap, and exclusive perks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
              {[
                { t: "Early Access", d: "Test new features weeks before the public.", icon: RiFlashlightLine },
                { t: "Roadmap Access", d: "Monthly private syncs with the founding team.", icon: RiCompass3Line },
                { t: "Exclusive Perks", d: "Limited edition gear and lifelong discounts.", icon: RiShieldCheckLine }
              ].map((perk) => (
                <div key={perk.t} className="p-10 border-2 border-white/10 hover:border-[#f97316] transition-colors">
                  <perk.icon size={48} className="text-[#f97316] mx-auto mb-6" />
                  <h3 className="text-2xl font-black uppercase mb-4">{perk.t}</h3>
                  <p className="text-white/40 font-medium uppercase tracking-tight leading-tight">{perk.d}</p>
                </div>
              ))}
            </div>
            <Link
              href="/in/contact"
              className="inline-flex items-center gap-3 border-2 border-[#f97316] text-[#f97316] px-16 py-8 text-[24px] font-black uppercase transition-all hover:bg-[#f97316] hover:text-white"
            >
              Apply to Pioneers <RiArrowRightLine size={32} />
            </Link>
          </div>
        </section>

        {/* ── Newsletter ── */}
        <section id="newsletter" className="py-40 px-10 border-t-2 border-black/10 bg-[#fcfcfc] text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              Stay in <br /> <span className="text-[#f97316]">the Loop</span>
            </h2>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto mb-16 font-medium uppercase tracking-tighter">
              Join 15,000+ engineers who receive our weekly deep-dive into AI, engineering velocity, and community news.
            </p>
            {status === 'success' ? (
              <div className="flex items-center justify-center gap-3 border-2 border-[#22c55e] bg-[#22c55e]/5 px-8 py-6 max-w-2xl mx-auto shadow-[8px_8px_0px_0px_rgba(34,197,94,0.3)]">
                <RiCheckLine size={24} className="text-[#22c55e] shrink-0" />
                <span className="text-[18px] font-black uppercase tracking-widest text-[#22c55e]">{message}</span>
              </div>
            ) : (
              <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="YOUR.EMAIL@COMPANY.COM" 
                  className="flex-1 bg-white border-2 border-black px-8 py-6 text-[18px] font-black uppercase placeholder:text-gray-400 focus:outline-none focus:shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] transition-all"
                />
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-12 py-6 border-2 border-black bg-black text-[18px] font-black text-white uppercase shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all disabled:opacity-60"
                >
                  {status === 'loading' ? '...' : 'SUBSCRIBE'}
                </button>
              </form>
            )}
            {status === 'error' && (
              <div className="flex items-center justify-center gap-2 mt-4 text-[14px] font-bold text-red-500 uppercase tracking-wide">
                <RiErrorWarningLine size={16} />
                {message}
              </div>
            )}
            <p className="mt-8 text-[12px] font-black uppercase text-gray-400">
              NO SPAM. JUST HIGH-SIGNAL ENGINEERING CONTENT.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
