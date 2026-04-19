'use client';

import {
  Terminal,
  Clock,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { useState } from 'react';

export default function SessionsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      agent: 'Kang-01',
      repo: 'codekang-web',
      status: 'Active',
      duration: '2h 14m',
      time: 'Started 2h ago',
    },
    {
      id: 'sess-2',
      agent: 'Kang-01',
      repo: 'codekang-api',
      status: 'Completed',
      duration: '45m',
      time: 'Completed 5h ago',
    },
    {
      id: 'sess-3',
      agent: 'Kang-01',
      repo: 'auth-service',
      status: 'Completed',
      duration: '1h 20m',
      time: 'Completed 1d ago',
    },
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Simulate new session
      if (sessions.length < 4) {
        setSessions([
          {
            id: 'sess-4',
            agent: 'Kang-01',
            repo: 'internal-docs',
            status: 'Active',
            duration: '1m',
            time: 'Started just now',
          },
          ...sessions,
        ]);
      }
    }, 1000);
  };

  const activeCount = sessions.filter((s) => s.status === 'Active').length;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8e8]">Sessions</h1>
          <p className="text-[14px] text-[#71717a] mt-1">
            Review and manage your agent&apos;s active work sessions.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a2a] bg-[#18181b] hover:bg-[#27272a] text-[13px] text-[#e8e8e8] transition-all disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={`text-[#71717a] ${isRefreshing ? 'animate-spin' : ''}`}
          />
          {isRefreshing ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-linear-to-br from-[#1c1c1c] to-[#18181b] border border-[#2a2a2a] shadow-lg shadow-black/20 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <Activity size={20} />
            </div>
            <span className="text-[13px] font-medium text-[#71717a]">
              Total Active Sessions
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#f4f4f5] tracking-tight">
              {activeCount}
            </span>
            <span className="text-[13px] text-emerald-500 font-medium">
              Live now
            </span>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-linear-to-br from-[#1c1c1c] to-[#18181b] border border-[#2a2a2a] shadow-lg shadow-black/20 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Terminal size={20} />
            </div>
            <span className="text-[13px] font-medium text-[#71717a]">
              All-time Executions
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#f4f4f5] tracking-tight">
              1,284
            </span>
            <span className="text-[13px] text-[#52525b]">Last 30 days</span>
          </div>
        </div>
      </div>

      {/* ── Session Log ── */}
      <section>
        <h2 className="text-[14px] font-bold text-[#e8e8e8] mb-4">
          Recent activity
        </h2>
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] overflow-hidden shadow-xl">
          {sessions.map((session, i) => (
            <div
              key={session.id}
              className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between group hover:bg-white/1 transition-colors gap-4 ${
                i !== sessions.length - 1 ? 'border-b border-[#2a2a2a]' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                    session.status === 'Active'
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
                      : 'bg-[#27272a] border-[#3f3f46] text-[#71717a]'
                  }`}
                >
                  <Terminal size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] text-[#e8e8e8] font-semibold truncate">
                      {session.repo}
                    </span>
                    <span className="text-[10px] text-[#52525b] font-mono bg-black/30 px-1.5 py-0.5 rounded border border-[#27272a] shrink-0">
                      {session.agent}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#6d6d6d]">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {session.duration}
                    </span>
                    <span className="opacity-40">·</span>
                    <span>{session.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 border-white/5 pt-3 sm:pt-0">
                {session.status === 'Active' && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {session.status === 'Active' && (
                    <button className="text-[11px] text-red-500/70 hover:text-red-500 font-medium px-2 py-1 transition-colors">
                      Terminate
                    </button>
                  )}
                  <button className="p-1.5 rounded-lg border border-[#2a2a2a] bg-[#18181b] hover:bg-[#27272a] text-[#71717a] hover:text-[#e8e8e8] transition-all">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="pt-6 border-t border-[#2a2a2a]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button className="text-[12px] text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1.5">
          View full execution history
          <ExternalLink size={12} />
        </button>
        <p className="text-[11px] text-[#52525b]">Last synced: Just now</p>
      </footer>
    </div>
  );
}
