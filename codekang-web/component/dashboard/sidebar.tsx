'use client';

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

const NAV_ITEMS = [
  { icon: MessageSquareText, label: 'Sessions', id: 'sessions' },
  { icon: HelpCircle, label: 'Ask', id: 'ask' },
  { icon: BookOpen, label: 'Wiki', id: 'wiki' },
  { icon: GitPullRequest, label: 'Review', id: 'review' },
];

const INVOLVED_PRS = [
  {
    title: 'fix: complete OAuth flow in LoginMo...',
    branch: 'devin-ai-integration',
    time: '5 days ago',
    active: true,
  },
];

export default function Sidebar({
  activeNav,
  onNavChange,
}: {
  activeNav: string;
  onNavChange: (id: string) => void;
  // Compatibility props
  selectedRepo?: string | null;
  onSelectRepo?: (id: string) => void;
  repos?: Repo[];
  onAddRepo?: () => void;
}) {
  return (
    <aside
      className="w-[240px] shrink-0 flex flex-col h-screen"
      style={{ background: '#1c1c1c', borderRight: '1px solid #2a2a2a' }}
    >
      {/* ── User Header ── */}
      <div
        className="flex items-center justify-between px-3 h-[52px]"
        style={{ borderBottom: '1px solid #2a2a2a' }}
      >
        <button className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-white/5 transition-colors group">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: '#2a2a2e', color: '#9d9ea3' }}
          >
            J
          </div>
          <span
            className="text-[14px] font-medium"
            style={{ color: '#e8e8e8' }}
          >
            Jagdeep singh
          </span>
          <ChevronDown
            size={14}
            style={{ color: '#52525b' }}
            strokeWidth={1.5}
          />
        </button>
        <button className="p-1 px-1.5 rounded-md hover:bg-white/5 transition-colors border border-transparent hover:border-[#2a2a2a]">
          <PanelLeft size={16} style={{ color: '#6d6d6d' }} strokeWidth={1.5} />
        </button>
      </div>

      {/* ── Main Nav ── */}
      <nav className="px-2 pt-2 pb-1 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[14px] transition-colors"
              style={{
                background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: isActive ? '#e8e8e8' : '#999999',
              }}
            >
              <Icon
                size={18}
                strokeWidth={1.5}
                style={{ opacity: isActive ? 1 : 0.7 }}
              />
              <span className={isActive ? 'font-medium' : 'font-normal'}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Sections ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-4">
        {/* Created PRs */}
        <div className="px-4 mb-2">
          <div
            className="text-[13px] font-medium mb-1"
            style={{ color: '#6d6d6d' }}
          >
            Created PRs
          </div>
          <div className="text-[13px]" style={{ color: '#444' }}>
            No pull requests
          </div>
        </div>

        {/* Involved PRs */}
        <div className="px-4 mt-6 mb-2">
          <div
            className="text-[13px] font-medium mb-2"
            style={{ color: '#6d6d6d' }}
          >
            Involved PRs
          </div>
          <div className="space-y-1">
            {INVOLVED_PRS.map((pr, i) => (
              <button
                key={i}
                className="w-full text-left p-1 rounded-md transition-colors hover:bg-white/5"
              >
                <div className="flex items-start gap-2.5">
                  <GitPullRequest
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 mt-0.5"
                    style={{ color: '#00cc66' }} // Using the specific green from the image if allowed, or grey if not. Image 625 shows green.
                  />
                  <div className="min-w-0">
                    <div
                      className="text-[13.5px] font-medium truncate"
                      style={{ color: '#e8e8e8' }}
                    >
                      {pr.title}
                    </div>
                    <div
                      className="text-[12px] mt-0.5"
                      style={{ color: '#666' }}
                    >
                      {pr.time} · {pr.branch}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Settings Footer ── */}
      <div style={{ borderTop: '1px solid #2a2a2a' }} className="p-2">
        <button
          onClick={() => onNavChange('settings')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[14px] transition-colors hover:bg-white/5"
          style={{ color: '#999' }}
        >
          <Settings size={18} strokeWidth={1.5} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
