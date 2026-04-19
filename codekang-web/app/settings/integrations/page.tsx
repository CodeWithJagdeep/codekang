'use client';

import {
  Check, X, ChevronRight, RefreshCcw, Loader2,
  Globe, Webhook, GitBranch, MessageSquare, BarChart2, Ticket,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/lib/theme';

// ── Types ──

type IntegrationStatus = 'connected' | 'disconnected';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: IntegrationStatus;
  connectedAs?: string;
  color: string;
  icon: React.ReactNode;
}

// ── Data ──

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function GitlabIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
    </svg>
  );
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect repositories and enable automatic PR review triggers.',
    category: 'Source Control',
    status: 'connected',
    connectedAs: 'CodeWithJagdeep',
    color: '#f8f8f8',
    icon: <GithubIcon />,
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Link GitLab projects and merge requests to CodeKang.',
    category: 'Source Control',
    status: 'disconnected',
    color: '#fc6d26',
    icon: <GitlabIcon />,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Receive review alerts and agent notifications in Slack channels.',
    category: 'Communication',
    status: 'disconnected',
    color: '#4a154b',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z"/>
      </svg>
    ),
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Send review summaries and alerts to Discord servers.',
    category: 'Communication',
    status: 'disconnected',
    color: '#5865f2',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
      </svg>
    ),
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Link CodeKang findings to Linear issues automatically.',
    category: 'Project Management',
    status: 'disconnected',
    color: '#5e6ad2',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M2.08 13.153l8.77 8.769a12.255 12.255 0 01-8.77-8.77zM.008 9.239L14.76 23.99A12.27 12.27 0 012.752 16.78l-2.522-2.52a12.265 12.265 0 01-.222-5.02zM2.266 4.9L19.1 21.734A12.227 12.227 0 0116.78 23.25L.75 7.22a12.222 12.222 0 011.516-2.32zM4.896 2.27L21.73 19.104A12.248 12.248 0 0023.25 16.78L7.22 .75A12.248 12.248 0 004.896 2.27zM9.239.008l5.02.222 2.52 2.521A12.27 12.27 0 0123.99 14.76L9.24.008z"/>
      </svg>
    ),
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Create Jira tickets from critical code review findings.',
    category: 'Project Management',
    status: 'disconnected',
    color: '#0052cc',
    icon: <Ticket size={20} />,
  },
  {
    id: 'datadog',
    name: 'Datadog',
    description: 'Export review metrics and quality scores to Datadog dashboards.',
    category: 'Observability',
    status: 'disconnected',
    color: '#632ca6',
    icon: <BarChart2 size={20} />,
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))];

// ── Card ──

