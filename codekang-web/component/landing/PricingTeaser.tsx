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
    tagline: 'Try it on your own repos',
    color: '#888888',
    features: ['Up to 5 repos watched', 'PR summaries on every merge', '50 reviews/mo included', 'Community support'],
    cta: 'Start for free',
    href: '/in/signup',
  },
  {
    name: 'Starter',
    monthly: 25,
    annual: 19,
    tagline: 'For teams tired of slow reviews',
    color: '#f97316',
    popular: true,
    features: ['20 repos, full AI reviews', 'Inline comments + risk scores', '400 reviews/mo', 'Security & SAST scanning', 'Auto-generate docstrings'],
    cta: 'Start free — no card needed',
    href: '/in/signup',
  },
  {
    name: 'Team',
    monthly: 99,
    annual: 79,
    tagline: 'One price, whole org',
    color: '#a78bfa',
    features: ['Unlimited repos & reviews', 'Autonomous fix PRs opened for you', 'Unit test generation', 'Team roles & permissions', 'Priority support'],
    cta: 'Start free trial',
    href: '/in/signup',
  },
];

export default function PricingTeaser() {
  const [annual, setAnnual] = useState(true);

  return (
    <section className="px-6 md:px-10 lg:px-16 py-28 bg-white border-t-2 border-black/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#f97316] mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-6xl font-black tracking-tight text-black mb-6 uppercase">
            Start free. Upgrade when<br />your team is hooked.
          </h2>
          <p className="text-gray-500 text-xl max-w-xl mx-auto mb-4 font-medium">
            No per-seat pricing. No hidden limits. Your first 50 PRs are on us — no card required.
          </p>
          <p className="text-[14px] font-bold text-gray-400 uppercase tracking-wide mb-10">
            Starter plan = less than 1 hour of a senior engineer per month · Saves 2–4 hrs/engineer/week
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-none border-2 border-black bg-white">
            <button
              onClick={() => setAnnual(false)}
              className={`px-8 py-2 rounded-none text-[13px] font-black uppercase transition-all ${!annual ? 'bg-black text-white' : 'text-gray-400'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-8 py-2 rounded-none text-[13px] font-black uppercase transition-all flex items-center gap-2 ${annual ? 'bg-black text-white' : 'text-gray-400'}`}
            >
              Annual
              <span className={`text-[10px] font-black px-1.5 py-0.5 border ${annual ? 'border-white text-white' : 'border-emerald-500/50 text-emerald-600'}`}>
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
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
                whileHover={{ y: -8, x: -4, boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)' }}
                className="relative rounded-none border-2 border-black p-8 flex flex-col transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white"
              >
                {plan.popular && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 border-2 border-black text-[11px] font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    style={{ background: plan.color, color: 'white' }}
                  >
                    Most popular
                  </div>
                )}

                <div className="mb-8">
                  <p className="text-[20px] font-black text-black uppercase mb-1">{plan.name}</p>
                  <p className="text-[13px] text-gray-500 font-bold uppercase tracking-tight">{plan.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-[52px] font-black text-black leading-none tracking-tighter">${price}</span>
                  {price > 0 && <span className="text-[14px] text-gray-400 font-bold uppercase">/mo</span>}
                  {price === 0 && <span className="text-[14px] text-gray-400 font-bold uppercase">forever</span>}
                </div>

                <ul className="space-y-4 flex-1 mb-10">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[14px] text-gray-600 font-bold uppercase tracking-tight">
                      <Check size={14} style={{ color: plan.color, flexShrink: 0 }} strokeWidth={4} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className="flex items-center justify-center gap-2 py-4 border-2 border-black text-[14px] font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  style={
                    plan.popular
                      ? { background: plan.color, color: '#fff' }
                      : { background: 'white', color: 'black' }
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
          className="text-center mt-12"
        >
          <Link
            href="/in/pricing"
            className="inline-flex items-center gap-2 text-[14px] font-black uppercase text-black hover:text-[#f97316] transition-colors"
          >
            See full pricing & feature comparison <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
