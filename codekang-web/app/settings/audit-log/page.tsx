'use client';

import {
  ClipboardList, Search, Download,
  GitPullRequest, Bot, Settings2,
  CreditCard, ShieldCheck, FolderGit2, Loader2, ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { fetchAuditLogs, type IAuditLog } from '@/lib/auth';
import { format } from 'date-fns';

// ── Types ──

type EventCategory = 'all' | 'auth' | 'review' | 'agent' | 'repo' | 'billing' | 'settings';

interface AuditEvent {
  id: string;
  category: EventCategory;
  action: string;
  description: string;
  actor: string;
  ip: string;
  location: string;
  time: string;
  date: string;
  severity: 'info' | 'warning' | 'critical';
}

function mapBackendAuditLog(log: IAuditLog): AuditEvent {
  return {
    id: log.id,
    category: 'settings', // Default fallback
    action: log.action,
    description: log.resource ? `Resource: ${log.resource}` : 'System action',
    actor: 'System/User', // Need to resolve actor if available
    ip: log.ipAddress || '—',
    location: '—',
    time: format(new Date(log.createdAt), 'h:mm a'),
    date: format(new Date(log.createdAt), 'MMM d, yyyy'),
    severity: 'info',
  };
}

const CATEGORY_CFG: Record<EventCategory, { label: string; icon: LucideIcon; color: string }> = {
  all:      { label: 'All',      icon: ClipboardList, color: '#909090' },
  auth:     { label: 'Auth',     icon: ShieldCheck,   color: '#3b82f6' },
  review:   { label: 'Reviews',  icon: GitPullRequest, color: '#10b981' },
  agent:    { label: 'Agents',   icon: Bot,           color: '#8b5cf6' },
  repo:     { label: 'Repos',    icon: FolderGit2,    color: '#f59e0b' },
  billing:  { label: 'Billing',  icon: CreditCard,    color: '#e11d48' },
  settings: { label: 'Settings', icon: Settings2,     color: '#909090' },
};

const SEVERITY_CFG = {
  info:     { cls: 'bg-blue-500/8 text-blue-400 border-blue-500/15',     dot: '#60a5fa' },
  warning:  { cls: 'bg-amber-500/8 text-amber-400 border-amber-500/15',  dot: '#f59e0b' },
  critical: { cls: 'bg-red-500/8 text-red-400 border-red-500/15',        dot: '#ef4444' },
};

// ── Page ──

export default function AuditLogPage() {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const textPrimary = L ? '#111'    : '#f8f8f8';
  const textMuted   = L ? '#5f6368' : '#909090';
  const textDim     = L ? '#9aa0a6' : '#555';
  const cardBg      = L ? '#ffffff' : '#18181b';
  const cardBorder  = L ? '#e2e4e7' : '#27272a';
  const inputBg     = L ? '#f4f5f7' : '#111113';
  const inputBorder = L ? '#d8dadd' : '#2e2e2e';
  const rowHover    = L ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.025)';
  const theadBg     = L ? '#f8f9fa' : 'rgba(255,255,255,0.02)';

  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState<EventCategory>('all');
  const [exporting, setExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs().then((logs) => {
      setEvents(logs.map(mapBackendAuditLog));
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const filtered = events.filter(e =>
    (category === 'all' || e.category === category) &&
    (search === '' || e.action.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1500);
  };

  // Group by date
  const grouped: Record<string, AuditEvent[]> = {};
  filtered.forEach(e => {
    if (!grouped[e.date]) grouped[e.date] = [];
    grouped[e.date].push(e);
  });

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: textPrimary }}>Audit Log</h1>
          <p className="text-[13.5px] mt-1" style={{ color: textMuted }}>
            A complete record of actions taken in your workspace.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-medium transition-all disabled:opacity-60"
          style={{ borderColor: cardBorder, color: textMuted }}
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: textDim }} />
          <input
            type="text"
            placeholder="Search events…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-[13px] outline-none border"
            style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_CFG) as EventCategory[]).map(c => {
            const cfg = CATEGORY_CFG[c];
            const Icon = cfg.icon;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12.5px] font-medium transition-all"
                style={{
                  borderColor: category === c ? `${cfg.color}35` : cardBorder,
                  background: category === c ? `${cfg.color}08` : 'transparent',
                  color: category === c ? cfg.color : textMuted,
                }}
              >
                <Icon size={12} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total events', value: events.length },
          { label: 'Warnings',     value: events.filter(e => e.severity === 'warning').length },
          { label: 'Critical',     value: events.filter(e => e.severity === 'critical').length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background: cardBg, borderColor: cardBorder }}>
            <p className="text-[22px] font-black" style={{ color: textPrimary }}>{value}</p>
            <p className="text-[12px] mt-0.5" style={{ color: textMuted }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Log table */}
      {Object.keys(grouped).length === 0 && (
        <div className="py-16 text-center text-[13px]" style={{ color: textMuted }}>No events match your filters</div>
      )}

      {Object.entries(grouped).map(([date, events]) => (
        <div key={date}>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: textDim }}>{date}</p>
            <div className="flex-1 h-px" style={{ background: cardBorder }} />
            <span className="text-[11.5px]" style={{ color: textDim }}>{events.length} event{events.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="rounded-2xl border overflow-hidden" style={{ background: cardBg, borderColor: cardBorder }}>
            {events.map((event, i) => {
              const catCfg = CATEGORY_CFG[event.category];
              const sevCfg = SEVERITY_CFG[event.severity];
              const CatIcon = catCfg.icon;
              const isExpanded = expandedId === event.id;

              return (
                <div key={event.id} className={i < events.length - 1 ? 'border-b' : ''} style={{ borderColor: cardBorder }}>
                  <div
                    className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = rowHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  >
                    {/* Severity dot */}
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sevCfg.dot }} />

                    {/* Category icon */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${catCfg.color}10`, border: `1px solid ${catCfg.color}20` }}>
                      <CatIcon size={14} style={{ color: catCfg.color }} />
                    </div>

                    {/* Action + description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13.5px] font-semibold" style={{ color: textPrimary }}>{event.action}</p>
                        <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10.5px] font-semibold ${sevCfg.cls}`}>
                          {event.severity}
                        </span>
                      </div>
                      <p className="text-[12.5px] mt-0.5 truncate" style={{ color: textMuted }}>{event.description}</p>
                    </div>

                    {/* Time + actor */}
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-[12.5px] font-medium" style={{ color: textPrimary }}>{event.time}</p>
                      <p className="text-[11.5px] mt-0.5 max-w-[140px] truncate" style={{ color: textDim }}>{event.actor}</p>
                    </div>

                    <ChevronDown
                      size={14}
                      className="shrink-0 transition-transform duration-200"
                      style={{ color: textDim, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 border-t" style={{ borderColor: cardBorder, background: inputBg }}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12.5px]">
                        {[
                          { label: 'Actor',    value: event.actor },
                          { label: 'IP',       value: event.ip },
                          { label: 'Location', value: event.location },
                          { label: 'Category', value: CATEGORY_CFG[event.category].label },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="font-semibold uppercase tracking-wider text-[11px] mb-0.5" style={{ color: textDim }}>{label}</p>
                            <p style={{ color: textPrimary }}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
