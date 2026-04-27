'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCheckLine, RiSubtractLine, RiArrowRightLine, RiStarFill,
  RiFlashlightLine, RiShieldFlashLine, RiTeamLine, RiBuilding2Line,
  RiArrowDownSLine, RiQuestionLine, RiShieldLine, RiTimeLine
} from 'react-icons/ri';
import Footer from '@/component/Footer';
import HomeHeader from '@/component/HomeHeader';

// ── Types ────────────────────────────────────────────────────────────────────

type FeatureValue = boolean | string;

interface FeatureRow {
  name: string;
  values: [FeatureValue, FeatureValue, FeatureValue, FeatureValue]; // [free, starter, team, enterprise]
}

interface FeatureGroup {
  label: string;
  rows: FeatureRow[];
}

// ── Plan data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'Solo exploration',
    monthly: 0,
    annual: 0,
    billingNote: 'Forever free',
    cta: 'GET STARTED',
    href: '/in/signup',
    popular: false,
    color: '#000000',
    features: ['5 Private repos', 'Basic AI summaries', 'Public repo access']
  },
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'Power engineers',
    monthly: 25,
    annual: 19,
    billingNote: 'Per seat / month',
    cta: 'START TRIAL',
    href: '/in/signup',
    popular: true,
    color: '#f97316',
    features: ['Unlimited Private repos', 'Full PR reviews', 'Jira / Linear sync', '14-day free trial']
  },
  {
    key: 'team',
    name: 'Team',
    tagline: 'Flat org pricing',
    monthly: 99,
    annual: 79,
    billingNote: 'Flat fee / 20 seats',
    cta: 'START TRIAL',
    href: '/in/signup',
    popular: false,
    color: '#000000',
    features: ['Everything in Starter', 'Autonomous Fix PRs', 'Unit Test generation', 'Analytics reports']
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'Scalable security',
    monthly: -1,
    annual: -1,
    billingNote: 'Custom contract',
    cta: 'CONTACT US',
    href: '/in/contact',
    popular: false,
    color: '#000000',
    features: ['SSO / SAML', 'Self-hosting option', 'Dedicated CSM', '99.9% Uptime SLA']
  },
] as const;

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    label: 'Core Features',
    rows: [
      { name: 'Private repositories',   values: ['5', 'Unlimited', 'Unlimited', 'Unlimited'] },
      { name: 'Public repositories',    values: [true, true, true, true] },
      { name: 'Full PR Reviews',        values: [false, true, true, true] },
      { name: 'Inline Comments',        values: [false, true, true, true] },
    ],
  },
  {
    label: 'Kang Engine',
    rows: [
      { name: 'Auto-fix PRs',           values: [false, false, true, true] },
      { name: 'Unit Test Generation',   values: [false, false, true, true] },
      { name: 'Merge Conflict Res.',    values: [false, false, true, true] },
      { name: 'Issue Planner',          values: [false, false, true, true] },
    ],
  },
  {
    label: 'Security & Admin',
    rows: [
      { name: 'Analytics Reports',      values: [false, true, true, true] },
      { name: 'SSO / SAML',            values: [false, false, false, true] },
      { name: 'Self-hosting',           values: [false, false, false, true] },
      { name: 'Dedicated Support',      values: [false, false, 'Email', 'Priority'] },
    ],
  },
];

const FAQS = [
  { q: 'What counts as an AI credit?', a: 'Credits power every AI action. A PR review is 5 credits, an auto-fix is 10. The Team plan includes unlimited credits for all members.' },
  { q: 'Can I change plans later?', a: 'Yes, you can upgrade or downgrade at any time. If you downgrade, the change will take effect at the end of your current billing cycle.' },
  { q: 'Is there a trial period?', a: 'All paid plans come with a 14-day full-feature trial. No credit card is required to start.' },
];

// ── Components ───────────────────────────────────────────────────────────────

