'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Loader2,
  Settings2,
  MoreHorizontal,
  AlertTriangle,
  Plug,
  Unplug,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  SiGithub,
  SiGitlab,
  SiSlack,
  SiDiscord,
  SiLinear,
  SiJira,
  SiNotion,
  SiVercel,
  SiSentry,
  SiBitbucket,
} from 'react-icons/si';
import { IconType } from 'react-icons';
import CodeKangIcon from '@/public/logo/favi.png';
import {
  fetchIntegrations,
  connectIntegration,
  disconnectIntegration,
  updateIntegrationStatus,
  updateIntegrationConfig,
  type UserIntegration,
} from '@/lib/integrations';

// ── Types ──

type IntegrationCategory = 'All' | 'Source Control' | 'Communication' | 'Productivity' | 'Observation';

interface ProviderField {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'password' | 'url';
  hint?: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: IconType;
  color: string;
  bgColor: string;
  docsUrl: string;
  fields: ProviderField[];
}

// ── Provider field definitions ──

const PROVIDER_FIELDS: Record<string, ProviderField[]> = {
  slack: [
    {
      key: 'webhook_url',
      label: 'Incoming Webhook URL',
      placeholder: 'https://hooks.slack.com/services/...',
      type: 'url',
      hint: 'Create one at api.slack.com → Your Apps → Incoming Webhooks',
    },
  ],
  discord: [
    {
      key: 'webhook_url',
      label: 'Discord Webhook URL',
      placeholder: 'https://discord.com/api/webhooks/...',
      type: 'url',
      hint: 'Channel Settings → Integrations → Webhooks → New Webhook',
    },
  ],
  linear: [
    {
      key: 'api_key',
      label: 'API Key',
      placeholder: 'lin_api_...',
      type: 'password',
      hint: 'Settings → API → Personal API keys',
    },
    {
      key: 'team_id',
      label: 'Team ID',
      placeholder: 'Your Linear team ID',
    },
  ],
  jira: [
    {
      key: 'domain',
      label: 'Jira Domain',
      placeholder: 'yourcompany.atlassian.net',
    },
    {
      key: 'email',
      label: 'Account Email',
      placeholder: 'you@company.com',
    },
    {
      key: 'api_token',
      label: 'API Token',
      placeholder: 'Your Atlassian API token',
      type: 'password',
      hint: 'id.atlassian.com → Security → API tokens',
    },
    {
      key: 'project_key',
      label: 'Project Key',
      placeholder: 'e.g. PROJ',
    },
  ],
  notion: [
    {
      key: 'token',
      label: 'Integration Token',
      placeholder: 'secret_...',
      type: 'password',
      hint: 'notion.so/my-integrations → New integration → Internal Integration Token',
    },
    {
      key: 'database_id',
      label: 'Database ID',
      placeholder: '32-char Notion database ID',
      hint: 'Found in the database URL: notion.so/.../<database-id>?v=...',
    },
  ],
  sentry: [
    {
      key: 'dsn',
      label: 'Sentry DSN',
      placeholder: 'https://...@sentry.io/...',
      type: 'url',
      hint: 'Project → Settings → Client Keys (DSN)',
    },
  ],
  vercel: [
    {
      key: 'deploy_hook_url',
      label: 'Deploy Hook URL',
      placeholder: 'https://api.vercel.com/v1/integrations/deploy/...',
      type: 'url',
      hint: 'Project → Settings → Git → Deploy Hooks',
    },
    {
      key: 'project_name',
      label: 'Project Name',
      placeholder: 'my-vercel-project',
    },
  ],
  gitlab: [
    {
      key: 'access_token',
      label: 'Personal Access Token',
      placeholder: 'glpat-...',
      type: 'password',
      hint: 'Profile → Preferences → Access Tokens → Add new token (api scope)',
    },
    {
      key: 'instance_url',
      label: 'GitLab Instance URL',
      placeholder: 'https://gitlab.com',
    },
  ],
  bitbucket: [
    {
      key: 'username',
      label: 'Bitbucket Username',
      placeholder: 'your-username',
    },
    {
      key: 'app_password',
      label: 'App Password',
      placeholder: 'Your Bitbucket app password',
      type: 'password',
      hint: 'Account → Personal settings → App passwords',
    },
    {
      key: 'workspace',
      label: 'Workspace Slug',
      placeholder: 'your-workspace-slug',
    },
  ],
  github: [],
};

