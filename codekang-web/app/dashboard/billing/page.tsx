'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Check,
  Zap,
  CreditCard,
  History,
  ShieldCheck,
  Loader2,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  fetchSubscription,
  fetchPlans,
  createRazorpaySubscription,
  cancelRazorpaySubscription,
  type ISubscription,
  type IPlanCatalogItem,
} from '@/lib/auth';

// ─── Plan catalogue features helper ──────────────────────────────────────────────

function extractFeatures(p: IPlanCatalogItem): string[] {
  const f: string[] = [];
  if (p.features.repos.privateRepos === 'unlimited') f.push('Unlimited Private Repositories');
  else f.push(`${p.features.repos.privateRepos} Private Repositories`);

  if (p.features.ai.creditsPerMonth === 'unlimited') f.push('Unlimited Credits');

  if (p.features.reviews.prReviews) f.push('PR Reviews & Inline Comments');
  if (p.features.reviews.linterSast) f.push('Linter / SAST Support');
  if (p.features.ai.autonomousFix) f.push('Autonomous Bug Fix PRs');
  if (p.features.ai.unitTestGeneration) f.push('Unit Test Generation');
  if (p.features.ai.docstringGeneration) f.push('Docstring Generation');
  if (p.features.team.rbac) f.push('Team RBAC & Audit Logs');
  if (p.features.team.analytics) f.push('Analytics Reports');
  
  return f;
}

