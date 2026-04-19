'use client';

import {
  Check,
  X,
  ChevronRight,
  Loader2,
  Plus,
  Settings2,
  ExternalLink,
  Ticket,
  BarChart2,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/lib/theme';
import Link from 'next/link';

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
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
    </svg>
  );
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    description:
      'Connect repositories and enable automatic PR review triggers.',
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
    description:
      'Receive review alerts and agent notifications in Slack channels.',
    category: 'Communication',
    status: 'disconnected',
    color: '#4a154b',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z" />
      </svg>
    ),
  },
];

// ── Configure Modal ──

function ConfigureModal({
  integration,
  onClose,
  onSave,
}: {
  integration: Integration;
  onClose: () => void;
  onSave: () => void;
}) {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111' : '#f8f8f8';
  const textMuted = L ? '#5f6368' : '#909090';
  const inputBg = L ? '#f4f5f7' : '#111113';

  const [saving, setSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [events, setEvents] = useState({
    review: true,
    patch: true,
    error: false,
    scan: false,
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave();
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[480px] rounded-2xl border shadow-2xl animate-in zoom-in-95 fade-in duration-200"
        style={{ background: cardBg, borderColor: cardBorder }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: cardBorder }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border"
              style={{
                background: inputBg,
                borderColor: cardBorder,
                color: integration.color,
              }}
            >
              {integration.icon}
            </div>
            <h3
              className="text-[15px] font-bold"
              style={{ color: textPrimary }}
            >
              Configure {integration.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ color: textMuted }}
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {(integration.id === 'slack' || integration.id === 'discord') && (
            <div>
              <label
                className="block text-[12px] font-medium mb-1.5"
                style={{ color: textMuted }}
              >
                Webhook URL
              </label>
              <input
                type="url"
                placeholder={
                  integration.id === 'slack'
                    ? 'https://hooks.slack.com/…'
                    : 'https://discord.com/api/webhooks/…'
                }
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none border"
                style={{
                  background: inputBg,
                  borderColor: cardBorder,
                  color: textPrimary,
                }}
              />
            </div>
          )}

          <div>
            <p
              className="text-[12px] font-medium mb-2.5"
              style={{ color: textMuted }}
            >
              Events to send
            </p>
            <div className="space-y-2">
              {Object.entries(events).map(([key, val]) => {
                const labels: Record<string, string> = {
                  review: 'Review completed',
                  patch: 'Auto-patch opened',
                  error: 'Agent errors',
                  scan: 'Security scan results',
                };
                return (
                  <label
                    key={key}
                    className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border"
                    style={{
                      borderColor: val ? 'rgba(225,29,72,0.25)' : cardBorder,
                      background: val ? 'rgba(225,29,72,0.04)' : 'transparent',
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all"
                      style={{
                        background: val ? '#e11d48' : 'transparent',
                        borderColor: val ? '#e11d48' : cardBorder,
                      }}
                      onClick={() =>
                        setEvents((p) => ({
                          ...p,
                          [key]: !p[key as keyof typeof events],
                        }))
                      }
                    >
                      {val && (
                        <Check
                          size={10}
                          strokeWidth={3}
                          className="text-white"
                        />
                      )}
                    </div>
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: textPrimary }}
                      onClick={() =>
                        setEvents((p) => ({
                          ...p,
                          [key]: !p[key as keyof typeof events],
                        }))
                      }
                    >
                      {labels[key]}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border text-[13px] font-medium"
              style={{ borderColor: cardBorder, color: textMuted }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-70 transition-all shadow-lg shadow-rose-500/10"
              style={{ background: '#e11d48' }}
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                'Save'
              )}
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
  const textPrimary = L ? '#111' : '#f8f8f8';
  const textMuted = L ? '#5f6368' : '#909090';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';

  const [list, setList] = useState(INTEGRATIONS);
  const [configuring, setConfiguring] = useState<string | null>(null);

  const connectedList = list.filter((i) => i.status === 'connected');

  const handleDisconnect = (id: string) => {
    setList((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'disconnected', connectedAs: undefined }
          : i,
      ),
    );
  };

  const configuringItem = list.find((i) => i.id === configuring);

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-[24px] font-bold tracking-tight"
            style={{ color: textPrimary }}
          >
            Integrations
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: textMuted }}>
            Manage your connected services and account links.
          </p>
        </div>
        <Link
          href="/dashboard/integrations"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-lg shadow-rose-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: '#e11d48' }}
        >
          <Plus size={16} /> Add Plug
        </Link>
      </div>

      {/* Connected List */}
      <div className="flex flex-col gap-4">
        {connectedList.length === 0 ? (
          <div
            className="py-12 text-center rounded-2xl border border-dashed"
            style={{ borderColor: cardBorder }}
          >
            <p className="text-[14px] font-medium" style={{ color: textMuted }}>
              No active integrations
            </p>
            <Link
              href="/dashboard/integrations"
              className="text-[13px] text-rose-500 hover:underline mt-2 inline-block"
            >
              Browse integrations to connect
            </Link>
          </div>
        ) : (
          connectedList.map((integration) => (
            <div
              key={integration.id}
              className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              style={{ background: cardBg, borderColor: cardBorder }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    background: '#111113',
                    borderColor: cardBorder,
                    color: integration.color,
                  }}
                >
                  {integration.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p
                      className="text-[15px] font-bold"
                      style={{ color: textPrimary }}
                    >
                      {integration.name}
                    </p>
                    <span className="px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      Connected
                    </span>
                  </div>
                  {integration.connectedAs && (
                    <p
                      className="text-[12.5px] mt-1"
                      style={{ color: textMuted }}
                    >
                      Connected as{' '}
                      <span
                        className="font-semibold"
                        style={{ color: textPrimary }}
                      >
                        @{integration.connectedAs}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfiguring(integration.id)}
                  className="px-4 py-2 rounded-xl border text-[13px] font-medium transition-all hover:bg-white/5 active:scale-95"
                  style={{ borderColor: cardBorder, color: textMuted }}
                >
                  Configure
                </button>
                <button
                  onClick={() => handleDisconnect(integration.id)}
                  className="px-4 py-2 rounded-xl border text-[13px] font-medium transition-all text-red-400 border-red-500/10 hover:bg-red-500/5 active:scale-95"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        className="mt-8 p-6 rounded-2xl border bg-linear-to-b from-transparent to-[#e11d48]/5"
        style={{ borderColor: cardBorder }}
      >
        <h3 className="text-[16px] font-bold" style={{ color: textPrimary }}>
          Need more?
        </h3>
        <p className="text-[13px] mt-2 mb-4" style={{ color: textMuted }}>
          Explore our marketplace to find more tools for your workflow, from
          CI/CD to observability.
        </p>
        <Link
          href="/dashboard/integrations"
          className="text-rose-500 text-[13px] font-bold flex items-center gap-1.5 hover:gap-2 transition-all"
        >
          View integration marketplace <ExternalLink size={14} />
        </Link>
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