// ── Static integration metadata ──

const INTEGRATIONS: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'AI-powered code reviews, automated bug fixing, and deep PR insights directly in your GitHub workflow.',
    category: 'Source Control',
    icon: SiGithub,
    color: '#e8e8e8',
    bgColor: 'rgba(232,232,232,0.08)',
    docsUrl: 'https://docs.codekang.dev/integrations/github',
    fields: [],
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Sync GitLab projects to enable automated code analysis and AI-driven issue resolution across your pipelines.',
    category: 'Source Control',
    icon: SiGitlab,
    color: '#FC6D26',
    bgColor: 'rgba(252,109,38,0.08)',
    docsUrl: 'https://docs.codekang.dev/integrations/gitlab',
    fields: PROVIDER_FIELDS.gitlab,
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    description: 'Integrate Bitbucket repos for seamless AI patching and automated security vulnerability scanning.',
    category: 'Source Control',
    icon: SiBitbucket,
    color: '#0052CC',
    bgColor: 'rgba(0,82,204,0.08)',
    docsUrl: 'https://docs.codekang.dev/integrations/bitbucket',
    fields: PROVIDER_FIELDS.bitbucket,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Receive real-time notifications in Slack when CodeKang fixes an issue or a PR review completes.',
    category: 'Communication',
    icon: SiSlack,
    color: '#4A154B',
    bgColor: 'rgba(74,21,75,0.12)',
    docsUrl: 'https://docs.codekang.dev/integrations/slack',
    fields: PROVIDER_FIELDS.slack,
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Keep your dev team in sync with real-time PR alerts and AI progress updates in your Discord server.',
    category: 'Communication',
    icon: SiDiscord,
    color: '#5865F2',
    bgColor: 'rgba(88,101,242,0.08)',
    docsUrl: 'https://docs.codekang.dev/integrations/discord',
    fields: PROVIDER_FIELDS.discord,
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Automatically create and sync Linear issues with AI-detected bugs and suggested fix branches.',
    category: 'Productivity',
    icon: SiLinear,
    color: '#5E6AD2',
    bgColor: 'rgba(94,106,210,0.08)',
    docsUrl: 'https://docs.codekang.dev/integrations/linear',
    fields: PROVIDER_FIELDS.linear,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Enterprise task tracking for AI workflows. Map CodeKang findings directly to Jira tickets and epics.',
    category: 'Productivity',
    icon: SiJira,
    color: '#0052CC',
    bgColor: 'rgba(0,82,204,0.08)',
    docsUrl: 'https://docs.codekang.dev/integrations/jira',
    fields: PROVIDER_FIELDS.jira,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync code analysis reports and review summaries directly to your Notion workspace.',
    category: 'Productivity',
    icon: SiNotion,
    color: '#ffffff',
    bgColor: 'rgba(255,255,255,0.06)',
    docsUrl: 'https://docs.codekang.dev/integrations/notion',
    fields: PROVIDER_FIELDS.notion,
  },
  {
    id: 'sentry',
    name: 'Sentry',
    description: 'Send CodeKang errors to Sentry automatically. Identify production issues the moment they surface.',
    category: 'Observation',
    icon: SiSentry,
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.08)',
    docsUrl: 'https://docs.codekang.dev/integrations/sentry',
    fields: PROVIDER_FIELDS.sentry,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Trigger preview deploys automatically after CodeKang merges an AI-vetted fix.',
    category: 'Observation',
    icon: SiVercel,
    color: '#ffffff',
    bgColor: 'rgba(255,255,255,0.06)',
    docsUrl: 'https://docs.codekang.dev/integrations/vercel',
    fields: PROVIDER_FIELDS.vercel,
  },
];

// ── Toggle ──

