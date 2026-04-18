'use client';

import { Bell, Zap } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <header
      className="flex items-center justify-between px-6 py-3 w-full shrink-0"
      style={{ borderBottom: '1px solid #2a2a2a' }}
    >
      <div className="flex items-center gap-4">
        {/* Left Placeholder if needed, e.g. Breadcrumbs or Title for dynamic routing later */}
      </div>

      <div className="flex items-center gap-6">
        {/* ── Usage Indicator ── */}
        <div className="flex flex-col gap-1.5 w-[140px]">
          <div className="flex justify-between text-[11px] font-medium text-[#a1a1aa]">
            <span>AI Reviews</span>
            <span className="text-[#e8e8e8]">30/100</span>
          </div>
          <div className="h-1.5 w-full bg-[#2a2a2e] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: '30%', background: '#e11d48' }}
            />
          </div>
        </div>

        {/* ── Plan & Top-up ── */}
        <div className="flex items-center gap-3">
          <div className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase bg-white/5 text-[#a1a1aa] border border-[#2a2a2e]">
            Free Tier
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors bg-[#f97316] hover:bg-[#ea580c] text-white">
            <Zap size={14} className="fill-current" strokeWidth={1.5} />
            Upgrade to Pro
          </button>
        </div>

        {/* ── Notifications ── */}
        <div className="flex items-center">
          <button className="relative p-1.5 rounded-full hover:bg-white/5 transition-colors text-[#a1a1aa] hover:text-[#e8e8e8]">
            <Bell size={18} strokeWidth={1.5} />
            {/* Unread dot */}
            <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full border border-[#121214] bg-[#f97316]" />
          </button>
        </div>
      </div>
    </header>
  );
}
