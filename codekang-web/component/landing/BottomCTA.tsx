'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { RiArrowRightLine, RiFlashlightLine } from 'react-icons/ri';

export default function BottomCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <section className="px-6 md:px-10 lg:px-16 py-32 bg-[#fcfcfc] border-t-2 border-black/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-none border-2 border-black overflow-hidden cursor-default shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white p-12 md:p-20"
        >
          {/* Subtle cursor-following glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-40"
            style={{
              background: `radial-gradient(600px circle at ${glow.x}% ${glow.y}%, rgba(249,115,22,0.08), transparent 50%)`,
            }}
          />

          <div className="relative text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 border-2 border-black bg-[#f97316] px-5 py-2 text-[12px] font-black uppercase tracking-widest text-white mb-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <RiFlashlightLine size={12} />
              Free to start · 60-second setup
            </motion.div>

            <h2 className="text-4xl md:text-7xl font-black tracking-tight text-black mb-8 leading-[1.05] uppercase">
              Your next PR is already
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #f97316, #f8423b)' }}
              >
                being reviewed.
              </span>
            </h2>

            <p className="text-[18px] text-gray-500 font-medium max-w-xl mx-auto mb-12 leading-relaxed">
              Every engineer who connected KangBot this week found bugs they would have shipped to production.
              Connect your repo — it takes 60 seconds and zero config.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/in/signup"
                className="group relative flex items-center gap-3 border-2 border-black bg-[#f97316] px-10 py-5 text-[16px] font-black text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0 active:translate-y-0"
              >
                Connect GitHub — it's free
                <RiArrowRightLine size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/in/pricing"
                className="flex items-center gap-3 border-2 border-black bg-white px-10 py-5 text-[16px] font-black text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0 active:translate-y-0"
              >
                See pricing
              </Link>
            </div>

            <p className="mt-10 text-[12px] text-gray-400 font-bold uppercase tracking-widest">
              First 50 PRs free · No config required · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