const Toggle = ({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) => (
  <button
    onClick={(e) => { e.stopPropagation(); if (!disabled) onChange(!enabled); }}
    disabled={disabled}
    aria-checked={enabled}
    role="switch"
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      enabled ? 'bg-emerald-500' : 'bg-[#3f3f46]'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        enabled ? 'translate-x-4' : 'translate-x-0'
      }`}
    />
  </button>
);

// ── Field Input ──

const FieldInput = ({
  field,
  value,
  onChange,
}: {
  field: ProviderField;
  value: string;
  onChange: (val: string) => void;
}) => {
  const [show, setShow] = useState(false);
  const isSecret = field.type === 'password';

  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium text-[#a1a1aa]">
        {field.label}
      </label>
      <div className="relative flex items-center">
        <input
          type={isSecret && !show ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2.5 text-[13px] text-[#f4f4f5] placeholder-[#3f3f46] focus:outline-none focus:border-[#52525b] transition-colors pr-10 font-mono"
        />
        {isSecret && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {field.hint && (
        <p className="text-[11px] text-[#52525b] leading-relaxed">{field.hint}</p>
      )}
    </div>
  );
};

// ── Connect Modal ──

const ConnectModal = ({
  isOpen,
  onClose,
  integration,
  onConnected,
}: {
  isOpen: boolean;
  onClose: () => void;
  integration: Integration | null;
  onConnected: (saved: UserIntegration) => void;
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) { setFormData({}); setError(null); }
  }, [isOpen, integration?.id]);

  if (!isOpen || !integration) return null;

  const ServiceIcon = integration.icon;
  const fields = integration.fields;
  const allFilled = fields.every((f) => (formData[f.key] ?? '').trim() !== '');

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const saved = await connectIntegration(integration.id, formData);
      onConnected(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#f8f9fa] w-full max-w-[480px] rounded-[24px] overflow-hidden shadow-2xl border border-white animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-[#5f6368] transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {/* Header icons */}
          <div className="flex items-center gap-6 mb-6 relative justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center p-2.5 z-10">
              <Image src={CodeKangIcon} alt="CodeKang" width={44} height={44} className="object-contain" />
            </div>
            <div className="w-10 h-[2px] bg-gray-200 relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#f8423b] to-transparent animate-[shimmer_2s_infinite]" />
            </div>
            <div
              className="w-16 h-16 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center p-3 z-10"
              style={{ backgroundColor: integration.bgColor }}
            >
              <ServiceIcon size={34} style={{ color: integration.color === '#ffffff' ? '#1c1c1c' : integration.color }} />
            </div>
          </div>

          <h2 className="text-[20px] font-bold text-[#1c1c1c] mb-1 text-center">
            Connect {integration.name}
          </h2>
          <p className="text-[13px] text-[#5f6368] mb-6 text-center">
            Enter your {integration.name} credentials to enable the integration.
          </p>

          {/* Fields */}
          {fields.length > 0 ? (
            <div className="space-y-4 mb-6 bg-[#f0f0f0] rounded-xl p-4">
              {fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={formData[field.key] ?? ''}
                  onChange={(val) => setFormData((prev) => ({ ...prev, [field.key]: val }))}
                />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#5f6368] mb-6 text-center italic">
              This integration is managed automatically via your GitHub account.
            </p>
          )}

          {error && (
            <p className="text-[13px] text-red-500 mb-4 text-center">{error}</p>
          )}

          <button
            onClick={fields.length > 0 ? handleSubmit : onClose}
            disabled={loading || (fields.length > 0 && !allFilled)}
            className="w-full bg-[#1c1c1c] text-white py-3.5 rounded-xl font-semibold text-[15px] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Connecting…</>
            ) : (
              <><Plug size={16} /> Connect {integration.name}</>
            )}
          </button>

          <button onClick={onClose} className="mt-4 w-full text-[13px] font-medium text-[#5f6368] hover:text-[#1c1c1c] transition-colors text-center">
            Not now
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
};

// ── Disconnect Modal ──

const DisconnectModal = ({
  isOpen,
  onClose,
  integration,
  onDisconnected,
}: {
  isOpen: boolean;
  onClose: () => void;
  integration: Integration | null;
  onDisconnected: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  if (!isOpen || !integration) return null;

  const ServiceIcon = integration.icon;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await disconnectIntegration(integration.id);
      onDisconnected();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#18181b] w-full max-w-[420px] rounded-[20px] overflow-hidden shadow-2xl border border-[#27272a] animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-[#71717a] transition-colors">
          <X size={18} />
        </button>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: integration.bgColor }}>
              <ServiceIcon size={26} style={{ color: integration.color === '#ffffff' ? '#1c1c1c' : integration.color }} />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-[#f4f4f5]">Disconnect {integration.name}?</h2>
              <p className="text-[13px] text-[#71717a] mt-0.5">This will remove CodeKang&apos;s access</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-6">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
              Active automations using {integration.name} will stop working immediately. You can reconnect at any time.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#27272a] text-[14px] font-medium text-[#a1a1aa] hover:bg-white/5 hover:text-[#f4f4f5] transition-all">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[14px] font-semibold text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Disconnecting…</> : <><Unplug size={15} /> Disconnect</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Configure Modal ──

const ConfigureModal = ({
  isOpen,
  onClose,
  integration,
  currentConfig,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  integration: Integration | null;
  currentConfig: Record<string, string>;
  onSaved: (updated: UserIntegration) => void;
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) { setFormData({ ...currentConfig }); setError(null); setSaved(false); }
  }, [isOpen, currentConfig]);

  if (!isOpen || !integration) return null;

  const ServiceIcon = integration.icon;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateIntegrationConfig(integration.id, formData);
      onSaved(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
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
        className="relative bg-[#18181b] w-full max-w-[480px] rounded-[20px] overflow-hidden shadow-2xl border border-[#27272a] animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: integration.bgColor }}>
              <ServiceIcon size={20} style={{ color: integration.color === '#ffffff' ? '#1c1c1c' : integration.color }} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#f4f4f5]">{integration.name} Settings</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[12px] text-emerald-400">Connected</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-[#71717a] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {integration.fields.length > 0 ? (
            integration.fields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={formData[field.key] ?? ''}
                onChange={(val) => setFormData((prev) => ({ ...prev, [field.key]: val }))}
              />
            ))
          ) : (
            <p className="text-[13px] text-[#52525b] text-center py-4">No configurable settings for this integration.</p>
          )}

          {error && <p className="text-[13px] text-red-400">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <a
              href={integration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13px] text-[#71717a] hover:text-[#a1a1aa] transition-colors"
            >
              <ExternalLink size={13} />
              View docs
            </a>
            {integration.fields.length > 0 && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="ml-auto px-5 py-2 rounded-xl bg-[#f4f4f5] text-[#1c1c1c] text-[14px] font-semibold hover:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : saved ? '✓ Saved' : 'Save changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Card Menu ──

const CardMenu = ({ onConfigure, onDisconnect }: { onConfigure: () => void; onDisconnect: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 rounded-lg hover:bg-white/8 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="absolute right-0 top-8 w-[160px] bg-[#121214] border border-[#27272a] rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onConfigure(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/5 transition-colors"
            >
              <Settings2 size={14} /> Configure
            </button>
            <div className="h-px bg-[#27272a]" />
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onDisconnect(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
            >
              <Unplug size={14} /> Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ── Page ──

export default function IntegrationsPage() {
  const [dbIntegrations, setDbIntegrations] = useState<UserIntegration[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [connectModal, setConnectModal] = useState<Integration | null>(null);
  const [disconnectModal, setDisconnectModal] = useState<Integration | null>(null);
  const [configureModal, setConfigureModal] = useState<Integration | null>(null);

  // Load from API on mount
  const loadIntegrations = useCallback(async () => {
    try {
      const data = await fetchIntegrations();
      setDbIntegrations(data);
    } catch {
      // fail silently — page still usable without the server response
    } finally {
      setLoadingInit(false);
    }
  }, []);

  useEffect(() => { void loadIntegrations(); }, [loadIntegrations]);

  const getDb = (id: string) => dbIntegrations.find((i) => i.provider === id);
  const isConnected = (id: string) => id === 'github' || !!getDb(id);
  const isEnabled = (id: string) => {
    if (id === 'github') return true;
    const db = getDb(id);
    return db ? db.status === 'connected' : false;
  };

  const handleConnected = (saved: UserIntegration) => {
    setDbIntegrations((prev) => {
      const filtered = prev.filter((i) => i.provider !== saved.provider);
      return [saved, ...filtered];
    });
  };

  const handleDisconnected = (provider: string) => {
    setDbIntegrations((prev) => prev.filter((i) => i.provider !== provider));
  };

  const handleConfigSaved = (updated: UserIntegration) => {
    setDbIntegrations((prev) =>
      prev.map((i) => (i.provider === updated.provider ? updated : i)),
    );
  };

  const handleToggle = async (item: Integration, nextEnabled: boolean) => {
    if (item.id === 'github') return;
    setTogglingId(item.id);
    try {
      const updated = await updateIntegrationStatus(
        item.id,
        nextEnabled ? 'connected' : 'disabled',
      );
      setDbIntegrations((prev) =>
        prev.map((i) => (i.provider === item.id ? updated : i)),
      );
    } finally {
      setTogglingId(null);
    }
  };

  const connectedCount = INTEGRATIONS.filter((i) => isConnected(i.id)).length;

  return (
    <div className="flex-1 flex flex-col bg-[#1c1c1c] min-h-screen">
      {/* Header */}
      <div className="px-4 md:px-8 pt-10 pb-6 shrink-0">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-[26px] md:text-[32px] font-semibold text-[#f4f4f5] tracking-tight leading-tight">
              Integrations
            </h1>
            <p className="text-[14px] text-[#71717a] mt-1.5 leading-relaxed max-w-xl">
              Connect CodeKang to your development stack for automated AI reviews, issue tracking, and deployment workflows.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
              {loadingInit ? (
                <Loader2 size={14} className="animate-spin text-[#52525b]" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              )}
              <span className="text-[13px] font-medium text-[#f4f4f5]">{connectedCount}</span>
              <span className="text-[13px] text-[#52525b]">/ {INTEGRATIONS.length} connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="px-4 md:px-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {INTEGRATIONS.map((item) => {
            const connected = isConnected(item.id);
            const enabled = isEnabled(item.id);
            const toggling = togglingId === item.id;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className={`group relative bg-linear-to-br from-[#1c1c1f] to-[#161618] border rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 ${
                  connected
                    ? 'border-[#27272a] hover:border-[#404040] hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]'
                    : 'border-[#27272a]/60 hover:border-[#3b82f6]/40 hover:bg-[#1e1e21] cursor-pointer hover:shadow-[0_8px_30px_rgba(59,130,246,0.05)]'
                }`}
                onClick={() => { if (!connected) setConnectModal(item); }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 shadow-lg"
                  style={{
                    backgroundColor: item.bgColor,
                    boxShadow: connected ? `0 0 20px -5px ${item.color === '#ffffff' ? '#ffffff22' : item.color + '33'}` : 'none',
                  }}
                >
                  <Icon size={20} style={{ color: item.color === '#ffffff' ? '#ffffff' : item.color, filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.2))' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[16px] font-semibold text-[#f4f4f5] tracking-tight">{item.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#27272a]/80 text-[10px] font-medium uppercase tracking-wider text-[#71717a] border border-[#27272a]">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#71717a] leading-relaxed line-clamp-1 md:line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#27272a]/40">
                  {connected ? (
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-tighter">Status</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                            <span className={`text-[12px] font-semibold ${enabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {enabled ? 'Active' : 'Paused'}
                            </span>
                          </div>
                        </div>
                        <Toggle
                          enabled={enabled}
                          disabled={toggling || item.id === 'github'}
                          onChange={(val) => void handleToggle(item, val)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfigureModal(item); }}
                          className="p-2 rounded-lg hover:bg-white/10 text-[#a1a1aa] hover:text-[#f4f4f5] transition-all duration-200"
                          title="Configure"
                        >
                          <Settings2 size={16} />
                        </button>
                        {item.id !== 'github' && (
                          <CardMenu
                            onConfigure={() => setConfigureModal(item)}
                            onDisconnect={() => setDisconnectModal(item)}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConnectModal(item); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-[13px] font-bold text-blue-400 hover:text-blue-300 transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                    >
                      <Plug size={13} />
                      Connect
                    </button>
                  )}
                </div>

                {connected && enabled && (
                  <div className="absolute top-0 bottom-0 left-0 w-[2px] rounded-r-full bg-emerald-500/40" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <ConnectModal
        key={connectModal?.id}
        isOpen={!!connectModal}
        onClose={() => setConnectModal(null)}
        integration={connectModal}
        onConnected={handleConnected}
      />

      <DisconnectModal
        key={`d-${disconnectModal?.id}`}
        isOpen={!!disconnectModal}
        onClose={() => setDisconnectModal(null)}
        integration={disconnectModal}
        onDisconnected={() => { if (disconnectModal) handleDisconnected(disconnectModal.id); }}
      />

      <ConfigureModal
        key={`c-${configureModal?.id}`}
        isOpen={!!configureModal}
        onClose={() => setConfigureModal(null)}
        integration={configureModal}
        currentConfig={(configureModal ? getDb(configureModal.id)?.config ?? {} : {}) as Record<string, string>}
        onSaved={handleConfigSaved}
      />
    </div>
  );
}
