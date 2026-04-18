'use client';

import { useState } from 'react';
import {
  GitPullRequest,
  AlertCircle,
  Plus,
  Settings,
  LayoutDashboard,
  GitFork,
  ChevronDown,
  BarChart2,
  Zap,
} from 'lucide-react';

const repos = [
  {
    id: 'codekang-platform',
    name: 'codekang-platform',
    org: 'CodeWithJagdeep',
    prs: 3,
    issues: 8,
    status: 'active',
    branch: 'main',
  },
  {
    id: 'codekang-web',
    name: 'codekang-web',
    org: 'CodeWithJagdeep',
    prs: 1,
    issues: 2,
    status: 'active',
    branch: 'main',
  },
  {
    id: 'automous-ai',
    name: 'automous-ai',
    org: 'CodeWithJagdeep',
    prs: 5,
    issues: 4,
    status: 'busy',
    branch: 'main',
  },
];

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
  { icon: GitFork, label: 'Repositories', id: 'repos' },
  { icon: BarChart2, label: 'Analytics', id: 'analytics' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-accent-green',
    busy: 'bg-accent-orange',
    idle: 'bg-ink-soft',
  };
  return (
    <span className="relative flex h-2 w-2">
      {status === 'busy' && (
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-orange opacity-60"
          style={{
            animation: 'status-ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
          }}
        />
      )}
      <span
        className={`relative inline-flex rounded-full h-2 w-2 ${colors[status] ?? 'bg-ink-soft'}`}
      />
    </span>
  );
}

export default function Sidebar({
  selectedRepo,
  onSelectRepo,
}: {
  selectedRepo: string;
  onSelectRepo: (id: string) => void;
}) {
  const [activeNav, setActiveNav] = useState('repos');

  return (
    <aside
      className="w-[240px] shrink-0 flex flex-col h-screen border-r border-border"
      style={{ background: 'var(--bg-subtle)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 h-[56px] border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
          <Zap size={14} strokeWidth={2.5} className="text-bg" />
        </div>
        <span className="text-[14px] font-semibold text-ink">CodeKang</span>
        <button className="ml-auto">
          <ChevronDown size={13} className="text-ink-soft" />
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 pt-3 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] mb-0.5 transition-colors ${
                activeNav === item.id
                  ? 'bg-brand-dim text-brand font-medium'
                  : 'text-ink-muted hover:text-ink hover:bg-bg-muted'
              }`}
            >
              <Icon size={14} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
            Repositories
          </span>
          <button className="p-0.5 rounded hover:bg-bg-muted text-ink-soft">
            <Plus size={12} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Repo List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {repos.map((repo) => (
          <button
            key={repo.id}
            onClick={() => onSelectRepo(repo.id)}
            className={`w-full text-left px-2.5 py-2.5 rounded-lg transition-all ${
              selectedRepo === repo.id
                ? 'bg-bg-muted border border-border'
                : 'hover:bg-bg-muted'
            }`}
          >
            <div className="flex items-center gap-2">
              <StatusDot status={repo.status} />
              <span
                className={`text-[13px] font-medium truncate flex-1 ${selectedRepo === repo.id ? 'text-ink' : 'text-ink-muted'}`}
              >
                {repo.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 pl-4 text-[11.5px] text-ink-soft">
              <span className="flex items-center gap-1">
                <GitPullRequest size={10} strokeWidth={2} />
                {repo.prs} PRs
              </span>
              <span className="flex items-center gap-1">
                <AlertCircle size={10} strokeWidth={2} />
                {repo.issues} Issues
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* KangBot Status Footer */}
      <div
        className="border-t border-border p-3 mx-2 my-2 rounded-lg"
        style={{ background: 'var(--brand-dim)' }}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="kangbot-pulse absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
          </span>
          <span className="text-[12px] font-semibold text-brand">
            KangBot Active
          </span>
        </div>
        <p className="text-[11px] text-ink-soft mt-1 pl-4">
          Monitoring 3 repos
        </p>
      </div>

      {/* User */}
      <div className="border-t border-border px-3 py-2.5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-accent-purple flex items-center justify-center text-[11px] font-bold text-white">
          J
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-medium text-ink truncate">
            Jagdeep
          </div>
          <div className="text-[11px] text-ink-soft">Pro Plan</div>
        </div>
        <Settings size={13} className="text-ink-soft" strokeWidth={1.8} />
      </div>
    </aside>
  );
}
