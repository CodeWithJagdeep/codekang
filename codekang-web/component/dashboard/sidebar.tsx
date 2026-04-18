'use client';

import Image from 'next/image';
import {
  GitPullRequest,
  AlertCircle,
  LayoutDashboard,
  GitFork,
  BarChart2,
  Settings,
  Plus,
  ChevronRight,
  Zap,
} from 'lucide-react';

export type Repo = {
  id: string;
  name: string;
  org: string;
  prs: number;
  issues: number;
  status: 'active' | 'busy' | 'idle';
  branch: string;
};

const NAV = [
  { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
  { icon: GitFork, label: 'Repositories', id: 'repos' },
  { icon: BarChart2, label: 'Analytics', id: 'analytics' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

function StatusDot({ status }: { status: string }) {
  const col =
    { active: '#22c55e', busy: '#f59e0b', idle: '#555' }[status] ?? '#555';
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {status === 'busy' && (
        <span
          className="kangpulse absolute inline-flex h-full w-full rounded-full opacity-60"
          style={{ background: col }}
        />
      )}
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ background: col }}
      />
    </span>
  );
}

export default function Sidebar({
  selectedRepo,
  onSelectRepo,
  activeNav,
  onNavChange,
  repos,
  onAddRepo,
}: {
  selectedRepo: string | null;
  onSelectRepo: (id: string) => void;
  activeNav: string;
  onNavChange: (id: string) => void;
  repos: Repo[];
  onAddRepo: () => void;
}) {
  return (
    <aside
      className="w-[220px] shrink-0 flex flex-col h-screen border-r"
      style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 h-[56px] border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <Image
          src="/brandlogo/logo-transparent.png"
          alt="CodeKang"
          width={28}
          height={28}
          className="object-contain"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(18%) sepia(96%) saturate(6932%) hue-rotate(339deg) brightness(90%) contrast(90%)',
          }}
        />
        <span className="text-[14px] font-bold" style={{ color: 'var(--ink)' }}>
          CodeKang
        </span>
      </div>

      {/* Nav */}
      <nav className="px-2 pt-3 pb-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] mb-0.5 transition-colors"
              style={{
                background: active ? 'var(--brand-dim)' : 'transparent',
                color: active ? 'var(--brand)' : 'var(--ink-muted)',
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon size={14} strokeWidth={1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Repos section */}
      {activeNav !== 'overview' && (
        <>
          <div className="px-4 pt-3 pb-1 flex items-center justify-between">
            <span
              className="text-[10.5px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--ink-soft)' }}
            >
              Repositories
            </span>
            <button
              onClick={onAddRepo}
              style={{ color: 'var(--ink-soft)' }}
              className="hover:text-white transition-colors"
            >
              <Plus size={12} strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {repos.map((repo) => {
              const active = selectedRepo === repo.id;
              return (
                <button
                  key={repo.id}
                  onClick={() => onSelectRepo(repo.id)}
                  className="w-full text-left px-2.5 py-2 rounded-lg transition-all"
                  style={{
                    background: active ? 'var(--bg-muted)' : 'transparent',
                    border: active
                      ? '1px solid var(--border)'
                      : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <StatusDot status={repo.status} />
                    <span
                      className="text-[12.5px] font-medium truncate flex-1"
                      style={{
                        color: active ? 'var(--ink)' : 'var(--ink-muted)',
                      }}
                    >
                      {repo.name}
                    </span>
                    {active && (
                      <ChevronRight
                        size={11}
                        style={{ color: 'var(--ink-soft)' }}
                      />
                    )}
                  </div>
                  <div
                    className="flex items-center gap-3 mt-1 pl-4 text-[11px]"
                    style={{ color: 'var(--ink-soft)' }}
                  >
                    <span className="flex items-center gap-1">
                      <GitPullRequest size={9} strokeWidth={2} /> {repo.prs}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle size={9} strokeWidth={2} /> {repo.issues}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* KangBot footer */}
      <div
        className="mx-2 mb-2 rounded-lg p-2.5"
        style={{
          background: 'var(--brand-dim)',
          border: '1px solid var(--brand-mid)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className="kangpulse absolute inline-flex h-full w-full rounded-full"
              style={{ background: 'var(--brand)' }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: 'var(--brand)' }}
            />
          </span>
          <span
            className="text-[11.5px] font-semibold"
            style={{ color: 'var(--brand)' }}
          >
            KangBot Active
          </span>
        </div>
        <p
          className="text-[10.5px] mt-0.5 pl-4"
          style={{ color: 'var(--ink-soft)' }}
        >
          Monitoring {repos.length} repos
        </p>
      </div>

      {/* User */}
      <div
        className="border-t px-3 py-2.5 flex items-center gap-2.5"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: 'var(--brand)' }}
        >
          J
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-[12px] font-medium"
            style={{ color: 'var(--ink)' }}
          >
            Jagdeep
          </div>
          <div className="text-[10.5px]" style={{ color: 'var(--ink-soft)' }}>
            Pro Plan
          </div>
        </div>
        <Zap size={12} style={{ color: 'var(--brand)' }} strokeWidth={2.5} />
      </div>
    </aside>
  );
}
