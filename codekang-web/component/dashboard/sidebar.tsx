'use client';

import Image from 'next/image';
import {
  MessageSquareText,
  HelpCircle,
  BookOpen,
  GitPullRequest,
  PanelLeft,
  Settings,
  ChevronDown,
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
  { icon: MessageSquareText, label: 'Sessions', id: 'sessions' },
  { icon: HelpCircle, label: 'Ask', id: 'ask' },
  { icon: BookOpen, label: 'Wiki', id: 'wiki' },
  { icon: GitPullRequest, label: 'Review', id: 'review' },
];

const INVOLVED_PRS = [
  {
    title: 'fix: complete OAuth flow in auth service',
    branch: 'devin-ai-integration',
    time: '5 days ago',
  },
  {
    title: 'feat: add vector search to autonomous agent',
    branch: 'feat/vector-search',
    time: '2 days ago',
  },
];

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
  // suppress unused prop warnings while keeping the API stable
  void selectedRepo;
  void onSelectRepo;
  void repos;
  void onAddRepo;

  return (
    <aside
      className="w-[240px] shrink-0 flex flex-col h-screen"
      style={{ background: '#1c1c1c', borderRight: '1px solid #2a2a2a' }}
    >
      {/* ── User header ── */}
      <div
        className="flex items-center justify-between px-3 h-[52px]"
        style={{ borderBottom: '1px solid #2a2a2a' }}
      >
        {/* Avatar + Name */}
        <button className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-white/5 transition-colors">
          {/* Avatar circle with CodeKang logo */}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: '#e11d48', color: '#fff' }}
          >
            J
          </div>
          <span
            className="text-[13px] font-medium"
            style={{ color: '#e8e8e8' }}
          >
            Jagdeep singh
          </span>
          <ChevronDown size={12} style={{ color: '#666' }} strokeWidth={2} />
        </button>

        {/* Panel toggle */}
        <button className="p-1 rounded-md hover:bg-white/5 transition-colors">
          <PanelLeft size={15} style={{ color: '#666' }} strokeWidth={1.8} />
        </button>
      </div>

      {/* ── Main Nav ── */}
      <nav className="px-2 pt-2 pb-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className="w-full flex items-center gap-2.5 px-2 py-[7px] rounded-md text-[13px] transition-colors"
              style={{
                background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: isActive ? '#e8e8e8' : '#999999',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <Icon size={15} strokeWidth={1.7} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ── Created PRs ── */}
      <div className="px-4 mt-4 mb-1.5">
        <span className="text-[12px] font-medium" style={{ color: '#888' }}>
          Created PRs
        </span>
      </div>
      <div className="px-4">
        <span className="text-[12px]" style={{ color: '#555' }}>
          No pull requests
        </span>
      </div>

      {/* ── Involved PRs ── */}
      <div className="px-4 mt-5 mb-2">
        <span className="text-[12px] font-medium" style={{ color: '#888' }}>
          Involved PRs
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {INVOLVED_PRS.map((pr, i) => (
          <button
            key={i}
            className="w-full text-left px-2 py-2 rounded-md transition-colors hover:bg-white/5"
          >
            <div className="flex items-start gap-2">
              <GitPullRequest
                size={14}
                strokeWidth={2}
                className="shrink-0 mt-0.5"
                style={{ color: '#22c55e' }}
              />
              <div className="min-w-0">
                <div
                  className="text-[12.5px] font-medium truncate"
                  style={{ color: '#22c55e' }}
                >
                  {pr.title}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: '#666' }}>
                  {pr.time} · {pr.branch}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Settings Footer ── */}
      <div style={{ borderTop: '1px solid #2a2a2a' }} className="p-2">
        <button
          className="w-full flex items-center gap-2.5 px-2 py-[7px] rounded-md text-[13px] transition-colors hover:bg-white/5"
          style={{ color: '#999' }}
        >
          <Settings size={15} strokeWidth={1.7} />
          Settings
        </button>
      </div>
    </aside>
  );
}
