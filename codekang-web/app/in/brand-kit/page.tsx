'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RiDownload2Line, RiFileCopyLine, RiCheckLine, RiLoader4Line } from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import LogoBlackFont from '@/public/logo/logo_black_font.png';
import LogoWhiteFont from '@/public/logo/logo_white_font.png';
import Favi from '@/public/logo/favi.png';

// ── Components ───────────────────────────────────────────────────────────────

function ColorCard({ name, hex, desc }: { name: string, hex: string, desc: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = hex;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 group transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(249,115,22,1)]">
      <div 
        className="w-full h-32 border-2 border-black mb-6 shadow-inner transition-transform group-hover:scale-[1.02]" 
        style={{ backgroundColor: hex }} 
      />
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xl font-black uppercase">{name}</h4>
        <button 
          onClick={copy} 
          className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
        >
          {copied ? <RiCheckLine size={18} className="text-[#f97316]" /> : <RiFileCopyLine size={18} />}
        </button>
      </div>
      <p className="text-sm font-bold text-[#f97316] mb-4 uppercase tracking-widest">{hex}</p>
      <p className="text-sm text-gray-500 font-medium leading-tight uppercase tracking-tight">{desc}</p>
    </div>
  );
}

function AssetCard({ title, src, bg }: { title: string, src: any, bg: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    
    // Actually trigger a download of the image
    const link = document.createElement('a');
    link.href = src.src; // Get the actual path from the Next.js static asset
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsDownloading(false), 1500);
  };

  return (
    <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
      <div className={`h-64 flex items-center justify-center p-12 border-b-2 border-black ${bg} transition-all group-hover:bg-opacity-90`}>
        <Image src={src} alt={title} width={240} height={60} className="object-contain transition-transform group-hover:scale-105" style={{ height: 'auto' }} />
      </div>
      <div className="p-6 flex justify-between items-center bg-gray-50">
        <div>
          <h4 className="text-[14px] font-black uppercase">{title}</h4>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PNG / SVG / EPS</span>
        </div>
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50"
        >
          {isDownloading ? <RiLoader4Line size={20} className="animate-spin text-[#f97316]" /> : <RiDownload2Line size={20} />}
        </button>
      </div>
    </div>
  );
}

export default function BrandKitPage() {
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const handleDownloadAll = () => {
    setIsDownloadingAll(true);
    
    const link = document.createElement('a');
    link.href = '/codekang_brand_kit.zip';
    link.download = 'codekang_brand_kit.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsDownloadingAll(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main className="w-full">
        {/* ── Hero ── */}
        <section className="pt-32 pb-24 px-10 text-center relative border-b-2 border-black/10 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 py-1 border-2 border-[#f97316] text-[#f97316] text-[12px] font-black uppercase tracking-[0.2em] mb-8">
              Brand Identity
            </span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              Visual <br />
              <span className="text-[#f97316]">Guidelines</span>
            </h1>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto mb-12 font-medium uppercase tracking-tighter">
              Download assets and explore the design language that defines the future of autonomous engineering.
            </p>
          </motion.div>
        </section>

        {/* ── Logos ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10">
           <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div>
                   <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-4">Section 01</span>
                   <h2 className="text-5xl font-black uppercase tracking-tighter">Official Logos</h2>
                </div>
                <button 
                  onClick={handleDownloadAll}
                  disabled={isDownloadingAll}
                  className="flex items-center gap-3 border-2 border-black bg-black text-white px-10 py-5 text-[14px] font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all disabled:opacity-70"
                >
                   {isDownloadingAll ? (
                     <>
                        <RiLoader4Line size={20} className="animate-spin text-[#f97316]" /> DOWNLOADING...
                     </>
                   ) : (
                     <>
                        <RiDownload2Line size={20} /> DOWNLOAD ALL ASSETS
                     </>
                   )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                 <AssetCard title="Logo Black" src={LogoBlackFont} bg="bg-white" />
                 <AssetCard title="Logo White" src={LogoWhiteFont} bg="bg-black" />
                 <AssetCard title="Icon / Favi" src={Favi} bg="bg-gray-50" />
              </div>
           </div>
        </section>

        {/* ── Colors ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10 bg-white">
           <div className="max-w-7xl mx-auto">
              <div className="mb-16">
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-4">Section 02</span>
                 <h2 className="text-5xl font-black uppercase tracking-tighter">Color Palette</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 <ColorCard name="Kang Orange" hex="#f97316" desc="Our primary energy. Used for actions, highlights, and status." />
                 <ColorCard name="Off White" hex="#fcfcfc" desc="The canvas. Provides a clean, professional space for code." />
                 <ColorCard name="Absolute Black" hex="#000000" desc="Structure and weight. Used for borders, text, and shadows." />
                 <ColorCard name="Neutral Gray" hex="#6b7280" desc="Supporting text and secondary interface elements." />
              </div>
           </div>
        </section>

        {/* ── Typography ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                 <span className="text-[#f97316] text-[13px] font-black uppercase tracking-[0.4em] mb-4">Section 03</span>
                 <h2 className="text-5xl font-black uppercase tracking-tighter mb-8">Typography</h2>
                 <p className="text-xl text-gray-500 font-medium leading-tight uppercase tracking-tight mb-12">
                    We use Space Grotesk for its geometric precision and brutalist edge. It embodies our engineering-first mindset.
                 </p>
                 <div className="space-y-6">
                    <div className="border-b-2 border-black pb-4">
                       <span className="text-sm font-black uppercase text-gray-400">Headlines</span>
                       <p className="text-4xl font-black uppercase">Space Grotesk Bold</p>
                    </div>
                    <div className="border-b-2 border-black pb-4">
                       <span className="text-sm font-black uppercase text-gray-400">Body Text</span>
                       <p className="text-xl font-medium uppercase tracking-tight">Space Grotesk Medium</p>
                    </div>
                    <div className="border-b-2 border-black pb-4">
                       <span className="text-sm font-black uppercase text-gray-400">Code / Status</span>
                       <p className="text-lg font-bold font-mono">Geist Mono / JetBrains Mono</p>
                    </div>
                 </div>
              </div>
              
              <div className="border-2 border-black p-12 bg-white shadow-[12px_12px_0px_0px_rgba(249,115,22,1)]">
                 <p className="text-[120px] font-black leading-none uppercase tracking-tighter">Aa</p>
                 <p className="text-2xl font-black uppercase mt-4">ABCDEFGHIJKLM <br /> NOPQRSTUVWXYZ</p>
                 <p className="text-2xl font-medium uppercase mt-2">abcdefghijklm <br /> nopqrstuvwxyz</p>
                 <p className="text-2xl font-black mt-4">0123456789!@#$%</p>
              </div>
           </div>
        </section>

        {/* ── Aesthetic ── */}
        <section className="px-10 md:px-14 py-40 text-center">
           <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">The White Brutalist Philosophy</h2>
              <p className="text-2xl text-gray-500 font-medium leading-tight uppercase tracking-tight mb-16">
                 Kang's design is built on three pillars: <br />
                 <span className="text-black">Geometric Rigor</span>, <br />
                 <span className="text-black">Unapologetic Weight</span>, and <br />
                 <span className="text-[#f97316]">Functional Vibrancy</span>.
              </p>
              <div className="w-32 h-2 bg-black mx-auto" />
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
