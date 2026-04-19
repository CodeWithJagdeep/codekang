'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Search,
  Menu,
  User,
  CreditCard,
  LifeBuoy,
  ShieldCheck,
  Bell,
  Blocks,
  Users,
  Settings2,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: { text: string; color: string };
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profile', href: '/settings', icon: User },
      {
        id: 'billing',
        label: 'Billing',
        href: '/settings/billing',
        icon: CreditCard,
        badge: { text: 'Pro', color: 'text-emerald-400' },
      },
      {
        id: 'security',
        label: 'Security',
        href: '/settings/security',
        icon: ShieldCheck,
      },
      {
        id: 'support',
        label: 'Support',
        href: '/settings/support',
        icon: LifeBuoy,
      },
    ],
  },
  {
    title: 'CodeKang',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        href: '/settings/notifications',
        icon: Bell,
      },
      {
        id: 'integrations',
        label: 'Integrations',
        href: '/settings/integrations',
        icon: Blocks,
      },
    ],
  },
  {
    title: 'Workspace',
    items: [
      {
        id: 'members',
        label: 'Members',
        href: '/settings/members',
        icon: Users,
      },
      {
        id: 'audit-log',
        label: 'Audit Log',
        href: '/settings/audit-log',
        icon: ClipboardList,
      },
      {
        id: 'general',
        label: 'General',
        href: '/settings/general',
        icon: Settings2,
      },
    ],
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { resolved } = useTheme();
  const isLight = resolved === 'light';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [pathname]);

  const bg = isLight ? '#f4f5f7' : '#1c1c1c';
  const sideBg = isLight ? '#ffffff' : '#181818';
  const borderColor = isLight ? '#e8eaed' : '#2a2a2a';
  const textPrimary = isLight ? '#1c1c1c' : '#e8e8e8';
  const textMuted = isLight ? '#5f6368' : '#a1a1aa';
  const textDim = isLight ? '#9aa0a6' : '#6d6d6d';
  const activeItemBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';
  const inputBg = isLight ? '#f1f3f4' : 'rgba(255,255,255,0.05)';

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: bg, color: textPrimary }}
    >
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 md:z-auto h-full w-[240px] shrink-0 flex flex-col overflow-y-auto pt-5 pb-6 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
        style={{ background: sideBg, borderRight: `1px solid ${borderColor}` }}
      >
        <div className="px-4 mb-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[13px] font-medium transition-colors w-fit group"
            style={{ color: textMuted }}
          >
            <ChevronLeft
              size={15}
              strokeWidth={2}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Dashboard
          </Link>
        </div>

        <div className="px-4 mb-5">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              size={13}
              style={{ color: textDim }}
            />
            <input
              type="text"
              placeholder="Search settings…"
              className="w-full rounded-lg py-2 pl-8 pr-3 text-[13px] outline-none transition-colors"
              style={{
                background: inputBg,
                border: `1px solid ${borderColor}`,
                color: textPrimary,
              }}
            />
          </div>
        </div>

        <div className="px-2 space-y-5">
          {NAV_GROUPS.map((group, i) => (
            <div key={i}>
              <div
                className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: textDim }}
              >
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all"
                      style={{
                        background: isActive ? activeItemBg : 'transparent',
                        color: isActive ? textPrimary : textMuted,
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      <Icon
                        size={14}
                        strokeWidth={isActive ? 2 : 1.75}
                        style={{ opacity: isActive ? 1 : 0.65, flexShrink: 0 }}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[11px] font-semibold ${item.badge.color}`}
                        >
                          {item.badge.text}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main
        ref={mainRef}
        className="flex-1 min-w-0 h-full overflow-y-auto relative flex flex-col no-scrollbar"
      >
        {/* Sticky Breadcrumb Header */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8 py-3.5 border-b backdrop-blur-md transition-all"
          style={{
            background:
              sideBg === '#181818'
                ? 'rgba(24, 24, 27, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
            borderColor: borderColor,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg border transition-colors"
              style={{ borderColor, color: textMuted }}
            >
              <Menu size={18} />
            </button>
            <div className="text-[13px] font-medium" style={{ color: textDim }}>
              <span className="hidden sm:inline">Settings </span>
              <span
                className="sm:hidden text-[14px] font-semibold"
                style={{ color: textPrimary }}
              >
                Settings
              </span>
              <span className="mx-1" style={{ color: borderColor }}>
                /
              </span>
              <span style={{ color: textPrimary }}>
                {NAV_GROUPS.flatMap((g) => g.items).find(
                  (i) => i.href === pathname,
                )?.label ?? 'Profile'}
              </span>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-[12px] font-medium px-3 py-1.5 rounded-lg border hover:bg-white/5 transition-all"
            style={{ borderColor, color: textMuted }}
          >
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>

        {/* Content area */}
        <div
          className={`px-5 md:px-8 mx-auto w-full py-7 md:py-10 pb-24 flex-1 ${pathname === '/settings/billing' ? 'max-w-6xl' : 'max-w-4xl'}`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
