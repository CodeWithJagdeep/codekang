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
    <section className="px-6 md:px-10 lg:px-16 py-28">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl border border-white/8 overflow-hidden cursor-default"
          style={{ background: '#0d0d0f' }}
        >
          {/* Cursor-following glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${glow.x}% ${glow.y}%, rgba(249,115,22,0.12), transparent 50%)`,
            }}
          />

          {/* Static center glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-[#f97316] opacity-[0.05] rounded-full blur-[60px]" />
          </div>

          {/* Grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative px-8 py-20 md:py-28 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/25 bg-[#f97316]/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#f97316] mb-8"
            >
              <RiFlashlightLine size={11} />
              14-day free trial · No credit card required
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-[1.05]">
              Ready to ship
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #f97316, #f8423b)' }}
              >
                perfect PRs?
              </span>
            </h2>

            <p className="text-[16px] text-[#666] max-w-lg mx-auto mb-10 leading-relaxed">
              Join thousands of engineers who review faster, ship cleaner, and sleep better knowing KangBot has their back.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/in/login"
                className="group relative flex items-center gap-2 rounded-2xl bg-[#f97316] px-8 py-4 text-[15px] font-bold text-white transition-all hover:bg-[#ea6c0a] shadow-[0_0_40px_rgba(249,115,22,0.3)] hover:shadow-[0_0_60px_rgba(249,115,22,0.4)]"
              >
                Start free trial
                <RiArrowRightLine size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/in/pricing"
                className="flex items-center gap-2 rounded-2xl border border-white/10 px-8 py-4 text-[15px] font-bold text-white transition-all hover:bg-white/5"
              >
                View pricing
              </Link>
            </div>

            <p className="mt-6 text-[12px] text-[#444]">
              Full features for 14 days · No setup required · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
