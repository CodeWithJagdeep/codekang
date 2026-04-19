'use client';

import { useState } from 'react';
import {
  Bot,
  Play,
  Pause,
  Settings2,
  Activity,
  ShieldCheck,
  PackageSearch,
  FileCode2,
  GitPullRequest,
  Bug,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  Sparkles,
  Terminal,
  RefreshCcw,
  X,
  MoreHorizontal,
} from 'lucide-react';

// ── Types ──

type AgentStatus = 'active' | 'running' | 'paused' | 'error';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  status: AgentStatus;
  currentTask: string | null;
  tasksToday: number;
  totalTasks: number;
  successRate: number;
  repos: string[];
  trigger: 'pr_opened' | 'schedule' | 'manual' | 'push';
  lastRun: string;
  nextRun: string | null;
}

interface LogEntry {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  repo: string;
  result: 'success' | 'failure' | 'running' | 'warning';
  time: string;
  detail: string;
}

// ── Data ──

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'kangbot',
    name: 'KangBot Reviewer',
    description:
      'Core AI review agent. Automatically reviews every opened PR for bugs, security issues, and code quality.',
    icon: Bot,
    iconColor: '#a78bfa',
    iconBg: 'rgba(167,139,250,0.1)',
    status: 'active',
    currentTask: null,
    tasksToday: 14,
    totalTasks: 1247,
    successRate: 97,
    repos: ['codekang-api', 'codekang-web', 'auth-service'],
    trigger: 'pr_opened',
    lastRun: '12m ago',
    nextRun: null,
  },
  {
    id: 'patch-agent',
    name: 'Patch Agent',
    description:
      'Generates and opens fix PRs automatically for AI-detected bugs. Targets critical and high severity findings.',
    icon: GitPullRequest,
    iconColor: '#34d399',
    iconBg: 'rgba(52,211,153,0.08)',
    status: 'running',
    currentTask: 'Creating fix for null-pointer in UserService.ts',
    tasksToday: 3,
    totalTasks: 312,
    successRate: 88,
    repos: ['codekang-api', 'auth-service'],
    trigger: 'manual',
    lastRun: '2m ago',
    nextRun: null,
  },
  {
    id: 'security-scanner',
    name: 'Security Scanner',
    description:
      'Deep OWASP-based vulnerability scanner. Runs nightly and on every push to protected branches.',
    icon: ShieldCheck,
    iconColor: '#fb923c',
    iconBg: 'rgba(251,146,60,0.08)',
    status: 'active',
    currentTask: null,
    tasksToday: 6,
    totalTasks: 489,
    successRate: 100,
    repos: ['codekang-api', 'codekang-web', 'auth-service', 'infra-terraform'],
    trigger: 'schedule',
    lastRun: '6h ago',
    nextRun: 'Tonight 02:00',
  },
  {
    id: 'dep-updater',
    name: 'Dependency Updater',
    description:
      'Monitors outdated and vulnerable packages. Opens batched upgrade PRs weekly with changelogs and risk assessment.',
    icon: PackageSearch,
    iconColor: '#38bdf8',
    iconBg: 'rgba(56,189,248,0.08)',
    status: 'paused',
    currentTask: null,
    tasksToday: 0,
    totalTasks: 74,
    successRate: 92,
    repos: ['codekang-web'],
    trigger: 'schedule',
    lastRun: '3d ago',
    nextRun: null,
  },
  {
    id: 'doc-generator',
    name: 'Doc Generator',
    description:
      'Auto-generates and keeps JSDoc / OpenAPI documentation in sync with merged code changes.',
    icon: FileCode2,
    iconColor: '#facc15',
    iconBg: 'rgba(250,204,21,0.08)',
    status: 'error',
    currentTask: null,
    tasksToday: 0,
    totalTasks: 156,
    successRate: 79,
    repos: ['codekang-api'],
    trigger: 'push',
    lastRun: '1d ago',
    nextRun: null,
  },
];

