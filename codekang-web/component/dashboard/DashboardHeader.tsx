'use client';

import { Bell, Zap, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { User, ISubscription } from '@/lib/auth';
import { useSocketContext } from '@/component/SocketProvider';

function creditsRemaining(sub: ISubscription): number | null {
  if (sub.plan.creditsPerMonth === 'unlimited') return null;
  return (sub.plan.creditsPerMonth as number) - sub.creditsUsed;
}

function isLowOnCredits(sub: ISubscription): boolean {
  const remaining = creditsRemaining(sub);
  if (remaining === null) return false;
  const total = sub.plan.creditsPerMonth as number;
  return remaining <= 10 || remaining / total < 0.2;
}

export default function DashboardHeader({
  user,
  subscription,
  onUpgrade,
  onAddCredits,
}: {
  user: User | null;
  subscription: ISubscription | null;
  onUpgrade: () => void;
  onAddCredits: () => void;
}) {
  const router = useRouter();
  const { unreadCount } = useSocketContext();
  const isFreePlan = !user?.plan || user.plan === 'free';
  const lowCredits = subscription ? isLowOnCredits(subscription) : false;
  const remaining = subscription ? creditsRemaining(subscription) : null;

  return (
    <div
      className="hidden md:flex items-center justify-end gap-2 px-6 py-2.5 border-b shrink-0"
      style={{ background: '#161618', borderColor: '#27272a' }}
    >
      {/* Low credits warning */}
      {lowCredits && subscription && (
        <div
          className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg mr-1"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
        >
          <CreditCard size={13} />
          <span>
            {remaining !== null && remaining <= 0
              ? 'No credits left'
              : `${remaining} credit${remaining === 1 ? '' : 's'} left`}
          </span>
        </div>
      )}

      {/* Add Credits button — shown when low on credits (non-unlimited plan) */}
      {lowCredits && (
        <button
          onClick={onAddCredits}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors hover:bg-white/5"
          style={{ borderColor: '#ef4444', color: '#f87171' }}
        >
          <CreditCard size={13} />
          Add Credits
        </button>
      )}

      {/* Upgrade button — shown on free plan */}
      {isFreePlan && (
        <button
          onClick={onUpgrade}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-opacity hover:opacity-90"
          style={{ background: '#f8423b', color: '#fff' }}
        >
          <Zap size={13} strokeWidth={2.5} />
          Upgrade
        </button>
      )}

      {/* Notification bell */}
      <button
        onClick={() => router.push('/dashboard/notifications')}
        className="relative p-1.5 rounded-lg border transition-colors hover:bg-white/5"
        style={{ borderColor: '#27272a', color: '#71717a' }}
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            style={{ background: '#f8423b' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
