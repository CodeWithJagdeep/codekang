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
  Plus,
  PanelLeft,
  Settings,
  X,
  LogOut,
  Loader2,
  Bell,
  Zap,
  CreditCard,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import {
  signOut,
  fetchConnectedRepos,
  fetchRepoPullRequests,
  type IGitHubPR,
  type User,
  type ISubscription,
} from '@/lib/auth';
import { useOrg } from '@/lib/org-context';
import { useRouter } from 'next/navigation';
import CreateOrgModal from './CreateOrgModal';

export type Repo = {
  id: string;
  name: string;
  org: string;
  prs: number;
  issues: number;
  status: 'active' | 'busy' | 'idle';
  branch: string;
  isInstalled: boolean;
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
  user,
  subscription,
  onUpgrade,
  onAddCredits,
}: {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (val: boolean) => void;
  user?: User | null;
  subscription?: ISubscription | null;
  onUpgrade?: () => void;
  onAddCredits?: () => void;
} = {}) {
  const pathname = usePathname();
  const { resolved } = useTheme();
  const L = resolved === 'light';

  // Force dark background and sleek dark mode colour tokens for the sidebar
  const sideBg = '#1c1c1c';
  const sideBorder = '#2a2a2a';
  const dropBg = '#1c1c1c';
  const textPrimary = '#e8e8e8';
  const textMuted = '#a1a1aa';
  const textDim = '#6d6d6d';
  const activeItemBg = 'rgba(255,255,255,0.06)';
  const hoverItemBg = 'rgba(255,255,255,0.06)';
  const iconBg = '#2a2a2e';

  const router = useRouter();
  const { orgs, selectedOrgId, setSelectedOrgId, selectedOrg, refreshOrgs } = useOrg();

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);

  const displayOrg = selectedOrg?.name ?? '…';

  const isFreePlan = !user?.plan || user.plan === 'free';
  const creditsRemaining = subscription && subscription.plan.creditsPerMonth !== 'unlimited'
    ? (subscription.plan.creditsPerMonth as number) - subscription.creditsUsed
    : null;
  const isLowCredits = creditsRemaining !== null && subscription
    ? creditsRemaining <= 10 || creditsRemaining / (subscription.plan.creditsPerMonth as number) < 0.2
    : false;

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
    <>
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`shrink-0 flex flex-col h-dvh absolute md:relative z-40 transition-all duration-300 ease-in-out ${effectivelyCollapsed ? 'w-[64px]' : 'w-[240px]'
          } ${isMobileOpen
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

        {/* ── Org Switcher ── */}
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
              {selectedOrg ? selectedOrg.name[0].toUpperCase() : '#'}
            </div>
            <div
              className={`flex items-center transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${effectivelyCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100 flex-1'}`}
            >
              <span
                className="text-[14px] font-medium flex-1 truncate"
                style={{ color: textPrimary }}
              >
                {displayOrg}
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
              className="absolute top-[48px] left-2 w-[224px] rounded-lg border shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200"
              style={{ background: dropBg, borderColor: sideBorder }}
            >
              {/* Header */}
              <div className="px-3 pt-3 pb-2 border-b" style={{ borderColor: sideBorder }}>
                <div
                  className="text-[11px] font-medium uppercase tracking-wider"
                  style={{ color: textDim }}
                >
                  Switch Organization
                </div>
              </div>

              <div className="p-1.5 max-h-[260px] overflow-y-auto custom-scrollbar">
                {orgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => { setSelectedOrgId(org.id); setIsOrgDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 text-left px-2.5 py-2 text-[13px] rounded-md transition-colors"
                    style={{
                      color: textPrimary,
                      background: selectedOrgId === org.id ? activeItemBg : 'transparent',
                    }}
                    onMouseEnter={(e) => { if (selectedOrgId !== org.id) e.currentTarget.style.background = hoverItemBg; }}
                    onMouseLeave={(e) => { if (selectedOrgId !== org.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{
                        background: org.isPersonal ? iconBg : 'rgba(249,115,22,0.12)',
                        color: org.isPersonal ? textDim : '#f8423b',
                      }}
                    >
                      {org.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{org.name}</span>
                        {org.isPersonal && (
                          <span
                            className="text-[9px] font-semibold px-1 py-0.5 rounded shrink-0"
                            style={{ background: iconBg, color: textDim }}
                          >
                            personal
                          </span>
                        )}
                      </div>
                      {org.description && (
                        <div className="text-[11px] truncate" style={{ color: textDim }}>
                          {org.description}
                        </div>
                      )}
                    </div>
                    {selectedOrgId === org.id && (
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#f8423b' }} />
                    )}
                  </button>
                ))}

                {orgs.length === 0 && (
                  <div className="px-2.5 py-3 text-[12px] text-center" style={{ color: textDim }}>
                    Loading organizations…
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-1.5 border-t" style={{ borderColor: sideBorder }}>
                <button
                  onClick={() => {
                    setIsOrgDropdownOpen(false);
                    setShowCreateOrg(true);
                  }}
                  className="w-full flex items-center gap-2 text-left px-2.5 py-2 text-[13px] rounded-md transition-colors"
                  style={{ color: textPrimary }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = hoverItemBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Plus size={15} style={{ color: '#f8423b' }} />
                  Create organization
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

        {/* ── Footer ── */}
        <div
          style={{ borderTop: `1px solid ${sideBorder}` }}
          className={`p-2 transition-all duration-300 space-y-0.5 ${effectivelyCollapsed ? 'flex flex-col items-center gap-1 space-y-0' : ''}`}
        >
          {/* Upgrade pill — expanded */}
          {!effectivelyCollapsed && isFreePlan && onUpgrade && (
            <button
              onClick={onUpgrade}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold mb-1 transition-opacity hover:opacity-90"
              style={{ background: '#f8423b', color: '#fff' }}
            >
              <Zap size={13} strokeWidth={2.5} />
              Upgrade to Pro
            </button>
          )}

          {/* Low credits row — expanded */}
          {!effectivelyCollapsed && isLowCredits && onAddCredits && (
            <button
              onClick={onAddCredits}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] font-semibold mb-1 border transition-colors hover:bg-white/5"
              style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171', background: 'rgba(239,68,68,0.06)' }}
            >
              <span className="flex items-center gap-1.5">
                <CreditCard size={12} />
                {creditsRemaining !== null && creditsRemaining <= 0 ? 'No credits left' : `${creditsRemaining} credits left`}
              </span>
              <span>Add Credits</span>
            </button>
          )}

          {/* Upgrade icon — collapsed */}
          {effectivelyCollapsed && isFreePlan && onUpgrade && (
            <button
              onClick={onUpgrade}
              title="Upgrade to Pro"
              className="p-2.5 rounded-md transition-colors"
              style={{ background: 'rgba(249,115,22,0.1)', color: '#f8423b' }}
            >
              <Zap size={16} strokeWidth={2.5} />
            </button>
          )}

          {/* Credits icon — collapsed */}
          {effectivelyCollapsed && isLowCredits && onAddCredits && (
            <button
              onClick={onAddCredits}
              title={creditsRemaining !== null && creditsRemaining <= 0 ? 'No credits left' : `${creditsRemaining} credits left`}
              className="p-2.5 rounded-md transition-colors"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}
            >
              <CreditCard size={16} />
            </button>
          )}

          {/* Notification bell */}
          <Link
            href="/dashboard/notifications"
            title="Notifications"
            onClick={() => {
              if (isMobileOpen && setIsMobileOpen) setIsMobileOpen(false);
            }}
            className={`flex items-center rounded-md text-[14px] transition-all duration-300 ${effectivelyCollapsed ? 'justify-center p-2.5 max-w-[40px] w-full' : 'gap-3 px-3 py-2 w-full'}`}
            style={{
              background: pathname === '/dashboard/notifications' ? activeItemBg : 'transparent',
              color: pathname === '/dashboard/notifications' ? textPrimary : textMuted,
            }}
            onMouseEnter={(e) => {
              if (pathname !== '/dashboard/notifications') e.currentTarget.style.background = hoverItemBg;
            }}
            onMouseLeave={(e) => {
              if (pathname !== '/dashboard/notifications') e.currentTarget.style.background = 'transparent';
            }}
          >
            <Bell size={18} strokeWidth={1.5} className="shrink-0" style={{ opacity: pathname === '/dashboard/notifications' ? 1 : 0.7 }} />
            <span
              className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${effectivelyCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'} ${pathname === '/dashboard/notifications' ? 'font-medium' : 'font-normal'}`}
            >
              Notifications
            </span>
          </Link>

          <Link
            href="/settings"
            title={effectivelyCollapsed ? 'Settings' : undefined}
            onClick={() => {
              if (isMobileOpen && setIsMobileOpen) setIsMobileOpen(false);
            }}
            className={`flex items-center rounded-md text-[14px] transition-all duration-300 ${effectivelyCollapsed ? 'justify-center p-2.5 max-w-[40px] w-full' : 'gap-3 px-3 py-2 w-full'}`}
            style={{ color: textMuted }}
            onMouseEnter={(e) => (e.currentTarget.style.background = hoverItemBg)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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

      {showCreateOrg && (
        <CreateOrgModal
          onClose={() => setShowCreateOrg(false)}
          onCreated={async (org) => {
            setShowCreateOrg(false);
            await refreshOrgs();
            setSelectedOrgId(org.id);
          }}
        />
      )}
    </>
  );
}
