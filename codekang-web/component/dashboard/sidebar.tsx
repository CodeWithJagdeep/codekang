'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderGit2,
  GitPullRequest,
  Blocks,
  BarChart2,
  Bot,
  ChevronDown,
  RefreshCcw,
  Plus,
  PanelLeft,
  Settings,
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
  { icon: FolderGit2, label: 'Repositories', id: 'repositories' },
  { icon: GitPullRequest, label: 'Reviews', id: 'reviews' },
  { icon: Bot, label: 'Agents', id: 'agents' },
  { icon: Blocks, label: 'Integrations', id: 'integrations' },
  { icon: BarChart2, label: 'Reports', id: 'reports' },
];

const INVOLVED_PRS = [
  {
    title: 'fix: complete OAuth flow in LoginMo...',
    branch: 'devin-ai-integration',
    time: '5 days ago',
    active: true,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  return (
    <aside
      className="w-[240px] shrink-0 flex flex-col h-screen relative z-40"
      style={{ background: '#1c1c1c', borderRight: '1px solid #2a2a2a' }}
    >
      {/* ── User Header (Organization Dropdown) ── */}
      <div
        className="flex items-center justify-between px-3 h-[52px] relative cursor-pointer hover:bg-white/2"
        style={{ borderBottom: '1px solid #2a2a2a' }}
      >
        <button
          onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
          className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-white/5 transition-colors group flex-1 text-left"
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: '#2a2a2e', color: '#9d9ea3' }}
          >
            J
          </div>
          <span
            className="text-[14px] font-medium flex-1 truncate"
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

        {isOrgDropdownOpen && (
          <>
            {/* Click-away overlay */}
            <div
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setIsOrgDropdownOpen(false)}
            />
            {/* Dropdown Menu */}
            <div
              className="absolute top-[48px] left-2 w-[220px] rounded-lg border shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200"
              style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}
            >
              <div className="p-3 border-b" style={{ borderColor: '#2a2a2a' }}>
                <div
                  className="text-[11px] font-medium uppercase tracking-wider mb-1"
                  style={{ color: '#6d6d6d' }}
                >
                  Current Project
                </div>
                <div
                  className="text-[13px] font-medium flex items-center gap-2"
                  style={{ color: '#e8e8e8' }}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                    style={{ background: '#2a2a2e', color: '#9d9ea3' }}
                  >
                    C
                  </div>
                  codekang-platform
                </div>
              </div>
              <div className="p-1.5">
                <button
                  className="w-full flex items-center gap-2 text-left px-2.5 py-2 text-[13px] rounded-md transition-colors"
                  style={{ color: '#e8e8e8' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      'rgba(255,255,255,0.06)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <RefreshCcw size={14} style={{ color: '#888' }} />
                  Refresh list
                </button>
                <button
                  className="w-full flex items-center gap-2 text-left px-2.5 py-2 text-[13px] rounded-md transition-colors"
                  style={{ color: '#e8e8e8' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      'rgba(255,255,255,0.06)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <Plus size={16} style={{ color: '#f97316' }} />
                  Add project
                </button>
              </div>
            </div>
          </>
        )}

        <button className="p-1 px-1.5 ml-1 rounded-md hover:bg-white/5 transition-colors border border-transparent hover:border-[#2a2a2a] shrink-0">
          <PanelLeft size={16} style={{ color: '#6d6d6d' }} strokeWidth={1.5} />
        </button>
      </div>

      {/* ── Main Nav ── */}
      <nav className="px-2 pt-2 pb-1 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const href =
            item.id === 'repositories' ? '/dashboard' : `/dashboard/${item.id}`;

          const isActive =
            item.id === 'repositories'
              ? pathname === '/dashboard'
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={item.id}
              href={href}
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
            </Link>
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
                    style={{ color: '#00cc66' }}
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
        <Link
          href="/settings"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[14px] transition-colors hover:bg-white/5"
          style={{ color: '#999' }}
        >
          <Settings size={18} strokeWidth={1.5} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
