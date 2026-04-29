'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ExternalLink,
  Loader2,
  Plus,
  Settings2,
  X,
} from 'lucide-react';
import { SiBitbucket, SiDiscord, SiGithub, SiGitlab, SiJira, SiLinear, SiNotion, SiSlack } from 'react-icons/si';
import type { IconType } from 'react-icons';
import { useTheme } from '@/lib/theme';
import {
  disconnectIntegration,
  fetchIntegrations,
  type UserIntegration,
  updateIntegrationConfig,
} from '@/lib/integrations';

type IntegrationStatus = 'connected' | 'disabled';

interface IntegrationMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  icon: IconType;
}

interface DisplayIntegration extends IntegrationMeta {
  status: IntegrationStatus;
  connectedAs?: string;
  config: Record<string, string>;
}

const INTEGRATION_META: Record<string, IntegrationMeta> = {
  github: {
    id: 'github',
    name: 'GitHub',
    description: 'Connect repositories and enable automatic PR review triggers.',
    category: 'Source Control',
    color: '#f8f8f8',
    icon: SiGithub,
  },
  gitlab: {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Link GitLab projects and merge requests to CodeKang.',
    category: 'Source Control',
    color: '#fc6d26',
    icon: SiGitlab,
  },
  bitbucket: {
    id: 'bitbucket',
    name: 'Bitbucket',
    description: 'Connect Bitbucket workspaces for AI review and patch workflows.',
    category: 'Source Control',
    color: '#0052cc',
    icon: SiBitbucket,
  },
  slack: {
    id: 'slack',
    name: 'Slack',
    description: 'Receive review alerts and agent notifications in Slack channels.',
    category: 'Communication',
    color: '#4a154b',
    icon: SiSlack,
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    description: 'Receive real-time notifications in your Discord server.',
    category: 'Communication',
    color: '#5865f2',
    icon: SiDiscord,
  },
  linear: {
    id: 'linear',
    name: 'Linear',
    description: 'Create and sync Linear issues from CodeKang findings.',
    category: 'Productivity',
    color: '#5e6ad2',
    icon: SiLinear,
  },
  jira: {
    id: 'jira',
    name: 'Jira',
    description: 'Map reviews and AI workflows directly to Jira tickets.',
    category: 'Productivity',
    color: '#0052cc',
    icon: SiJira,
  },
  notion: {
    id: 'notion',
    name: 'Notion',
    description: 'Sync reports and summaries to your Notion workspace.',
    category: 'Productivity',
    color: '#ffffff',
    icon: SiNotion,
  },

};

function deriveConnectedAs(provider: string, config: Record<string, string>): string | undefined {
  switch (provider) {
    case 'github':
      return config.github_username || config.username || config.account;
    case 'gitlab':
      return config.gitlab_username || config.username || config.workspace;
    case 'bitbucket':
      return config.workspace || config.username;
    case 'slack':
      return config.channel || config.workspace_name;
    case 'discord':
      return config.channel_name || config.channel_id || config.guild_name;
    case 'linear':
      return config.team_id || config.project_name;
    case 'jira':
      return config.project_key || config.cloud_id;
    case 'notion':
      return config.database_id;

    default:
      return undefined;
  }
}