function PricingCard({ plan, annual }: { plan: typeof PLANS[number]; annual: boolean }) {
  const price = annual ? plan.annual : plan.monthly;
  const isCustom = price === -1;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className={`relative flex flex-col p-10 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] hover:border-[#f97316] transition-all group ${plan.popular ? 'z-10' : ''}`}
    >
      {plan.popular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#f97316] text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black">
          Most Popular
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-2xl font-black uppercase mb-1">{plan.name}</h3>
        <p className="text-[14px] text-gray-500 font-bold uppercase tracking-tight">{plan.tagline}</p>
      </div>

      <div className="mb-8">
        {isCustom ? (
          <div className="text-5xl font-black uppercase">Custom</div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black tracking-tighter">${price}</span>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-gray-400 uppercase">/mo</span>
              <span className="text-[10px] font-black text-gray-300 uppercase leading-none">{plan.billingNote}</span>
            </div>
          </div>
        )}
      </div>

      <Link
        href={plan.href}
        className={`w-full py-5 text-center text-[15px] font-black uppercase tracking-widest border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none mb-10 ${plan.popular ? 'bg-[#f97316] text-white' : 'bg-white text-black'}`}
      >
        {plan.cta}
      </Link>

      <div className="space-y-4">
        {plan.features.map((f, i) => (
          <div key={i} className="flex items-start gap-3">
            <RiCheckLine size={18} className="text-[#f97316] shrink-0 mt-0.5" />
            <span className="text-[14px] font-bold text-gray-700 leading-tight uppercase tracking-tight">{f}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main className="w-full">
        {/* Full-width subtle background grid */}
        <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* ── Hero ── */}
        <section className="pt-32 pb-24 px-10 text-center relative border-b-2 border-black/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 py-1 border-2 border-[#f97316] text-[#f97316] text-[12px] font-black uppercase tracking-[0.2em] mb-8">
              Transparent Pricing
            </span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              The only <br />
              <span className="text-[#f97316]">engineer</span> <br />
              on a fixed salary
            </h1>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto mb-12 font-medium">
              No per-seat tricks. No hidden fees. Start free and only pay when you scale your team.
            </p>

            <div className="flex flex-col items-center gap-10">
              <button 
                onClick={() => {
                  const section = document.getElementById('pricing-grid');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-black text-white px-12 py-5 text-[18px] font-black uppercase shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              >
                View Plans & Pricing
              </button>

              {/* Billing toggle */}
              <div className="inline-flex items-center p-2 border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <button
                  onClick={() => setAnnual(false)}
                  className={`px-8 py-3 text-[14px] font-black uppercase tracking-widest transition-all ${!annual ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className={`px-8 py-3 text-[14px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${annual ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`}
                >
                  Annual <span className="text-[10px] text-[#f97316]">-20%</span>
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Pricing Grid ── */}
        <section id="pricing-grid" className="px-10 md:px-14 py-24 border-b-2 border-black/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PLANS.map((plan) => (
              <PricingCard key={plan.key} plan={plan} annual={annual} />
            ))}
          </div>
        </section>

        {/* ── Comparison Section ── */}
        <section className="px-10 md:px-14 py-32 border-b-2 border-black/10 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-24">
              <span className="text-[#f97316] text-[14px] font-black uppercase tracking-[0.4em] mb-6">Deep Dive</span>
              <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Feature comparison</h2>
            </div>

            <div className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              {FEATURE_GROUPS.map((group, gi) => (
                <div key={gi} className="border-b-2 border-black last:border-b-0">
                  <div className="bg-gray-50 px-8 py-4 border-b-2 border-black">
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">{group.label}</span>
                  </div>
                  {group.rows.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-2 sm:grid-cols-5 items-center border-b border-black/10 last:border-b-0 group">
                      <div className="col-span-1 sm:col-span-1 px-8 py-4 font-bold text-[14px] uppercase tracking-tight">{row.name}</div>
                      {row.values.map((val, vi) => (
                        <div key={vi} className="hidden sm:flex col-span-1 px-4 py-4 border-l border-black/10 items-center justify-center">
                          {typeof val === 'boolean' ? (
                            val ? <RiCheckLine size={20} className="text-[#f97316]" /> : <RiSubtractLine size={20} className="text-gray-200" />
                          ) : (
                            <span className="text-[13px] font-black uppercase">{val}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust Grid ── */}
        <section className="border-b-2 border-black/10">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {[
              { icon: RiShieldLine, title: 'SOC2 Type II', desc: 'Enterprise-grade security standards.' },
              { icon: RiShieldFlashLine, title: 'GDPR Compliant', desc: 'Your code never leaves the session.' },
              { icon: RiTimeLine, title: '99.9% Uptime', desc: 'Reliability you can build your team on.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={`p-12 border-b-2 md:border-b-0 ${i < 2 ? 'md:border-r-2' : ''} border-black/10 flex flex-col items-center text-center`}>
                  <Icon size={32} className="text-[#f97316] mb-6" />
                  <h4 className="text-xl font-bold uppercase mb-2">{item.title}</h4>
                  <p className="text-gray-500 font-medium">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-10 py-32 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black uppercase mb-16 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {FAQS.map((faq, i) => (
                <div key={i} className="p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="text-lg font-black uppercase mb-4 flex gap-3">
                    <RiQuestionLine className="text-[#f97316] shrink-0" />
                    {faq.q}
                  </h4>
                  <p className="text-gray-500 font-medium leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-32 px-10 text-center">
          <div className="max-w-4xl mx-auto border-2 border-black p-16 shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] bg-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <RiBuilding2Line size={120} />
             </div>
             <h2 className="text-4xl md:text-6xl font-black uppercase mb-8 relative z-10">Start your <span className="text-[#f97316]">free trial</span> today</h2>
             <p className="text-xl text-gray-500 mb-12 font-medium">No credit card required. Cancel anytime during your 14-day window.</p>
             <Link
              href="/in/signup"
              className="inline-flex items-center gap-3 border-2 border-black bg-black px-14 py-6 text-[18px] font-black text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              GET STARTED NOW <RiArrowRightLine size={24} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