function IntegrationCard({ integration, onConnect, onDisconnect, onConfigure }: {
  integration: Integration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onConfigure: (id: string) => void;
}) {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg     = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111'   : '#f8f8f8';
  const textMuted  = L ? '#5f6368' : '#909090';
  const inputBg    = L ? '#f4f5f7' : '#111113';

  const isConnected = integration.status === 'connected';

  return (
    <div className="rounded-2xl border p-5 flex flex-col gap-4 transition-all" style={{ background: cardBg, borderColor: isConnected ? `${integration.color}25` : cardBorder }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: inputBg, borderColor: cardBorder, color: integration.color }}>
            {integration.icon}
          </div>
          <div>
            <p className="text-[14px] font-semibold" style={{ color: textPrimary }}>{integration.name}</p>
            <p className="text-[11.5px] mt-0.5" style={{ color: textMuted }}>{integration.category}</p>
          </div>
        </div>
        {isConnected ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shrink-0">
            <Check size={10} strokeWidth={3} /> Connected
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full border text-[11px] font-medium shrink-0" style={{ color: textMuted, borderColor: cardBorder }}>
            Not connected
          </span>
        )}
      </div>

      <p className="text-[13px]" style={{ color: textMuted }}>{integration.description}</p>

      {isConnected && integration.connectedAs && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ background: inputBg, borderColor: cardBorder }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: cardBorder, color: textMuted }}>J</div>
          <p className="text-[12.5px] font-medium" style={{ color: textPrimary }}>@{integration.connectedAs}</p>
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        {isConnected ? (
          <>
            <button
              onClick={() => onConfigure(integration.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[13px] font-medium transition-all"
              style={{ borderColor: cardBorder, color: textMuted }}
            >
              Configure <ChevronRight size={13} />
            </button>
            <button
              onClick={() => onDisconnect(integration.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[13px] font-medium transition-all text-red-400 border-red-500/20 hover:bg-red-500/6"
            >
              <X size={13} /> Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={() => onConnect(integration.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-bold text-white transition-all"
            style={{ background: '#e11d48' }}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

// ── Configure Modal ──

function ConfigureModal({ integration, onClose, onSave }: { integration: Integration; onClose: () => void; onSave: () => void }) {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg     = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111'   : '#f8f8f8';
  const textMuted  = L ? '#5f6368' : '#909090';
  const inputBg    = L ? '#f4f5f7' : '#111113';

  const [saving, setSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [events, setEvents] = useState({ review: true, patch: true, error: false, scan: false });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { onSave(); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-[480px] rounded-2xl border shadow-2xl animate-in zoom-in-95 fade-in duration-200" style={{ background: cardBg, borderColor: cardBorder }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center border" style={{ background: inputBg, borderColor: cardBorder, color: integration.color }}>
              {integration.icon}
            </div>
            <h3 className="text-[15px] font-bold" style={{ color: textPrimary }}>Configure {integration.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: textMuted }}><X size={17} /></button>
        </div>

        <div className="p-6 space-y-5">
          {(integration.id === 'slack' || integration.id === 'discord') && (
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: textMuted }}>Webhook URL</label>
              <input
                type="url"
                placeholder={integration.id === 'slack' ? 'https://hooks.slack.com/…' : 'https://discord.com/api/webhooks/…'}
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none border"
                style={{ background: inputBg, borderColor: cardBorder, color: textPrimary }}
              />
            </div>
          )}

          <div>
            <p className="text-[12px] font-medium mb-2.5" style={{ color: textMuted }}>Events to send</p>
            <div className="space-y-2">
              {Object.entries(events).map(([key, val]) => {
                const labels: Record<string, string> = { review: 'Review completed', patch: 'Auto-patch opened', error: 'Agent errors', scan: 'Security scan results' };
                return (
                  <label key={key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border" style={{ borderColor: val ? 'rgba(225,29,72,0.25)' : cardBorder, background: val ? 'rgba(225,29,72,0.04)' : 'transparent' }}>
                    <div
                      className="w-4 h-4 rounded border shrink-0 flex items-center justify-center"
                      style={{ background: val ? '#e11d48' : 'transparent', borderColor: val ? '#e11d48' : cardBorder }}
                      onClick={() => setEvents(p => ({ ...p, [key]: !p[key as keyof typeof events] }))}
                    >
                      {val && <Check size={10} strokeWidth={3} className="text-white" />}
                    </div>
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: textPrimary }}
                      onClick={() => setEvents(p => ({ ...p, [key]: !p[key as keyof typeof events] }))}
                    >
                      {labels[key]}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-[13px] font-medium" style={{ borderColor: cardBorder, color: textMuted }}>Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: '#e11d48' }}
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──

export default function IntegrationsPage() {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const textPrimary = L ? '#111'    : '#f8f8f8';
  const textMuted   = L ? '#5f6368' : '#909090';
  const cardBg      = L ? '#ffffff' : '#18181b';
  const cardBorder  = L ? '#e2e4e7' : '#27272a';

  const [list, setList]           = useState(INTEGRATIONS);
  const [category, setCategory]   = useState('All');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [configuring, setConfiguring] = useState<string | null>(null);

  const filtered = category === 'All' ? list : list.filter(i => i.category === category);
  const connectedCount = list.filter(i => i.status === 'connected').length;

  const handleConnect = (id: string) => {
    setConnecting(id);
    setTimeout(() => {
      setList(prev => prev.map(i => i.id === id ? { ...i, status: 'connected', connectedAs: 'CodeWithJagdeep' } : i));
      setConnecting(null);
    }, 1200);
  };

  const handleDisconnect = (id: string) => {
    setList(prev => prev.map(i => i.id === id ? { ...i, status: 'disconnected', connectedAs: undefined } : i));
  };

  const configuringItem = list.find(i => i.id === configuring);

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: textPrimary }}>Integrations</h1>
          <p className="text-[13.5px] mt-1" style={{ color: textMuted }}>
            Connect CodeKang with your tools. {connectedCount} of {list.length} connected.
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="px-3.5 py-1.5 rounded-xl border text-[13px] font-medium transition-all"
            style={{
              borderColor: category === c ? 'rgba(225,29,72,0.35)' : cardBorder,
              background: category === c ? 'rgba(225,29,72,0.06)' : 'transparent',
              color: category === c ? '#e11d48' : textMuted,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(integration => (
          connecting === integration.id ? (
            <div key={integration.id} className="rounded-2xl border p-5 flex items-center justify-center min-h-[180px]" style={{ background: cardBg, borderColor: cardBorder }}>
              <div className="flex items-center gap-3 text-[13px]" style={{ color: textMuted }}>
                <Loader2 size={16} className="animate-spin" />
                Connecting {integration.name}…
              </div>
            </div>
          ) : (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onConfigure={setConfiguring}
            />
          )
        ))}
      </div>

      {configuringItem && (
        <ConfigureModal
          integration={configuringItem}
          onClose={() => setConfiguring(null)}
          onSave={() => {}}
        />
      )}
    </div>
  );
}
