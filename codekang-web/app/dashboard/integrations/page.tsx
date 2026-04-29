'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
  CheckCircle2,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  SiGithub,
  SiGitlab,
  SiSlack,
  SiDiscord,
  SiLinear,
  SiJira,
  SiNotion,
  SiBitbucket,
} from 'react-icons/si';
import { IconType } from 'react-icons';
import CodeKangIcon from '@/public/logo/favi.png';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  fetchIntegrations,
  connectIntegration,
  disconnectIntegration,
  updateIntegrationStatus,
  updateIntegrationConfig,
  testIntegration,
  getOAuthUrl,
  type UserIntegration,
} from '@/lib/integrations';
import { getGitHubAppInstallUrl, getGitHubAppSetupUrl } from '@/lib/auth';

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
  oauth?: boolean; // uses OAuth flow instead of manual credential form
}

// ── Provider field definitions ──

const PROVIDER_FIELDS: Record<string, ProviderField[]> = {
  slack: [
    {
      key: 'channel',
      label: 'Notification Channel',
      placeholder: '#dev-alerts',
      hint: 'The Slack channel where CodeKang posts PR and agent updates. Must start with #.',
    },
  ],
  discord: [
    {
      key: 'channel_id',
      label: 'Channel ID',
      placeholder: '123456789012345678',
      hint: 'Right-click the channel in Discord → Copy Channel ID. Enable Developer Mode in Discord Settings → Advanced first.',
    },
    {
      key: 'channel_name',
      label: 'Channel Name (display only)',
      placeholder: '#code-reviews',
      hint: 'Just for your reference — shown in the dashboard so you know which channel is active.',
    },
  ],
  linear: [
    {
      key: 'team_id',
      label: 'Team ID',
      placeholder: 'e.g. ENG',
      hint: 'Linear → Settings → Teams — copy the team identifier shown next to the team name.',
    },
    {
      key: 'project_name',
      label: 'Project (optional)',
      placeholder: 'e.g. Backend',
      hint: 'If set, CodeKang issues will be created inside this Linear project.',
    },
  ],
  jira: [
    {
      key: 'project_key',
      label: 'Project Key',
      placeholder: 'e.g. PROJ',
      hint: 'Found next to every issue in Jira — e.g. PROJ in PROJ-123',
    },
  ],
  notion: [
    {
      key: 'database_id',
      label: 'Database ID',
      placeholder: '32-char Notion database ID',
      hint: 'Open the database in browser — copy the ID from the URL between the last / and ?',
    },
  ],

  gitlab: [
    {
      key: 'default_branch',
      label: 'Default Branch',
      placeholder: 'main',
      hint: 'The branch CodeKang targets for reviews. Defaults to main if left blank.',
    },
  ],
  bitbucket: [
    {
      key: 'workspace',
      label: 'Workspace Slug',
      placeholder: 'my-workspace',
      hint: 'Your Bitbucket workspace slug — visible in the URL: bitbucket.org/{workspace}/...',
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
    docsUrl: 'https://docs.codekang.com/integrations/github',
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
    docsUrl: 'https://docs.codekang.com/integrations/gitlab',
    fields: PROVIDER_FIELDS.gitlab,
    oauth: true,
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    description: 'Integrate Bitbucket repos for seamless AI patching and automated security vulnerability scanning.',
    category: 'Source Control',
    icon: SiBitbucket,
    color: '#0052CC',
    bgColor: 'rgba(0,82,204,0.08)',
    docsUrl: 'https://docs.codekang.com/integrations/bitbucket',
    fields: PROVIDER_FIELDS.bitbucket,
    oauth: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Receive real-time notifications in Slack when CodeKang fixes an issue or a PR review completes.',
    category: 'Communication',
    icon: SiSlack,
    color: '#4A154B',
    bgColor: 'rgba(74,21,75,0.12)',
    docsUrl: 'https://docs.codekang.com/integrations/slack',
    fields: PROVIDER_FIELDS.slack,
    oauth: true,
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Keep your dev team in sync with real-time PR alerts and AI progress updates in your Discord server.',
    category: 'Communication',
    icon: SiDiscord,
    color: '#5865F2',
    bgColor: 'rgba(88,101,242,0.08)',
    docsUrl: 'https://docs.codekang.com/integrations/discord',
    fields: PROVIDER_FIELDS.discord,
    oauth: true,
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Automatically create and sync Linear issues with AI-detected bugs and suggested fix branches.',
    category: 'Productivity',
    icon: SiLinear,
    color: '#5E6AD2',
    bgColor: 'rgba(94,106,210,0.08)',
    docsUrl: 'https://docs.codekang.com/integrations/linear',
    fields: PROVIDER_FIELDS.linear,
    oauth: true,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Enterprise task tracking for AI workflows. Map CodeKang findings directly to Jira tickets and epics.',
    category: 'Productivity',
    icon: SiJira,
    color: '#0052CC',
    bgColor: 'rgba(0,82,204,0.08)',
    docsUrl: 'https://docs.codekang.com/integrations/jira',
    fields: PROVIDER_FIELDS.jira,
    oauth: true,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync code analysis reports and review summaries directly to your Notion workspace.',
    category: 'Productivity',
    icon: SiNotion,
    color: '#ffffff',
    bgColor: 'rgba(255,255,255,0.06)',
    docsUrl: 'https://docs.codekang.com/integrations/notion',
    fields: PROVIDER_FIELDS.notion,
    oauth: true,
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
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-emerald-500' : 'bg-[#3f3f46]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-4' : 'translate-x-0'
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
  const isOAuth = integration.oauth === true;
  const allFilled = fields.every((f) => (formData[f.key] ?? '').trim() !== '');

  const handleOAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await getOAuthUrl(integration.id);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth setup failed');
      setLoading(false);
    }
  };

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

  const iconColor = integration.color === '#ffffff' ? '#1c1c1c' : integration.color;

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
              <ServiceIcon size={34} style={{ color: iconColor }} />
            </div>
          </div>

          <h2 className="text-[20px] font-bold text-[#1c1c1c] mb-1 text-center">
            Connect {integration.name}
          </h2>

          {isOAuth ? (
            <>
              <p className="text-[13px] text-[#5f6368] mb-6 text-center">
                You&apos;ll be redirected to {integration.name} to authorize CodeKang.
                Pick your workspace and channel — we&apos;ll handle the rest automatically.
              </p>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f0f0f0] mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: integration.bgColor }}>
                  <ServiceIcon size={18} style={{ color: iconColor }} />
                </div>
                <div className="text-[13px] text-[#5f6368] leading-relaxed">
                  CodeKang will post notifications to your chosen {integration.name} channel whenever the AI agent completes or fails a fix.
                </div>
              </div>

              {error && <p className="text-[13px] text-red-500 mb-4 text-center">{error}</p>}

              <button
                onClick={handleOAuth}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                style={{ backgroundColor: iconColor === '#1c1c1c' ? '#1c1c1c' : integration.color }}
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Redirecting…</>
                ) : (
                  <><ServiceIcon size={18} /> Continue with {integration.name}</>
                )}
              </button>
            </>
          ) : (
            <>
              <p className="text-[13px] text-[#5f6368] mb-6 text-center">
                Enter your {integration.name} credentials to enable the integration.
              </p>

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

              {error && <p className="text-[13px] text-red-500 mb-4 text-center">{error}</p>}

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
            </>
          )}

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
  autoTest = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  integration: Integration | null;
  currentConfig: Record<string, string>;
  onSaved: (updated: UserIntegration) => void;
  autoTest?: boolean;
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);

  useEffect(() => {
    if (isOpen) { setFormData({ ...currentConfig }); setError(null); setSaved(false); setTestResult(null); }
  }, [isOpen, currentConfig]);

  useEffect(() => {
    if (isOpen && autoTest && integration) {
      const run = async () => {
        setTesting(true);
        try {
          const result = await testIntegration(integration.id);
          setTestResult(result);
        } catch {
          setTestResult({ ok: false, error: 'Could not reach the server' });
        } finally {
          setTesting(false);
        }
      };
      const timer = setTimeout(() => void run(), 400);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoTest]);

  if (!isOpen || !integration) return null;

  const ServiceIcon = integration.icon;
  const iconColor = integration.color === '#ffffff' ? '#a1a1aa' : integration.color;
  const hasFields = integration.fields.length > 0;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateIntegrationConfig(integration.id, formData);
      onSaved(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testIntegration(integration.id);
      setTestResult(result);
    } catch {
      setTestResult({ ok: false, error: 'Could not reach the server' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#111113] w-full max-w-[500px] rounded-2xl shadow-2xl border border-[#27272a] animate-in zoom-in-95 fade-in duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: integration.bgColor }}
          >
            <ServiceIcon size={24} style={{ color: iconColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-semibold text-[#f4f4f5] leading-tight">
              {integration.name} Settings
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
              <span className="text-[12px] font-medium text-emerald-400">Connected</span>
              <span className="text-[#3f3f46] mx-1">·</span>
              <span className="text-[12px] text-[#52525b]">{integration.category}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-[#52525b] hover:text-[#a1a1aa] transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-px bg-[#1f1f22]" />

        {/* Body */}
        <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto">

          {/* Configuration fields */}
          {hasFields ? (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-[#3f3f46] uppercase tracking-widest">Configuration</p>
              {integration.fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={formData[field.key] ?? ''}
                  onChange={(val) => setFormData((prev) => ({ ...prev, [field.key]: val }))}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
              <div className="w-8 h-8 rounded-lg bg-[#1f1f22] flex items-center justify-center shrink-0">
                <Settings2 size={15} className="text-[#52525b]" />
              </div>
              <p className="text-[13px] text-[#52525b] leading-relaxed">
                This integration has no additional configuration — it&apos;s managed entirely via OAuth.
              </p>
            </div>
          )}

          {/* Connection health */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-[#3f3f46] uppercase tracking-widest">Connection Health</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-[13px] font-medium text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3f3f46] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                {testing ? 'Running test…' : 'Test connection'}
              </button>
              {testResult && (
                <div className={`flex items-center gap-1.5 text-[13px] font-medium ${testResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                  {testResult.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {testResult.ok ? 'All systems go' : (testResult.error ?? 'Test failed')}
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-red-400 flex items-center gap-1.5">
              <XCircle size={13} /> {error}
            </p>
          )}
        </div>

        <div className="h-px bg-[#1f1f22]" />

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4">
          <a
            href={integration.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[12px] text-[#52525b] hover:text-[#a1a1aa] transition-colors"
          >
            <ExternalLink size={12} />
            View docs
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/5 transition-all"
            >
              Close
            </button>
            {hasFields && (
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="px-5 py-2 rounded-lg bg-white text-[#111113] text-[13px] font-semibold hover:bg-[#e4e4e7] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving
                  ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                  : saved
                    ? <><CheckCircle2 size={13} /> Saved</>
                    : 'Save changes'}
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
  const [oauthBanner, setOauthBanner] = useState<{ type: 'success' | 'error'; provider: string } | null>(null);

  const [connectModal, setConnectModal] = useState<Integration | null>(null);
  const [disconnectModal, setDisconnectModal] = useState<Integration | null>(null);
  const [configureModal, setConfigureModal] = useState<Integration | null>(null);
  const [autoTestOnOpen, setAutoTestOnOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const handledOAuth = useRef(false);

  useEffect(() => {
    if (handledOAuth.current) return;
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    const configure = searchParams.get('configure');
    if (connected) {
      handledOAuth.current = true;
      setOauthBanner({ type: 'success', provider: connected });
      router.replace('/dashboard/integrations');
      setTimeout(() => setOauthBanner(null), 5000);
      const configureProvider = configure ?? connected;
      const integration = INTEGRATIONS.find((i) => i.id === configureProvider);
      if (integration) {
        setTimeout(() => { setAutoTestOnOpen(true); setConfigureModal(integration); }, 600);
      }
    } else if (error) {
      handledOAuth.current = true;
      const provider = error.replace('_denied', '').replace('_failed', '');
      setOauthBanner({ type: 'error', provider });
      router.replace('/dashboard/integrations');
      setTimeout(() => setOauthBanner(null), 5000);
    }
  }, [searchParams, router]);

  const loadIntegrations = useCallback(async () => {
    try {
      const data = await fetchIntegrations();
      setDbIntegrations(data);
    } catch {
      // fail silently
    } finally {
      setLoadingInit(false);
    }
  }, []);

  useEffect(() => { void loadIntegrations(); }, [loadIntegrations]);

  const getDb = (id: string) => dbIntegrations.find((i) => i.provider === id);
  const isConnected = (id: string) => !!getDb(id);
  const isEnabled = (id: string) => {
    const db = getDb(id);
    return db ? db.status === 'connected' : false;
  };

  const handleGitHubInstall = () => {
    const url = getGitHubAppInstallUrl() ?? getGitHubAppSetupUrl();
    window.location.href = url;
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
    setTogglingId(item.id);
    try {
      const updated = await updateIntegrationStatus(item.id, nextEnabled ? 'connected' : 'disabled');
      setDbIntegrations((prev) => prev.map((i) => (i.provider === item.id ? updated : i)));
    } finally {
      setTogglingId(null);
    }
  };

  const connectedCount = INTEGRATIONS.filter((i) => isConnected(i.id)).length;
  const activeCount = INTEGRATIONS.filter((i) => isEnabled(i.id)).length;
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory>('All');

  const categories: IntegrationCategory[] = ['All', 'Source Control', 'Communication', 'Productivity', 'Observation'];
  const visibleIntegrations = activeCategory === 'All'
    ? INTEGRATIONS
    : INTEGRATIONS.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-[#f4f4f5]">

      {/* OAuth banner */}
      {oauthBanner && (
        <div className={`mx-6 md:mx-8 mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium animate-in slide-in-from-top-2 duration-300 border ${oauthBanner.type === 'success'
          ? 'bg-emerald-500/[0.07] border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/[0.07] border-red-500/20 text-red-400'
          }`}>
          {oauthBanner.type === 'success'
            ? <><CheckCircle2 size={15} className="shrink-0" /> <span><strong>{oauthBanner.provider.charAt(0).toUpperCase() + oauthBanner.provider.slice(1)}</strong> connected successfully.</span></>
            : <><XCircle size={15} className="shrink-0" /> <span><strong>{oauthBanner.provider.charAt(0).toUpperCase() + oauthBanner.provider.slice(1)}</strong> connection failed or was cancelled.</span></>
          }
        </div>
      )}

      {/* ── Page header ── */}
      <div className="px-6 md:px-8 pt-8 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#52525b] mb-2">Workspace</p>
            <h1 className="text-[26px] font-semibold tracking-tight text-[#f4f4f5] leading-tight">Integrations</h1>
            <p className="mt-1.5 text-[13.5px] text-[#71717a] max-w-lg leading-relaxed">
              Connect CodeKang to the tools your team already uses — source control, chat, and issue tracking.
            </p>
          </div>


        </div>

        {/* ── Category tabs ── */}
        <div className="mt-7 flex items-center gap-1 border-b border-[#1f1f22]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap ${activeCategory === cat
                ? 'text-[#f4f4f5]'
                : 'text-[#52525b] hover:text-[#a1a1aa]'
                }`}
            >
              {cat}
              {activeCategory === cat && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-[#f4f4f5] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Integration grid ── */}
      <div className="px-6 md:px-8 py-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleIntegrations.map((item) => {
            const connected = isConnected(item.id);
            const enabled = isEnabled(item.id);
            const toggling = togglingId === item.id;
            const Icon = item.icon;
            const iconColor = item.color === '#ffffff' ? '#a1a1aa' : item.color;
            const accentColor = item.color === '#ffffff' ? '#52525b' : item.color;

            return (
              <div
                key={item.id}
                className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 ${connected
                  ? 'border-[#2a2a2a] bg-white/2 hover:border-[#3a3a3a]'
                  : 'border-[#1f1f22] bg-white/2 hover:border-[#2a2a2a] hover:bg-[#18181b] cursor-pointer'
                  }`}
                onClick={() => {
                  if (!connected) {
                    if (item.id === 'github') handleGitHubInstall();
                    else setConnectModal(item);
                  }
                }}
              >
                {/* Top accent line when active */}
                {connected && enabled && (
                  <div className="h-[2px] w-full shrink-0" style={{ backgroundColor: accentColor, opacity: 0.8 }} />
                )}

                <div className="flex flex-col flex-1 p-5">
                  {/* Icon + status row */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/[0.06]"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      <Icon size={20} style={{ color: iconColor }} />
                    </div>

                    {connected ? (
                      <Toggle
                        enabled={enabled}
                        disabled={toggling}
                        onChange={(val) => void handleToggle(item, val)}
                      />
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3f3f46] px-2 py-1 rounded-md border border-[#27272a]">
                        Off
                      </span>
                    )}
                  </div>

                  {/* Name + category */}
                  <div className="mb-1.5">
                    <h3 className="text-[14px] font-semibold text-[#f4f4f5] leading-tight">{item.name}</h3>
                    <p className="text-[11px] text-[#52525b] mt-0.5 font-medium">{item.category}</p>
                  </div>

                  {/* Description */}
                  <p className="text-[12.5px] text-[#71717a] leading-relaxed flex-1 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-[#1f1f22] flex items-center justify-between gap-2">
                    {connected ? (
                      <>
                        <span className={`flex items-center gap-1.5 text-[11px] font-medium ${enabled ? 'text-emerald-400' : 'text-[#52525b]'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-[#3f3f46]'}`} />
                          {toggling ? 'Updating…' : enabled ? 'Active' : 'Paused'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfigureModal(item); }}
                            className="p-1.5 rounded-lg text-[#52525b] hover:text-[#a1a1aa] hover:bg-white/[0.05] transition-colors"
                            title="Configure"
                          >
                            <Settings2 size={14} />
                          </button>
                          <CardMenu
                            onConfigure={() => setConfigureModal(item)}
                            onDisconnect={() => setDisconnectModal(item)}
                          />
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.id === 'github') handleGitHubInstall();
                          else setConnectModal(item);
                        }}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
                      >
                        <Plug size={13} className="text-indigo-400" />
                        {item.id === 'github' ? 'Install App' : 'Connect'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state for filtered category */}
          {visibleIntegrations.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1f1f22] flex items-center justify-center mb-4">
                <Plug size={20} className="text-[#3f3f46]" />
              </div>
              <p className="text-[14px] font-medium text-[#52525b]">No integrations in this category yet</p>
              <p className="text-[13px] text-[#3f3f46] mt-1">More providers coming soon.</p>
            </div>
          )}
        </div>

        {/* ── Bottom support strip ── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-5 p-5 rounded-2xl border border-[#1f1f22] bg-[#161618]">
            <div className="w-10 h-10 rounded-xl bg-[#1f1f22] flex items-center justify-center shrink-0">
              <ExternalLink size={16} className="text-[#52525b]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#d4d4d8]">Documentation</p>
              <p className="text-[12px] text-[#52525b] mt-0.5">Step-by-step guides for every integration</p>
            </div>
            <Link
              href="/dashboard/integrations/docs"
              className="shrink-0 px-3.5 py-2 rounded-xl border border-[#27272a] text-[12px] font-medium text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3a3a3a] transition-all"
            >
              View docs
            </Link>
          </div>
          <div className="flex items-center gap-5 p-5 rounded-2xl border border-[#1f1f22] bg-[#161618]">
            <div className="w-10 h-10 rounded-xl bg-[#6366f1]/10 flex items-center justify-center shrink-0">
              <Zap size={16} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#d4d4d8]">Request an integration</p>
              <p className="text-[12px] text-[#52525b] mt-0.5">Tell us which tool your team needs next</p>
            </div>
            <Link
              href="/dashboard/integrations/request"
              className="shrink-0 px-3.5 py-2 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 text-[12px] font-semibold text-indigo-400 hover:bg-[#6366f1]/20 transition-all"
            >
              Request
            </Link>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
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
        onClose={() => { setConfigureModal(null); setAutoTestOnOpen(false); }}
        integration={configureModal}
        currentConfig={(configureModal ? getDb(configureModal.id)?.config ?? {} : {}) as Record<string, string>}
        onSaved={handleConfigSaved}
        autoTest={autoTestOnOpen}
      />
    </div>
  );
}
