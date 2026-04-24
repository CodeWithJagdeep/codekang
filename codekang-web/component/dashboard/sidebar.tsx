'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderGit2,
  GitPullRequest,
  Blocks,
  BarChart2,
  ChevronDown,
  RefreshCcw,
  Plus,
  PanelLeft,
  Settings,
  X,
  LogOut,
  Loader2,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import {
  signOut,
  fetchConnectedRepos,
  fetchRepoPullRequests,
  type IGitHubPR,
} from '@/lib/auth';

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
  { icon: Blocks, label: 'Integrations', id: 'integrations' },
  { icon: BarChart2, label: 'Reports', id: 'reports' },
];

export default function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
}: {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (val: boolean) => void;
} = {}) {
  const pathname = usePathname();
  const { resolved } = useTheme();
  const L = resolved === 'light';

  // Light mode colour tokens for inline styles
  const sideBg = L ? '#ffffff' : '#1c1c1c';
  const sideBorder = L ? '#e2e4e7' : '#2a2a2a';
  const dropBg = L ? '#ffffff' : '#1c1c1c';
  const textPrimary = L ? '#1c1c1c' : '#e8e8e8';
  const textMuted = L ? '#5f6368' : '#a1a1aa';
  const textDim = L ? '#9aa0a6' : '#6d6d6d';
  const activeItemBg = L ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';
  const hoverItemBg = L ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)';
  const iconBg = L ? '#f1f3f4' : '#2a2a2e';
  const usageBg = L ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.02)';
  const usageBorder = L ? '#e2e4e7' : '#2a2a2a';
  const usageTrack = L ? '#e8eaed' : '#121214';

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [openPRs, setOpenPRs] = useState<(IGitHubPR & { repoName: string; repoOwner: string })[]>([]);
  const [prsLoading, setPrsLoading] = useState(true);

  useEffect(() => {
    async function loadPRs() {
      try {
        const repos = await fetchConnectedRepos();
        const results = await Promise.all(
          repos.map(async (repo) => {
            const prs = await fetchRepoPullRequests(repo.owner, repo.name, 'open');
            return prs.map((pr) => ({ ...pr, repoName: repo.name, repoOwner: repo.owner }));
          }),
        );
        const all = results
          .flat()
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 8);
        setOpenPRs(all);
      } catch {
        // non-blocking
      } finally {
        setPrsLoading(false);
      }
    }
    loadPRs();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOrgDropdownOpen(false);
      }
    }

    if (isOrgDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOrgDropdownOpen]);

  // If it's closed (mobile), we don't care about hover states as much, but we'll apply them for desktop.
  const effectivelyCollapsed = isCollapsed && !isHovered && !isMobileOpen;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`shrink-0 flex flex-col h-dvh absolute md:relative z-40 transition-all duration-300 ease-in-out ${
        effectivelyCollapsed ? 'w-[64px]' : 'w-[240px]'
      } ${
        isMobileOpen
          ? 'translate-x-0 shadow-2xl'
          : '-translate-x-full md:translate-x-0'
      }`}
      style={{ background: sideBg, borderRight: `1px solid ${sideBorder}` }}
    >
      {/* ── Mobile Close Button ── */}
      {isMobileOpen && setIsMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden absolute -right-10 top-3 p-1.5 rounded-full border z-50 shadow-xl"
          style={{
            background: sideBg,
            borderColor: sideBorder,
            color: textMuted,
          }}
        >
          <X size={18} />
        </button>
      )}

      {/* ── User Header (Organization Dropdown) ── */}
      <div
        className={`flex items-center ${effectivelyCollapsed ? 'justify-center px-0' : 'justify-between px-3'} h-[52px] relative cursor-pointer transition-all duration-300 group/header`}
        style={{ borderBottom: `1px solid ${sideBorder}` }}
      >
        <button
          onClick={() => {
            if (effectivelyCollapsed) setIsCollapsed(false);
            else setIsOrgDropdownOpen(!isOrgDropdownOpen);
          }}
          title={effectivelyCollapsed ? 'Expand Sidebar' : undefined}
          className={`flex items-center gap-2 rounded-md ${effectivelyCollapsed ? 'p-1 justify-center' : 'px-1.5 py-1 flex-1'} transition-colors group text-left overflow-hidden`}
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: iconBg, color: textDim }}
          >
            J
          </div>
          <div
            className={`flex items-center transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${effectivelyCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100 flex-1'}`}
          >
            <span
              className="text-[14px] font-medium flex-1 truncate"
              style={{ color: textPrimary }}
            >
              Jagdeep singh
            </span>
            <ChevronDown
              size={14}
              style={{ color: textMuted }}
              strokeWidth={1.5}
            />
          </div>
        </button>

        {!effectivelyCollapsed && isOrgDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-[48px] left-2 w-[220px] rounded-lg border shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200"
            style={{ background: dropBg, borderColor: sideBorder }}
          >
            <div className="p-3 border-b" style={{ borderColor: sideBorder }}>
              <div
                className="text-[11px] font-medium uppercase tracking-wider mb-1"
                style={{ color: textDim }}
              >
                Current Project
              </div>
              <div
                className="text-[13px] font-medium flex items-center gap-2"
                style={{ color: textPrimary }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                  style={{ background: iconBg, color: textDim }}
                >
                  C
                </div>
                codekang-platform
              </div>
            </div>
            <div className="p-1.5">
              <button
                className="w-full flex items-center gap-2 text-left px-2.5 py-2 text-[13px] rounded-md transition-colors"
                style={{ color: textPrimary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = hoverItemBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <RefreshCcw size={14} style={{ color: textMuted }} />
                Refresh list
              </button>
              <button
                className="w-full flex items-center gap-2 text-left px-2.5 py-2 text-[13px] rounded-md transition-colors"
                style={{ color: textPrimary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = hoverItemBg)
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
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
            if (!isCollapsed) setIsOrgDropdownOpen(false);
          }}
          title={isCollapsed && isHovered ? 'Pin Sidebar' : 'Collapse Sidebar'}
          className={`hidden md:block p-1 rounded-md transition-all duration-300 border border-transparent shrink-0 ${effectivelyCollapsed ? 'absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover/header:opacity-100 shadow-md' : 'ml-1 px-1.5'}`}
          style={
            effectivelyCollapsed
              ? { background: sideBg, borderColor: sideBorder }
              : {}
          }
        >
          <PanelLeft
            size={16}
            style={{
              color: textDim,
              opacity: isCollapsed && isHovered ? 0.5 : 1,
            }}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* ── Main Nav ── */}
      <nav
        className={`px-2 pt-2 pb-1 space-y-0.5 ${effectivelyCollapsed ? 'flex flex-col items-center' : ''}`}
      >
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
              onClick={() => {
                if (isMobileOpen && setIsMobileOpen) setIsMobileOpen(false);
              }}
              title={effectivelyCollapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-md text-[14px] transition-all duration-300 ${effectivelyCollapsed ? 'justify-center p-2.5 max-w-[40px]' : 'gap-3 px-3 py-2 max-w-full'}`}
              style={{
                background: isActive ? activeItemBg : 'transparent',
                color: isActive ? textPrimary : textMuted,
              }}
            >
              <Icon
                size={18}
                strokeWidth={1.5}
                className="shrink-0"
                style={{ opacity: isActive ? 1 : 0.7 }}
              />
              <span
                className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${effectivelyCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'} ${isActive ? 'font-medium' : 'font-normal'}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Sections ── */}
      <div
        className={`flex-1 overflow-y-auto custom-scrollbar pt-4 transition-all duration-300 ease-in-out ${effectivelyCollapsed ? 'opacity-0 invisible max-h-0' : 'opacity-100 visible max-h-full'}`}
      >
        <div className="px-4 mb-2">
          <div
            className="text-[13px] font-medium mb-2 whitespace-nowrap"
            style={{ color: textDim }}
          >
            Open Pull Requests
          </div>

          {prsLoading ? (
            <div className="flex items-center gap-2 py-1">
              <Loader2 size={13} className="animate-spin" style={{ color: textDim }} />
              <span className="text-[12px]" style={{ color: textDim }}>Loading…</span>
            </div>
          ) : openPRs.length === 0 ? (
            <div className="text-[13px] whitespace-nowrap" style={{ color: L ? '#b0b3b8' : '#444' }}>
              No open pull requests
            </div>
          ) : (
            <div className="space-y-1">
              {openPRs.map((pr) => (
                <a
                  key={pr.id}
                  href={pr.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left p-1 rounded-md transition-colors hover:bg-white/5 group/pr flex items-start gap-2.5 min-w-0"
                >
                  <GitPullRequest
                    size={14}
                    strokeWidth={2}
                    className="shrink-0 mt-0.5 opacity-70 group-hover/pr:opacity-100 transition-opacity"
                    style={{ color: '#00cc66' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[13px] font-medium truncate"
                      style={{ color: textPrimary }}
                    >
                      {pr.title}
                    </div>
                    <div
                      className="text-[11px] mt-0.5 truncate"
                      style={{ color: textMuted }}
                    >
                      {pr.repoName} · #{pr.number}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Usage Indicator ── */}
      <div
        className={`px-3.5 py-3 mx-2 mb-2 rounded-lg border transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${effectivelyCollapsed ? 'max-h-0 min-h-0 p-0 m-0 opacity-0 border-transparent invisible' : 'max-h-[100px] opacity-100'}`}
        style={{
          background: usageBg,
          borderColor: effectivelyCollapsed ? 'transparent' : usageBorder,
        }}
      >
        <div
          className="flex justify-between text-[11px] font-medium mb-2"
          style={{ color: textMuted }}
        >
          <span>AI Reviews</span>
          <span style={{ color: textPrimary }}>30/100</span>
        </div>
        <div
          className="h-1.5 w-full rounded-full overflow-hidden mb-2.5"
          style={{ background: usageTrack }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: '30%', background: '#f97316' }}
          />
        </div>
        <button
          className="w-full flex items-center justify-center gap-1.5 text-[12px] font-medium transition-colors"
          style={{ color: '#f97316' }}
        >
          Upgrade to Pro
        </button>
      </div>

      {/* ── Settings & Logout Footer ── */}
      <div
        style={{ borderTop: `1px solid ${sideBorder}` }}
        className={`p-2 transition-all duration-300 ${effectivelyCollapsed ? 'flex flex-col items-center gap-1' : ''}`}
      >
        <Link
          href="/settings"
          title={effectivelyCollapsed ? 'Settings' : undefined}
          onClick={() => {
            if (isMobileOpen && setIsMobileOpen) setIsMobileOpen(false);
          }}
          className={`flex items-center rounded-md text-[14px] transition-all duration-300 ${effectivelyCollapsed ? 'justify-center p-2.5 max-w-[40px] w-full' : 'gap-3 px-3 py-2 w-full'}`}
          style={{ color: textMuted }}
        >
          <Settings size={18} strokeWidth={1.5} className="shrink-0" />
          <span
            className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${effectivelyCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}
          >
            Settings
          </span>
        </Link>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={effectivelyCollapsed ? 'Logout' : undefined}
          className={`flex items-center rounded-md text-[14px] transition-all duration-300 disabled:opacity-50 ${effectivelyCollapsed ? 'justify-center p-2.5 max-w-[40px] w-full' : 'gap-3 px-3 py-2 w-full'}`}
          style={{ color: isLoggingOut ? textDim : '#f87171' }}
        >
          <LogOut
            size={18}
            strokeWidth={1.5}
            className={`shrink-0 ${isLoggingOut ? 'animate-pulse' : ''}`}
          />
          <span
            className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${effectivelyCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}
          >
            {isLoggingOut ? 'Signing out…' : 'Logout'}
          </span>
        </button>
      </div>
    </aside>
  );
}