const ACTIVITY_LOG: LogEntry[] = [
  {
    id: 'l1',
    agentId: 'patch-agent',
    agentName: 'Patch Agent',
    action: 'Opened PR #142 — fix null-pointer in UserService',
    repo: 'codekang-api',
    result: 'running',
    time: '2m ago',
    detail: 'Generating fix branch fix/null-pointer-userservice…',
  },
  {
    id: 'l2',
    agentId: 'kangbot',
    agentName: 'KangBot Reviewer',
    action: 'Reviewed PR #141 — feat: add Sentry integration',
    repo: 'codekang-api',
    result: 'success',
    time: '12m ago',
    detail: '0 findings · Approved',
  },
  {
    id: 'l3',
    agentId: 'kangbot',
    agentName: 'KangBot Reviewer',
    action: 'Reviewed PR #140 — fix: auth race condition',
    repo: 'codekang-api',
    result: 'warning',
    time: '45m ago',
    detail: '7 findings · 2 critical · Changes requested',
  },
  {
    id: 'l4',
    agentId: 'security-scanner',
    agentName: 'Security Scanner',
    action: 'Nightly scan completed',
    repo: 'auth-service',
    result: 'warning',
    time: '6h ago',
    detail: 'SQL injection vector found in /users/search endpoint',
  },
  {
    id: 'l5',
    agentId: 'kangbot',
    agentName: 'KangBot Reviewer',
    action: 'Reviewed PR #138 — refactor: Zustand migration',
    repo: 'codekang-web',
    result: 'success',
    time: '8h ago',
    detail: '2 findings · No critical · Approved',
  },
  {
    id: 'l6',
    agentId: 'security-scanner',
    agentName: 'Security Scanner',
    action: 'Push scan — codekang-api main branch',
    repo: 'codekang-api',
    result: 'success',
    time: '10h ago',
    detail: 'Clean — no vulnerabilities detected',
  },
  {
    id: 'l7',
    agentId: 'doc-generator',
    agentName: 'Doc Generator',
    action: 'Failed to sync OpenAPI schema',
    repo: 'codekang-api',
    result: 'failure',
    time: '1d ago',
    detail: 'Error: Cannot read schema from dist/swagger.json — file not found',
  },
  {
    id: 'l8',
    agentId: 'patch-agent',
    agentName: 'Patch Agent',
    action: 'Opened PR #134 — fix bcrypt salt rounds',
    repo: 'auth-service',
    result: 'success',
    time: '1d ago',
    detail: 'PR merged by jagdeep · 1 file changed',
  },
];

const TRIGGER_LABEL: Record<Agent['trigger'], string> = {
  pr_opened: 'On PR opened',
  schedule: 'Scheduled',
  manual: 'Manual',
  push: 'On push',
};

const STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; color: string; bg: string; dot: string; pulse?: boolean }
> = {
  active: {
    label: 'Active',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8 border-emerald-500/20',
    dot: 'bg-emerald-400',
    pulse: false,
  },
  running: {
    label: 'Running',
    color: 'text-blue-400',
    bg: 'bg-blue-500/8 border-blue-500/20',
    dot: 'bg-blue-400',
    pulse: true,
  },
  paused: {
    label: 'Paused',
    color: 'text-[#71717a]',
    bg: 'bg-[#27272a] border-[#3f3f46]',
    dot: 'bg-[#52525b]',
    pulse: false,
  },
  error: {
    label: 'Error',
    color: 'text-red-400',
    bg: 'bg-red-500/8 border-red-500/20',
    dot: 'bg-red-500',
    pulse: false,
  },
};

const RESULT_CONFIG = {
  success: { icon: CheckCircle2, color: 'text-emerald-400' },
  failure: { icon: XCircle, color: 'text-red-400' },
  running: { icon: Loader2, color: 'text-blue-400', spin: true },
  warning: { icon: AlertTriangle, color: 'text-amber-400' },
};

// ── Configure Modal ──

