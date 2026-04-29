'use client';

import {
  Monitor,
  Smartphone,
  Globe,
  RefreshCw,
  Trash2,
  MapPin,
  Clock,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { fetchSessions, revokeSession, type ISession } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';

function deviceIcon(device: string) {
  const d = device.toLowerCase();
  if (d.includes('mobile') || d.includes('phone') || d.includes('android') || d.includes('ios')) {
    return <Smartphone size={18} />;
  }
  return <Monitor size={18} />;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<ISession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch {
      // non-blocking
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    const others = sessions.slice(1);
    setRevoking('all');
    try {
      await Promise.all(others.map((s) => revokeSession(s.id)));
      setSessions((prev) => prev.slice(0, 1));
    } catch {
      // ignore
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8e8]">Active Sessions</h1>
          <p className="text-[14px] text-[#71717a] mt-1">
            Devices and browsers currently signed into your account.
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={isRefreshing}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a2a] bg-[#18181b] hover:bg-[#27272a] text-[13px] text-[#e8e8e8] transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={`text-[#71717a] ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#27272a] border-t-[#6366f1] rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 text-[13px] text-[#52525b]">
          No active sessions found.
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#18181b] overflow-hidden">
            {sessions.map((session, i) => {
              const isCurrent = i === 0;
              return (
                <div
                  key={session.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-4 ${
                    i !== sessions.length - 1 ? 'border-b border-[#27272a]' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                      isCurrent
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-[#27272a] border-[#3f3f46] text-[#71717a]'
                    }`}>
                      {deviceIcon(session.device)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-[#e8e8e8]">
                          {session.device} · {session.os}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[#6d6d6d] flex-wrap">
                        {session.ip && (
                          <span className="flex items-center gap-1">
                            <Globe size={10} />
                            {session.ip}
                          </span>
                        )}
                        {session.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} />
                            {session.location}
                          </span>
                        )}
                        {session.lastActive && (
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => handleRevoke(session.id)}
                      disabled={revoking === session.id || revoking === 'all'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-[12px] text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40 flex-shrink-0"
                    >
                      <Trash2 size={13} />
                      {revoking === session.id ? 'Revoking...' : 'Revoke'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {sessions.length > 1 && (
            <div className="flex justify-end">
              <button
                onClick={handleRevokeAll}
                disabled={revoking === 'all'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-[13px] text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
              >
                <Trash2 size={14} />
                {revoking === 'all' ? 'Revoking...' : `Revoke ${sessions.length - 1} other session${sessions.length - 1 > 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
