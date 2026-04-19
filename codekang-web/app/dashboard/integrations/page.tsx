'use client';

import { useState } from 'react';
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
import CodeKangIcon from '@/public/brandlogo/favicon-white.png';

// ── Types ──

type IntegrationCategory =
  | 'All'
  | 'Source Control'
  | 'Communication'
  | 'Productivity'
  | 'Observation';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: IconType;
  status: 'connected' | 'not_connected';
  color: string;
  bgColor: string;
  configureText: string;
  docsUrl: string;
}

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
    onClick={(e) => {
      e.stopPropagation();
      if (!disabled) onChange(!enabled);
    }}
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

// ── Connect Modal ──

const ConnectModal = ({
  isOpen,
  onClose,
  integration,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  integration: Integration | null;
  onConfirm: () => void;
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  if (!isOpen || !integration) return null;

  const ServiceIcon = integration.icon;

  const handleConfirm = () => {
    setIsConnecting(true);
    setTimeout(() => {
      onConfirm();
      onClose();
      setIsConnecting(false);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#f8f9fa] w-full max-w-[440px] rounded-[24px] overflow-hidden shadow-2xl border border-white animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-[#5f6368] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-6 mb-8 relative">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center p-3 z-10">
              <Image
                src={CodeKangIcon}
                alt="CodeKang"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>

            <div className="w-12 h-[2px] bg-gray-200 relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#f97316] to-transparent animate-[shimmer_2s_infinite]" />
            </div>

            <div
              className="w-20 h-20 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center p-4 z-10"
              style={{ backgroundColor: integration.bgColor }}
            >
              <ServiceIcon
                size={44}
                style={{
                  color:
                    integration.color === '#ffffff'
                      ? '#1c1c1c'
                      : integration.color,
                }}
              />
            </div>

            <div className="absolute inset-0 -m-8 pointer-events-none opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    'radial-gradient(#1c1c1c 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              />
            </div>
          </div>

          <h2 className="text-[22px] font-bold text-[#1c1c1c] mb-3">
            Connect {integration.name}
          </h2>
          <p className="text-[14px] text-[#5f6368] leading-relaxed mb-8 px-2">
            Grant CodeKang access to your {integration.name} account to enable
            AI-powered code reviews, automated workflows, and real-time
            notifications.
          </p>

          <button
            onClick={handleConfirm}
            disabled={isConnecting}
            className="w-full bg-[#1c1c1c] text-white py-3.5 rounded-xl font-semibold text-[15px] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <Plug size={16} />
                Connect {integration.name}
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="mt-4 text-[14px] font-medium text-[#5f6368] hover:text-[#1c1c1c] transition-colors"
          >
            Not now
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

// ── Disconnect Modal ──

const DisconnectModal = ({
  isOpen,
  onClose,
  integration,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  integration: Integration | null;
  onConfirm: () => void;
}) => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  if (!isOpen || !integration) return null;

  const ServiceIcon = integration.icon;

  const handleConfirm = () => {
    setIsDisconnecting(true);
    setTimeout(() => {
      onConfirm();
      onClose();
      setIsDisconnecting(false);
    }, 1200);
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-[#71717a] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: integration.bgColor }}
            >
              <ServiceIcon
                size={26}
                style={{
                  color:
                    integration.color === '#ffffff'
                      ? '#1c1c1c'
                      : integration.color,
                }}
              />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-[#f4f4f5]">
                Disconnect {integration.name}?
              </h2>
              <p className="text-[13px] text-[#71717a] mt-0.5">
                This will remove CodeKang&apos;s access
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-6">
            <AlertTriangle
              size={16}
              className="text-amber-400 shrink-0 mt-0.5"
            />
            <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
              Active automations using {integration.name} will stop working
              immediately. You can reconnect at any time.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#27272a] text-[14px] font-medium text-[#a1a1aa] hover:bg-white/5 hover:text-[#f4f4f5] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDisconnecting}
              className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[14px] font-semibold text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDisconnecting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Disconnecting…
                </>
              ) : (
                <>
                  <Unplug size={15} />
                  Disconnect
                </>
              )}
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
}: {
  isOpen: boolean;
  onClose: () => void;
  integration: Integration | null;
}) => {
  if (!isOpen || !integration) return null;

  const ServiceIcon = integration.icon;

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
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: integration.bgColor }}
            >
              <ServiceIcon
                size={20}
                style={{
                  color:
                    integration.color === '#ffffff'
                      ? '#1c1c1c'
                      : integration.color,
                }}
              />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#f4f4f5]">
                {integration.name} Settings
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[12px] text-emerald-400">Connected</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-[#71717a] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <label className="block text-[13px] font-medium text-[#a1a1aa]">
              Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={`https://hooks.codekang.dev/${integration.id}/webhook`}
                className="flex-1 bg-[#121214] border border-[#27272a] rounded-lg px-3 py-2.5 text-[13px] text-[#71717a] font-mono focus:outline-none"
              />
              <button className="px-3 py-2.5 rounded-lg border border-[#27272a] text-[13px] text-[#a1a1aa] hover:bg-white/5 hover:text-[#f4f4f5] transition-all whitespace-nowrap">
                Copy
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[13px] font-medium text-[#a1a1aa]">
              Events
            </label>
            <div className="space-y-2">
              {[
                'PR opened',
                'PR merged',
                'Review requested',
                'Bug detected',
              ].map((event) => (
                <label
                  key={event}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#27272a] hover:border-[#3f3f46] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    defaultChecked={event !== 'Bug detected'}
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  <span className="text-[13px] text-[#e4e4e7]">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href={integration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13px] text-[#71717a] hover:text-[#a1a1aa] transition-colors"
            >
              <ExternalLink size={13} />
              View docs
            </a>
            <button
              onClick={onClose}
              className="ml-auto px-5 py-2 rounded-xl bg-[#f4f4f5] text-[#1c1c1c] text-[14px] font-semibold hover:bg-white transition-all"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Data ──

const INTEGRATIONS: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    description:
      'AI-powered code reviews, automated bug fixing, and deep PR insights directly in your GitHub workflow.',
    category: 'Source Control',
    icon: SiGithub,
    status: 'connected',
    color: '#e8e8e8',
    bgColor: 'rgba(232,232,232,0.08)',
    configureText: 'Configure Repositories',
    docsUrl: 'https://docs.codekang.dev/integrations/github',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description:
      'Sync GitLab projects to enable automated code analysis and AI-driven issue resolution across your pipelines.',
    category: 'Source Control',
    icon: SiGitlab,
    status: 'not_connected',
    color: '#FC6D26',
    bgColor: 'rgba(252,109,38,0.08)',
    configureText: 'Sync GitLab Projects',
    docsUrl: 'https://docs.codekang.dev/integrations/gitlab',
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    description:
      'Integrate Bitbucket repos for seamless AI patching and automated security vulnerability scanning.',
    category: 'Source Control',
    icon: SiBitbucket,
    status: 'not_connected',
    color: '#0052CC',
    bgColor: 'rgba(0,82,204,0.08)',
    configureText: 'Connect Bitbucket',
    docsUrl: 'https://docs.codekang.dev/integrations/bitbucket',
  },
  {
    id: 'slack',
    name: 'Slack',
    description:
      'Receive real-time notifications in Slack for AI-generated code fixes, review summaries, and PR alerts.',
    category: 'Communication',
    icon: SiSlack,
    status: 'connected',
    color: '#4A154B',
    bgColor: 'rgba(74,21,75,0.12)',
    configureText: 'Configure Webhooks',
    docsUrl: 'https://docs.codekang.dev/integrations/slack',
  },
  {
    id: 'discord',
    name: 'Discord',
    description:
      'Keep your dev team in sync with real-time PR alerts and AI progress updates in your Discord server.',
    category: 'Communication',
    icon: SiDiscord,
    status: 'not_connected',
    color: '#5865F2',
    bgColor: 'rgba(88,101,242,0.08)',
    configureText: 'Configure Discord Bot',
    docsUrl: 'https://docs.codekang.dev/integrations/discord',
  },
  {
    id: 'linear',
    name: 'Linear',
    description:
      'Automatically create and sync Linear issues with AI-detected bugs and suggested fix branches.',
    category: 'Productivity',
    icon: SiLinear,
    status: 'not_connected',
    color: '#5E6AD2',
    bgColor: 'rgba(94,106,210,0.08)',
    configureText: 'Sync Linear Issues',
    docsUrl: 'https://docs.codekang.dev/integrations/linear',
  },
  {
    id: 'jira',
    name: 'Jira',
    description:
      'Enterprise task tracking for AI workflows. Map CodeKang findings directly to Jira tickets and epics.',
    category: 'Productivity',
    icon: SiJira,
    status: 'not_connected',
    color: '#0052CC',
    bgColor: 'rgba(0,82,204,0.08)',
    configureText: 'Configure Jira Board',
    docsUrl: 'https://docs.codekang.dev/integrations/jira',
  },
  {
    id: 'notion',
    name: 'Notion',
    description:
      'AI-powered documentation. Sync code analysis reports and review summaries directly to your Notion workspace.',
    category: 'Productivity',
    icon: SiNotion,
    status: 'not_connected',
    color: '#ffffff',
    bgColor: 'rgba(255,255,255,0.06)',
    configureText: 'Connect Notion Workspace',
    docsUrl: 'https://docs.codekang.dev/integrations/notion',
  },
  {
    id: 'sentry',
    name: 'Sentry',
    description:
      'Identify production errors and let CodeKang AI provide automated fix suggestions the moment issues surface.',
    category: 'Observation',
    icon: SiSentry,
    status: 'connected',
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.08)',
    configureText: 'Configure Error Tracking',
    docsUrl: 'https://docs.codekang.dev/integrations/sentry',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description:
      'Automatically deploy AI-vetted code fixes to preview environments for instant visual verification.',
    category: 'Observation',
    icon: SiVercel,
    status: 'not_connected',
    color: '#ffffff',
    bgColor: 'rgba(255,255,255,0.06)',
    configureText: 'Configure Preview Deploys',
    docsUrl: 'https://docs.codekang.dev/integrations/vercel',
  },
];

// ── Card Menu ──

const CardMenu = ({
  onConfigure,
  onDisconnect,
}: {
  onConfigure: () => void;
  onDisconnect: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="p-1.5 rounded-lg hover:bg-white/8 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div className="absolute right-0 top-8 w-[160px] bg-[#121214] border border-[#27272a] rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onConfigure();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/5 transition-colors"
            >
              <Settings2 size={14} />
              Configure
            </button>
            <div className="h-px bg-[#27272a]" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDisconnect();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
            >
              <Unplug size={14} />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ── Page ──

export default function IntegrationsPage() {
  const [connectedIds, setConnectedIds] = useState<Set<string>>(
    new Set(
      INTEGRATIONS.filter((i) => i.status === 'connected').map((i) => i.id),
    ),
  );
  const [enabledIds, setEnabledIds] = useState<Set<string>>(
    new Set(
      INTEGRATIONS.filter((i) => i.status === 'connected').map((i) => i.id),
    ),
  );

  const [connectModal, setConnectModal] = useState<Integration | null>(null);
  const [disconnectModal, setDisconnectModal] = useState<Integration | null>(
    null,
  );
  const [configureModal, setConfigureModal] = useState<Integration | null>(
    null,
  );

  const handleConnect = (item: Integration) => {
    setConnectedIds((prev) => new Set([...prev, item.id]));
    setEnabledIds((prev) => new Set([...prev, item.id]));
  };

  const handleDisconnect = () => {
    if (!disconnectModal) return;
    setConnectedIds((prev) => {
      const next = new Set(prev);
      next.delete(disconnectModal.id);
      return next;
    });
    setEnabledIds((prev) => {
      const next = new Set(prev);
      next.delete(disconnectModal.id);
      return next;
    });
  };

  const toggleEnabled = (id: string) => {
    setEnabledIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const connectedCount = connectedIds.size;

  return (
    <div className="flex-1 flex flex-col bg-[#1c1c1c] min-h-screen">
      {/* ── Header ── */}
      <div className="px-4 md:px-8 pt-10 pb-6 shrink-0">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-[26px] md:text-[32px] font-semibold text-[#f4f4f5] tracking-tight leading-tight">
              Integrations
            </h1>
            <p className="text-[14px] text-[#71717a] mt-1.5 leading-relaxed max-w-xl">
              Connect CodeKang to your development stack for automated AI
              reviews, issue tracking, and deployment workflows.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              <span className="text-[13px] font-medium text-[#f4f4f5]">
                {connectedCount}
              </span>
              <span className="text-[13px] text-[#52525b]">
                / {INTEGRATIONS.length} connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="px-4 md:px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map((item) => {
            const isConnected = connectedIds.has(item.id);
            const isEnabled = enabledIds.has(item.id);
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className={`group relative bg-[#18181b] border rounded-[16px] p-5 flex flex-col justify-between transition-all duration-200 ${
                  isConnected
                    ? 'border-[#27272a] hover:border-[#3f3f46]'
                    : 'border-[#27272a]/60 hover:border-[#3f3f46] cursor-pointer'
                }`}
                onClick={() => {
                  if (!isConnected) setConnectModal(item);
                }}
              >
                {/* Card Top */}
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      <Icon
                        size={22}
                        style={{
                          color:
                            item.color === '#ffffff' ? '#e4e4e7' : item.color,
                        }}
                      />
                    </div>

                    {isConnected ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/8 border border-emerald-500/15">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-medium text-emerald-400">
                            Connected
                          </span>
                        </div>
                        <CardMenu
                          onConfigure={() => setConfigureModal(item)}
                          onDisconnect={() => setDisconnectModal(item)}
                        />
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-[#27272a]/60 text-[11px] font-medium text-[#52525b]">
                        Not connected
                      </span>
                    )}
                  </div>

                  <h3 className="text-[16px] font-semibold text-[#f4f4f5] mb-1.5 tracking-tight">
                    {item.name}
                  </h3>
                  <p className="text-[13px] text-[#71717a] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Card Bottom */}
                <div className="mt-5 pt-4 border-t border-[#27272a]/40 flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#3f3f46]">
                    {item.category}
                  </span>

                  {isConnected ? (
                    <div className="flex items-center gap-2.5">
                      <span className="text-[12px] text-[#52525b]">
                        {isEnabled ? 'Active' : 'Paused'}
                      </span>
                      <Toggle
                        enabled={isEnabled}
                        onChange={() => toggleEnabled(item.id)}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectModal(item);
                      }}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                    >
                      <Plug size={12} />
                      Connect
                    </button>
                  )}
                </div>

                {/* Connected active indicator line */}
                {isConnected && isEnabled && (
                  <div className="absolute bottom-0 left-6 right-6 h-[2px] rounded-t-full bg-linear-to-r from-transparent via-emerald-500/40 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modals ── */}
      <ConnectModal
        key={connectModal?.id}
        isOpen={!!connectModal}
        onClose={() => setConnectModal(null)}
        integration={connectModal}
        onConfirm={() => {
          if (connectModal) handleConnect(connectModal);
        }}
      />

      <DisconnectModal
        key={`d-${disconnectModal?.id}`}
        isOpen={!!disconnectModal}
        onClose={() => setDisconnectModal(null)}
        integration={disconnectModal}
        onConfirm={handleDisconnect}
      />

      <ConfigureModal
        key={`c-${configureModal?.id}`}
        isOpen={!!configureModal}
        onClose={() => setConfigureModal(null)}
        integration={configureModal}
      />
    </div>
  );
}
