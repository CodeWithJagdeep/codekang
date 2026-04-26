'use client';

import { useEffect, useRef } from 'react';
import { GitPullRequest, Bot, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useSocketContext } from '@/component/SocketProvider';
import { useTheme } from '@/lib/theme';
import type { ActivityEvent } from '@/lib/socket';

function ActivityIcon({ type, status }: { type: ActivityEvent['type']; status: ActivityEvent['status'] }) {
  const color =
    status === 'completed' ? '#10b981' :
    status === 'failed' ? '#ef4444' :
    '#6366f1';

  const StatusIcon =
    status === 'completed' ? CheckCircle2 :
    status === 'failed' ? XCircle :
    Loader2;

  if (type === 'pr_review') return (
    <div className="relative shrink-0">
      <GitPullRequest size={14} style={{ color }} />
      <StatusIcon size={9} className={status === 'started' ? 'animate-spin' : ''} style={{ color, position: 'absolute', bottom: -2, right: -2 }} />
    </div>
  );
  if (type === 'agent_run') return (
    <div className="relative shrink-0">
      <Bot size={14} style={{ color }} />
      <StatusIcon size={9} className={status === 'started' ? 'animate-spin' : ''} style={{ color, position: 'absolute', bottom: -2, right: -2 }} />
    </div>
  );
  if (type === 'security') return (
    <div className="relative shrink-0">
      <ShieldCheck size={14} style={{ color }} />
      <StatusIcon size={9} className={status === 'started' ? 'animate-spin' : ''} style={{ color, position: 'absolute', bottom: -2, right: -2 }} />
    </div>
  );
  return (
    <div className="relative shrink-0">
      <AlertCircle size={14} style={{ color }} />
      <StatusIcon size={9} className={status === 'started' ? 'animate-spin' : ''} style={{ color, position: 'absolute', bottom: -2, right: -2 }} />
    </div>
  );
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export default function RealtimeActivityFeed({ maxItems = 8 }: { maxItems?: number }) {
  const { recentActivity, state } = useSocketContext();
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111' : '#ffffff';
  const textMuted = L ? '#5f6368' : '#909090';
  const textDim = L ? '#9aa0a6' : '#555';

  const items = recentActivity.slice(0, maxItems);

  if (items.length === 0) {
    return (
      <div
        className="rounded-lg border p-4 flex flex-col items-center justify-center gap-2 text-center"
        style={{ background: cardBg, borderColor: cardBorder, minHeight: 80 }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: state === 'connected' ? '#10b981' : '#71717a' }}
          />
          <span className="text-[12px]" style={{ color: textDim }}>
            {state === 'connected' ? 'Live — waiting for events' : 'Connecting…'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: cardBg, borderColor: cardBorder }}
    >
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: cardBorder }}
      >
        <span className="text-[13px] font-semibold" style={{ color: textPrimary }}>Live Activity</span>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: state === 'connected' ? '#10b981' : '#71717a', boxShadow: state === 'connected' ? '0 0 4px #10b981' : 'none' }}
          />
          <span className="text-[11px]" style={{ color: textDim }}>
            {state === 'connected' ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: cardBorder }}>
        {items.map((ev, i) => (
          <div key={`${ev.type}-${ev.ts}-${i}`} className="flex items-start gap-3 px-4 py-3">
            <ActivityIcon type={ev.type} status={ev.status} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: textPrimary }}>
                {ev.title}
              </p>
              {(ev.detail || ev.repoName) && (
                <p className="text-[12px] mt-0.5 truncate" style={{ color: textMuted }}>
                  {ev.repoName ? `${ev.repoName} · ` : ''}{ev.detail}
                </p>
              )}
            </div>
            <span className="text-[11px] shrink-0 mt-0.5" style={{ color: textDim }}>
              {timeAgo(ev.ts)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