const ConfigureModal = ({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) => {
  const AgentIcon = agent.icon;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#18181b] w-full max-w-[500px] rounded-[20px] border border-[#27272a] shadow-2xl animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: agent.iconBg }}
            >
              <AgentIcon size={18} style={{ color: agent.iconColor }} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#f4f4f5]">
                {agent.name}
              </p>
              <p className="text-[11px] text-[#52525b]">Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Trigger */}
          <div>
            <label className="block text-[12px] font-medium text-[#71717a] mb-2 uppercase tracking-wider">
              Trigger
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['pr_opened', 'push', 'schedule', 'manual'] as const).map(
                (t) => (
                  <button
                    key={t}
                    className={`px-3 py-2.5 rounded-xl border text-[13px] font-medium transition-all ${
                      agent.trigger === t
                        ? 'border-[#3b82f6]/40 bg-blue-500/8 text-blue-400'
                        : 'border-[#27272a] text-[#52525b] hover:border-[#3f3f46] hover:text-[#a1a1aa]'
                    }`}
                  >
                    {TRIGGER_LABEL[t]}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Repositories */}
          <div>
            <label className="block text-[12px] font-medium text-[#71717a] mb-2 uppercase tracking-wider">
              Repositories
            </label>
            <div className="space-y-2">
              {[
                'codekang-api',
                'codekang-web',
                'auth-service',
                'infra-terraform',
                'mobile-rn',
              ].map((repo) => (
                <label
                  key={repo}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#27272a] hover:border-[#3f3f46] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    defaultChecked={agent.repos.includes(repo)}
                    className="w-4 h-4 rounded accent-[#3b82f6]"
                  />
                  <span className="text-[13px] text-[#e4e4e7] font-mono">
                    {repo}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Severity threshold */}
          {(agent.id === 'kangbot' || agent.id === 'patch-agent') && (
            <div>
              <label className="block text-[12px] font-medium text-[#71717a] mb-2 uppercase tracking-wider">
                Minimum severity to act on
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['critical', 'high', 'medium', 'low'].map((s) => (
                  <button
                    key={s}
                    className={`py-2 rounded-xl border text-[12px] font-medium capitalize transition-all ${
                      s === 'high'
                        ? 'border-[#f97316]/30 bg-orange-500/8 text-orange-400'
                        : 'border-[#27272a] text-[#52525b] hover:border-[#3f3f46] hover:text-[#a1a1aa]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#27272a] text-[14px] font-medium text-[#71717a] hover:bg-white/5 hover:text-[#f4f4f5] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#f4f4f5] text-[#1c1c1c] text-[14px] font-semibold hover:bg-white transition-all"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Agent Card ──

const AgentCard = ({
  agent,
  onToggle,
  onConfigure,
  onRun,
}: {
  agent: Agent;
  onToggle: (id: string) => void;
  onConfigure: (agent: Agent) => void;
  onRun: (id: string) => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const AgentIcon = agent.icon;
  const sc = STATUS_CONFIG[agent.status];
  const isRunning = agent.status === 'running';
  const isPaused = agent.status === 'paused';
  const isError = agent.status === 'error';

  return (
    <div
      className={`bg-[#18181b] border rounded-[18px] p-5 flex flex-col gap-4 transition-all duration-200 ${
        isError
          ? 'border-red-500/20'
          : isRunning
            ? 'border-blue-500/15'
            : 'border-[#27272a] hover:border-[#3f3f46]'
      }`}
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: agent.iconBg }}
          >
            {isRunning ? (
              <Loader2
                size={20}
                style={{ color: agent.iconColor }}
                className="animate-spin"
              />
            ) : (
              <AgentIcon size={20} style={{ color: agent.iconColor }} />
            )}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#f4f4f5] leading-tight">
              {agent.name}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${sc.bg} ${sc.color}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${sc.pulse ? 'animate-pulse' : ''}`}
                />
                {sc.label}
              </span>
              <span className="text-[11px] text-[#3f3f46]">
                {TRIGGER_LABEL[agent.trigger]}
              </span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-white/8 text-[#3f3f46] hover:text-[#71717a] transition-colors"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 w-[155px] bg-[#121214] border border-[#27272a] rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onConfigure(agent);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/5 transition-colors"
                >
                  <Settings2 size={13} />
                  Configure
                </button>
                {!isError && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onRun(agent.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/5 transition-colors"
                  >
                    <Play size={13} />
                    Run now
                  </button>
                )}
                <div className="h-px bg-[#27272a]" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onToggle(agent.id);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] transition-colors ${
                    isPaused
                      ? 'text-emerald-400 hover:bg-emerald-500/5'
                      : 'text-amber-400 hover:bg-amber-500/5'
                  }`}
                >
                  {isPaused ? <Play size={13} /> : <Pause size={13} />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-[12.5px] text-[#71717a] leading-relaxed line-clamp-2">
        {agent.description}
      </p>

      {/* Running task */}
      {isRunning && agent.currentTask && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <Terminal size={12} className="text-blue-400 shrink-0" />
          <span className="text-[12px] text-blue-300 truncate">
            {agent.currentTask}
          </span>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10">
          <AlertTriangle size={12} className="text-red-400 shrink-0" />
          <span className="text-[12px] text-red-300">
            Last run failed — check logs or reconfigure
          </span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="bg-[#121214] rounded-xl p-2.5 text-center">
          <p className="text-[16px] font-semibold text-[#f4f4f5] leading-none">
            {agent.tasksToday}
          </p>
          <p className="text-[10px] text-[#3f3f46] mt-1">Today</p>
        </div>
        <div className="bg-[#121214] rounded-xl p-2.5 text-center">
          <p className="text-[16px] font-semibold text-[#f4f4f5] leading-none">
            {agent.totalTasks.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#3f3f46] mt-1">Total runs</p>
        </div>
        <div className="bg-[#121214] rounded-xl p-2.5 text-center">
          <p
            className={`text-[16px] font-semibold leading-none ${
              agent.successRate >= 90
                ? 'text-emerald-400'
                : agent.successRate >= 75
                  ? 'text-amber-400'
                  : 'text-red-400'
            }`}
          >
            {agent.successRate}%
          </p>
          <p className="text-[10px] text-[#3f3f46] mt-1">Success</p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#27272a]/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-[#3f3f46]">
          <Clock size={11} />
          <span>Last run {agent.lastRun}</span>
          {agent.nextRun && (
            <>
              <span>·</span>
              <RefreshCcw size={10} />
              <span>{agent.nextRun}</span>
            </>
          )}
        </div>

        <button
          onClick={() => onToggle(agent.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
            isPaused
              ? 'text-emerald-400 hover:bg-emerald-500/10'
              : isError
                ? 'text-amber-400 hover:bg-amber-500/10'
                : 'text-[#52525b] hover:text-[#a1a1aa] hover:bg-white/5'
          }`}
        >
          {isPaused ? (
            <>
              <Play size={12} /> Resume
            </>
          ) : isError ? (
            <>
              <RefreshCcw size={12} /> Retry
            </>
          ) : (
            <>
              <Pause size={12} /> Pause
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Page ──

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [configureAgent, setConfigureAgent] = useState<Agent | null>(null);
  const [logFilter, setLogFilter] = useState<string>('all');

  const activeCount = agents.filter(
    (a) => a.status === 'active' || a.status === 'running',
  ).length;
  const runningCount = agents.filter((a) => a.status === 'running').length;
  const errorCount = agents.filter((a) => a.status === 'error').length;
  const todayTotal = agents.reduce((s, a) => s + a.tasksToday, 0);

  const handleToggle = (id: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        if (a.status === 'paused') return { ...a, status: 'active' };
        if (a.status === 'error') return { ...a, status: 'active' };
        if (a.status === 'active') return { ...a, status: 'paused' };
        return a;
      }),
    );
  };

  const handleRun = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'running', currentTask: 'Initializing…' } : a,
      ),
    );
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: 'active',
                currentTask: null,
                tasksToday: a.tasksToday + 1,
                totalTasks: a.totalTasks + 1,
                lastRun: 'just now',
              }
            : a,
        ),
      );
    }, 3000);
  };

  const filteredLog =
    logFilter === 'all'
      ? ACTIVITY_LOG
      : ACTIVITY_LOG.filter((l) => l.agentId === logFilter);

  return (
    <div className="flex-1 flex flex-col bg-[#1c1c1c] h-dvh overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-4 md:px-8 py-4 border-b border-[#27272a]/40 shrink-0">
        <span className="text-[12px] font-medium text-[#52525b] uppercase tracking-wider">
          Agents
        </span>
      </div>

      {/* Header */}
      <div className="px-4 md:px-8 pt-7 pb-5 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-[26px] md:text-[32px] font-semibold text-[#f4f4f5] tracking-tight leading-tight">
              AI Agents
            </h1>
            <p className="text-[14px] text-[#71717a] mt-1.5">
              Autonomous agents that review code, fix bugs, and keep your
              repositories healthy — 24/7.
            </p>
          </div>

          {/* Header stats */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18181b] border border-[#27272a]">
              <Activity size={13} className="text-emerald-400" />
              <span className="text-[13px] font-medium text-[#f4f4f5]">
                {activeCount}
              </span>
              <span className="text-[12px] text-[#52525b]">active</span>
            </div>
            {runningCount > 0 && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/8 border border-blue-500/15">
                <Loader2
                  size={13}
                  className="text-blue-400 animate-spin"
                />
                <span className="text-[13px] font-medium text-blue-400">
                  {runningCount} running
                </span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/8 border border-red-500/15">
                <AlertTriangle size={13} className="text-red-400" />
                <span className="text-[13px] font-medium text-red-400">
                  {errorCount} error
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18181b] border border-[#27272a]">
              <Zap size={13} className="text-amber-400" />
              <span className="text-[13px] font-medium text-[#f4f4f5]">
                {todayTotal}
              </span>
              <span className="text-[12px] text-[#52525b]">tasks today</span>
            </div>

            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f4f4f5] text-[#1c1c1c] text-[13px] font-semibold hover:bg-white transition-all">
              <Plus size={14} strokeWidth={2.5} />
              New Agent
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-10 no-scrollbar">
        {/* ── Agent Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggle={handleToggle}
              onConfigure={setConfigureAgent}
              onRun={handleRun}
            />
          ))}

          {/* Add agent placeholder */}
          <button className="bg-[#18181b] border border-dashed border-[#27272a] rounded-[18px] p-5 flex flex-col items-center justify-center gap-3 hover:border-[#3f3f46] hover:bg-[#1a1a1c] transition-all group min-h-[260px]">
            <div className="w-10 h-10 rounded-xl bg-[#27272a] flex items-center justify-center group-hover:bg-[#3f3f46] transition-colors">
              <Plus size={18} className="text-[#52525b] group-hover:text-[#a1a1aa] transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium text-[#52525b] group-hover:text-[#71717a] transition-colors">
                Deploy new agent
              </p>
              <p className="text-[11px] text-[#3f3f46] mt-0.5">
                From template or custom
              </p>
            </div>
          </button>
        </div>

        {/* ── Activity Log ── */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-[18px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#f4f4f5]">
                Activity log
              </h2>
              <p className="text-[12px] text-[#52525b] mt-0.5">
                Recent actions across all agents
              </p>
            </div>

            {/* Agent filter pills */}
            <div className="flex items-center gap-1 p-1 bg-[#121214] rounded-lg border border-[#27272a]/60 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                  logFilter === 'all'
                    ? 'bg-[#27272a] text-[#f4f4f5]'
                    : 'text-[#52525b] hover:text-[#a1a1aa]'
                }`}
              >
                All
              </button>
              {agents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setLogFilter(a.id)}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                    logFilter === a.id
                      ? 'bg-[#27272a] text-[#f4f4f5]'
                      : 'text-[#52525b] hover:text-[#a1a1aa]'
                  }`}
                >
                  {a.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {filteredLog.map((entry) => {
              const rc = RESULT_CONFIG[entry.result];
              const ResultIcon = rc.icon;
              const agent = agents.find((a) => a.id === entry.agentId);

              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/3 transition-colors group"
                >
                  <ResultIcon
                    size={15}
                    className={`shrink-0 mt-0.5 ${rc.color} ${'spin' in rc ? 'animate-spin' : ''}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="text-[13px] text-[#e4e4e7] leading-snug">
                        {entry.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {agent && (
                        <span
                          className="text-[11px] font-medium px-1.5 py-0.5 rounded-md"
                          style={{
                            color: agent.iconColor,
                            backgroundColor: agent.iconBg,
                          }}
                        >
                          {agent.name.split(' ')[0]}
                        </span>
                      )}
                      <span className="text-[11px] text-[#3f3f46] font-mono">
                        {entry.repo}
                      </span>
                      <ChevronRight size={10} className="text-[#27272a]" />
                      <span className="text-[11px] text-[#52525b]">
                        {entry.detail}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#3f3f46] shrink-0 mt-0.5">
                    {entry.time}
                  </span>
                </div>
              );
            })}

            {filteredLog.length === 0 && (
              <div className="py-12 flex flex-col items-center text-center">
                <Sparkles size={20} className="text-[#3f3f46] mb-3" />
                <p className="text-[13px] text-[#52525b]">
                  No activity for this agent yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configure Modal */}
      {configureAgent && (
        <ConfigureModal
          agent={configureAgent}
          onClose={() => setConfigureAgent(null)}
        />
      )}
    </div>
  );
}