// ─── Razorpay Checkout loader ─────────────────────────────────────────────────

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function openRazorpayCheckout(
  planTier: 'starter' | 'team',
  billingPeriod: 'monthly' | 'annual',
  catalog: IPlanCatalogItem[],
  onSuccess: () => void,
): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded) throw new Error('Failed to load Razorpay checkout');

  const result = await createRazorpaySubscription(planTier, billingPeriod);

  const tier = catalog.find((t) => t.tier === planTier)!;
  const price = billingPeriod === 'annual' ? tier.pricing.annual : tier.pricing.monthly;
  const periodLabel = billingPeriod === 'annual' ? '/mo (billed annually)' : '/mo';

  const rzp = new (window as any).Razorpay({
    key: result.razorpayKeyId,
    subscription_id: result.subscriptionId,
    name: 'CodeKang',
    description: `${tier.name} Plan — $${price}${periodLabel}`,
    image: '/logo.png',
    theme: { color: '#f8423b' },
    handler: () => {
      // Payment captured — plan update happens via webhook
      onSuccess();
    },
  });

  rzp.open();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [catalog, setCatalog] = useState<IPlanCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const refresh = useCallback(() => {
    Promise.all([fetchSubscription(), fetchPlans()])
      .then(([sub, plans]) => {
        setSubscription(sub);
        setCatalog(plans.filter((p) => p.tier !== 'free' && p.tier !== 'enterprise' && p.tier !== 'pro'));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleUpgrade = async (planTier: 'starter' | 'team') => {
    setError(null);
    setUpgrading(planTier);
    try {
      await openRazorpayCheckout(planTier, billingPeriod, catalog, () => {
        setSuccessMsg(
          'Payment received! Your plan will activate within a few seconds.',
        );
        // Refresh after a short delay to pick up webhook-driven plan update
        setTimeout(() => {
          refresh();
          setSuccessMsg(null);
        }, 5000);
      });
    } catch (err) {
      setError((err as Error).message ?? 'Payment failed');
    } finally {
      setUpgrading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? You will be moved to the Free plan immediately.')) return;
    setCancelling(true);
    setError(null);
    try {
      await cancelRazorpaySubscription();
      setSuccessMsg('Subscription cancelled. You are now on the Free plan.');
      refresh();
    } catch (err) {
      setError((err as Error).message ?? 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100dvh-52px)]">
        <Loader2 className="w-8 h-8 animate-spin text-[#f8423b]" />
      </div>
    );
  }

  const currentTier = subscription?.plan.tier.toLowerCase() ?? 'free';
  const creditsUsed = subscription?.creditsUsed ?? 0;
  const creditsTotal =
    subscription?.plan.creditsPerMonth === 'unlimited'
      ? Infinity
      : ((subscription?.plan.creditsPerMonth as number) ?? 50);
  const usagePct =
    creditsTotal === Infinity
      ? 0
      : Math.min(100, Math.round((creditsUsed / creditsTotal) * 100));

  const isPaid = currentTier !== 'free';

  return (
    <div
      className="flex-1 flex flex-col h-dvh overflow-hidden"
      style={{ background: '#1c1c1c' }}
    >
      {/* ── Header ── */}
      <div className="px-4 md:px-8 pt-4 md:pt-6 pb-2">
        <div className="text-[12px] font-medium" style={{ color: '#a1a1aa' }}>
          Billing & Usage
        </div>
      </div>

      <div className="px-4 md:px-8 pb-4 md:pb-6">
        <h1
          className="text-[24px] md:text-[28px] font-bold"
          style={{ color: '#e8e8e8' }}
        >
          Subscription
        </h1>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="mx-4 md:mx-8 mb-4 flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
          <X size={14} className="shrink-0" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto hover:text-red-300"
          >
            <X size={12} />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="mx-4 md:mx-8 mb-4 flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px]">
          <Check size={14} className="shrink-0" />
          {successMsg}
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-[#18181b] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <CreditCard size={120} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[13px] font-medium text-[#71717a] mb-1">
                      Current Plan
                    </p>
                    <h2 className="text-2xl font-bold text-white capitalize">
                      {currentTier} Plan
                    </h2>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                    Active
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] text-[#a1a1aa]">
                        Credits Usage
                      </span>
                      <span className="text-[13px] font-semibold text-white">
                        {creditsUsed} /{' '}
                        {creditsTotal === Infinity ? 'Unlimited' : creditsTotal}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          usagePct > 90
                            ? 'bg-red-500'
                            : usagePct > 70
                              ? 'bg-amber-500'
                              : 'bg-[#f8423b]'
                        }`}
                        style={{ width: `${usagePct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#52525b] mt-2">
                      Resets on{' '}
                      {subscription?.creditsReset
                        ? new Date(subscription.creditsReset).toLocaleDateString()
                        : 'next billing date'}
                    </p>
                  </div>

                  <div className="flex flex-col justify-end gap-2">
                    {isPaid && (
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {cancelling ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : null}
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice placeholder */}
            <div className="p-6 rounded-2xl border border-white/5 bg-[#18181b]">
              <div className="flex items-center gap-2 mb-6">
                <History size={18} className="text-[#71717a]" />
                <h3 className="text-[15px] font-semibold text-white">
                  Recent Invoices
                </h3>
              </div>

              <div className="space-y-1">
                {isPaid ? (
                  <p className="text-[13px] text-[#52525b] py-4 text-center">
                    Invoices are sent to your email after each billing cycle.
                  </p>
                ) : (
                  <p className="text-[13px] text-[#52525b] py-4 text-center">
                    No invoices yet — you are on the Free plan.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upgrade options */}
          <div className="space-y-6">
            {/* Billing period toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-[#f8423b] text-white shadow-lg shadow-[#f8423b]/20'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                  billingPeriod === 'annual'
                    ? 'bg-[#f8423b] text-white shadow-lg shadow-[#f8423b]/20'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                Annual
                <span className="ml-1.5 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                  Save ~20%
                </span>
              </button>
            </div>

            {catalog.filter((t) => t.tier !== currentTier).map((tier) => {
              const price = billingPeriod === 'annual' ? tier.pricing.annual : tier.pricing.monthly;
              const featuresList = extractFeatures(tier);
              return (
                <div
                  key={tier.tier}
                  className="p-6 rounded-2xl border border-[#f8423b]/30 bg-gradient-to-br from-[#f8423b]/10 to-transparent"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={18} className="text-[#f8423b]" />
                    <h3 className="text-[15px] font-bold text-white">
                      Upgrade to {tier.name}
                    </h3>
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-[28px] font-black text-white">${price}</span>
                    <span className="text-[12px] text-[#71717a]">/mo</span>
                    {billingPeriod === 'annual' && (
                      <span className="ml-1 text-[11px] text-emerald-400">
                        (billed annually)
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {featuresList.map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-[#f8423b]/10 flex items-center justify-center shrink-0">
                          <Check size={10} className="text-[#f8423b]" strokeWidth={3} />
                        </div>
                        <span className="text-[12px] text-[#a1a1aa]">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(tier.tier as 'starter' | 'team')}
                    disabled={upgrading !== null}
                    className="w-full py-3 rounded-xl bg-[#f8423b] text-white text-[13px] font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#f8423b]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {upgrading === tier.tier ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                    {upgrading === tier.tier ? 'Opening checkout…' : `Upgrade — $${price}/mo`}
                  </button>
                </div>
              );
            })}

            <div className="p-6 rounded-2xl border border-white/5 bg-[#18181b]">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-[#71717a]" />
                <h3 className="text-[15px] font-bold text-white">
                  Enterprise Plan
                </h3>
              </div>
              <p className="text-[12px] text-[#71717a] mb-6">
                Custom solutions for large organizations — SSO, self-hosting, SLA, and dedicated support.
              </p>
              <button className="w-full py-2.5 rounded-xl border border-white/10 text-[12px] font-bold text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
