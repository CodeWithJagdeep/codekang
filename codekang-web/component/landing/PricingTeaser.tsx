'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const PLANS = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    tagline: 'For solo devs',
    color: '#888888',
    features: ['5 private repos', 'PR summarization', '50 credits/mo', 'Community support'],
    cta: 'Get started',
    href: '/in/login',
  },
  {
    name: 'Starter',
    monthly: 25,
    annual: 19,
    tagline: 'For growing teams',
    color: '#f97316',
    popular: true,
    features: ['20 private repos', 'Full AI reviews', '400 credits/mo', 'Linter & SAST', 'Docstring gen'],
    cta: 'Start free trial',
    href: '/in/login',
  },
  {
    name: 'Team',
    monthly: 99,
    annual: 79,
    tagline: 'Flat org pricing',
    color: '#a78bfa',
    features: ['Unlimited repos', 'Unlimited credits', 'Autonomous fix', 'Unit test gen', 'Team RBAC'],
    cta: 'Start free trial',
    href: '/in/login',
  },
];

export default function PricingTeaser() {
  const [annual, setAnnual] = useState(true);

  return (
    <section className="px-6 md:px-10 lg:px-16 py-28">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-[#888888] text-lg max-w-xl mx-auto mb-8">
            No per-seat tricks. No feature gating. Start free, upgrade when you need to.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/[0.03]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${!annual ? 'bg-white text-black' : 'text-[#888]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-2 ${annual ? 'bg-white text-black' : 'text-[#888]'}`}
            >
              Annual
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {PLANS.map((plan) => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <motion.div
                key={plan.name}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
                }}
                whileHover={{ y: -4 }}
                className="relative rounded-2xl border p-6 flex flex-col transition-colors"
                style={{
                  background: plan.popular ? `${plan.color}08` : '#111113',
                  borderColor: plan.popular ? `${plan.color}30` : 'rgba(255,255,255,0.06)',
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{ background: plan.color, color: '#1c1c1c' }}
                  >
                    Most popular
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-[15px] font-bold text-white mb-0.5">{plan.name}</p>
                  <p className="text-[12px] text-[#555]">{plan.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-[42px] font-black text-white leading-none">${price}</span>
                  {price > 0 && <span className="text-[13px] text-[#555]">/mo</span>}
                  {price === 0 && <span className="text-[13px] text-[#555]">forever</span>}
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#888]">
                      <Check size={13} style={{ color: plan.color, flexShrink: 0 }} strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all"
                  style={
                    plan.popular
                      ? { background: plan.color, color: '#fff' }
                      : { border: '1px solid rgba(255,255,255,0.1)', color: '#888', background: 'transparent' }
                  }
                >
                  {plan.cta}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <Link
            href="/in/pricing"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#555] hover:text-[#f97316] transition-colors"
          >
            See full pricing & feature comparison <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