function ConfigureModal({
  integration,
  onClose,
  onSave,
}: {
  integration: DisplayIntegration;
  onClose: () => void;
  onSave: (config: Record<string, string>) => Promise<void>;
}) {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';
  const textPrimary = L ? '#111' : '#f8f8f8';
  const textMuted = L ? '#5f6368' : '#909090';
  const inputBg = L ? '#f4f5f7' : '#111113';

  const [saving, setSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(integration.config.webhook_url ?? '');

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(webhookUrl ? { webhook_url: webhookUrl } : {});
      onClose();
    } finally {
      setSaving(false);
    }
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
              <integration.icon size={18} />
            </div>
            <h3 className="text-[15px] font-bold" style={{ color: textPrimary }}>
              Configure {integration.name}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: textMuted }}>
            <X size={17} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {(integration.id === 'slack' || integration.id === 'discord') && (
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: textMuted }}>
                Webhook URL
              </label>
              <input
                type="url"
                placeholder={
                  integration.id === 'slack'
                    ? 'https://hooks.slack.com/...'
                    : 'https://discord.com/api/webhooks/...'
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

          {integration.id !== 'slack' && integration.id !== 'discord' && (
            <div
              className="rounded-xl border px-4 py-3 text-[13px]"
              style={{ borderColor: cardBorder, color: textMuted }}
            >
              This integration is already connected. Advanced configuration for this provider is managed from the integration marketplace page.
            </div>
          )}

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
                  <Loader2 size={14} className="animate-spin" /> Saving...
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

export default function IntegrationsPage() {
  const { resolved } = useTheme();
  const L = resolved === 'light';
  const textPrimary = L ? '#111' : '#f8f8f8';
  const textMuted = L ? '#5f6368' : '#909090';
  const cardBg = L ? '#ffffff' : '#18181b';
  const cardBorder = L ? '#e2e4e7' : '#27272a';

  const [integrations, setIntegrations] = useState<UserIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchIntegrations()
      .then((data) => {
        if (!cancelled) setIntegrations(data);
      })
      .catch(() => {
        if (!cancelled) setIntegrations([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => {
    const mapped: DisplayIntegration[] = [];
    for (const item of integrations) {
      const meta = INTEGRATION_META[item.provider];
      if (!meta) continue;
      const config = (item.config ?? {}) as Record<string, string>;
      mapped.push({
        ...meta,
        status: item.status,
        config,
        connectedAs: deriveConnectedAs(item.provider, config),
      });
    }
    return mapped.sort((a, b) => a.name.localeCompare(b.name));
  }, [integrations]);

  const connectedList = list.filter((i) => i.status === 'connected');
  const configuringItem = list.find((i) => i.id === configuring);

  const handleDisconnect = async (id: string) => {
    setDisconnecting(id);
    try {
      await disconnectIntegration(id);
      setIntegrations((prev) => prev.filter((item) => item.provider !== id));
    } finally {
      setDisconnecting(null);
    }
  };

  const handleSaveConfig = async (provider: string, config: Record<string, string>) => {
    const updated = await updateIntegrationConfig(provider, config);
    setIntegrations((prev) =>
      prev.map((item) => (item.provider === provider ? updated : item)),
    );
  };

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: textPrimary }}>
            Integrations
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: textMuted }}>
            Manage your connected services and account links.
          </p>
        </div>
        <Link
          href="/dashboard/integrations"
          className="flex items-center gap-2 px-4 py-2.5 rounded-md text-[13px] font-bold text-white shadow-lg shadow-indigo-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: '#6366f1' }}
        >
          <Plus size={16} /> Add Plug
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="py-12 text-center rounded-md border border-dashed" style={{ borderColor: cardBorder }}>
            <Loader2 size={18} className="animate-spin mx-auto mb-3" style={{ color: textMuted }} />
            <p className="text-[14px] font-medium" style={{ color: textMuted }}>
              Loading integrations...
            </p>
          </div>
        ) : connectedList.length === 0 ? (
          <div className="py-12 text-center rounded-md border border-dashed" style={{ borderColor: cardBorder }}>
            <p className="text-[14px] font-medium" style={{ color: textMuted }}>
              No active integrations
            </p>
            <Link
              href="/dashboard/integrations"
              className="text-[13px] text-indigo-400 hover:underline mt-2 inline-block"
            >
              Browse integrations to connect
            </Link>
          </div>
        ) : (
          connectedList.map((integration) => (
            <div
              key={integration.id}
              className="rounded-md border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              style={{ background: cardBg, borderColor: cardBorder }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-md flex items-center justify-center shrink-0 border"
                  style={{
                    background: '#111113',
                    borderColor: cardBorder,
                    color: integration.color,
                  }}
                >
                  <integration.icon size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold" style={{ color: textPrimary }}>
                      {integration.name}
                    </p>
                    <span className="px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      Connected
                    </span>
                  </div>
                  <p className="text-[12.5px] mt-1" style={{ color: textMuted }}>
                    {integration.connectedAs
                      ? <>Connected as <span className="font-semibold" style={{ color: textPrimary }}>{integration.connectedAs}</span></>
                      : integration.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfiguring(integration.id)}
                  className="px-4 py-2 rounded-md border text-[13px] font-medium transition-all hover:bg-white/5 active:scale-95"
                  style={{ borderColor: cardBorder, color: textMuted }}
                >
                  Configure
                </button>
                <button
                  onClick={() => handleDisconnect(integration.id)}
                  disabled={disconnecting === integration.id}
                  className="px-4 py-2 rounded-md border text-[13px] font-medium transition-all text-red-500 border-red-500/10 hover:bg-red-500/5 active:scale-95 disabled:opacity-70"
                >
                  {disconnecting === integration.id ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        className="mt-8 p-6 rounded-md border bg-linear-to-b from-transparent to-indigo-500/5"
        style={{ borderColor: cardBorder }}
      >
        <h3 className="text-[16px] font-bold" style={{ color: textPrimary }}>
          Need more?
        </h3>
        <p className="text-[13px] mt-2 mb-4" style={{ color: textMuted }}>
          Explore the full integration marketplace to connect more tools and configure provider-specific options.
        </p>
        <Link
          href="/dashboard/integrations"
          className="text-indigo-400 text-[13px] font-bold flex items-center gap-1.5 hover:gap-2 transition-all"
        >
          View integration marketplace <ExternalLink size={14} />
        </Link>
      </div>

      {configuringItem && (
        <ConfigureModal
          integration={configuringItem}
          onClose={() => setConfiguring(null)}
          onSave={(config) => handleSaveConfig(configuringItem.id, config)}
        />
      )}
    </div>
  );
}
