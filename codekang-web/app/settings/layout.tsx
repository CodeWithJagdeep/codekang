'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Search } from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  href: string;
  badge?: {
    text: string;
    color: string;
  };
};

type NavGroup = {
  title: string;
  titleBadge?: {
    text: string;
    color: string;
  };
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Account settings',
    items: [
      { id: 'profile', label: 'Profile', href: '/settings' },
      { id: 'support', label: 'Support', href: '/settings/support' },
    ],
  },
  {
    title: "Devin's resources",
    items: [
      { id: 'sessions', label: 'Sessions', href: '/settings/sessions' },
      {
        id: 'schedules',
        label: 'Schedules',
        href: '/settings/schedules',
        badge: { text: 'New', color: 'text-emerald-400' },
      },
      { id: 'knowledge', label: 'Knowledge', href: '/settings/knowledge' },
      { id: 'playbooks', label: 'Playbooks', href: '/settings/playbooks' },
      { id: 'secrets', label: 'Secrets', href: '/settings/secrets' },
    ],
  },
  {
    title: 'Membership',
    items: [
      { id: 'members', label: 'Members', href: '/settings/members' },
      {
        id: 'service-users',
        label: 'Service users',
        href: '/settings/service-users',
      },
      {
        id: 'api-keys',
        label: 'API keys',
        href: '/settings/api-keys',
        badge: { text: 'Legacy', color: 'text-amber-500' },
      },
    ],
  },
  {
    title: 'Environment',
    titleBadge: { text: 'Beta', color: 'text-slate-400' },
    items: [
      {
        id: 'env-config',
        label: 'Environment configuration',
        href: '/settings/environment-configuration',
      },
      {
        id: 'code-indexing',
        label: 'Code Indexing',
        href: '/settings/code-indexing',
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'general', label: 'General', href: '/settings/general' },
      {
        id: 'customization',
        label: 'Customization',
        href: '/settings/customization',
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

  return (
    <div
      className="flex h-screen w-screen overflow-hidden text-[#e8e8e8]"
      style={{ background: '#121214' }}
    >
      {/* ── Settings Sidebar ── */}
      <aside
        className="w-[260px] shrink-0 flex flex-col h-full overflow-y-auto custom-scrollbar pt-5 pb-6"
        style={{ background: '#1e1e1e', borderRight: '1px solid #2a2a2a' }}
      >
        <div className="px-4 mb-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[13px] font-medium text-[#a1a1aa] hover:text-[#e8e8e8] transition-colors w-fit"
          >
            <ChevronLeft size={16} strokeWidth={2} />
            Back
          </Link>
        </div>

        <div className="px-4 mb-6">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#a1a1aa]"
              size={14}
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search settings..."
              className="w-full bg-white/5 border border-[#333] rounded-md py-1.5 pl-8 pr-3 text-[13px] outline-none focus:border-[#555] placeholder:text-[#666] transition-colors"
            />
          </div>
        </div>

        <div className="px-2 space-y-6">
          {NAV_GROUPS.map((group, i) => (
            <div key={i}>
              <div className="px-3 mb-1.5 flex items-center gap-2">
                <span className="text-[12px] font-medium text-[#6d6d6d]">
                  {group.title}
                </span>
                {group.titleBadge && (
                  <span
                    className={`text-[10px] font-medium ${group.titleBadge.color}`}
                  >
                    {group.titleBadge.text}
                  </span>
                )}
                {/* Note: The reference image shows a chevron next to title if it's collapsible, we'll keep it simple for now */}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors"
                      style={{
                        background: isActive
                          ? 'rgba(255,255,255,0.06)'
                          : 'transparent',
                        color: isActive ? '#e8e8e8' : '#a1a1aa',
                      }}
                    >
                      <span
                        className={isActive ? 'font-medium' : 'font-normal'}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[11px] font-medium ${item.badge.color}`}
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

      {/* ── Main Content Area ── */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar relative">
        {/* Breadcrumb Header */}
        <div className="absolute top-0 left-0 w-full p-6 pb-2 pointer-events-none">
          <div className="text-[13px] font-medium text-[#6d6d6d]">
            Settings <span className="mx-1">/</span>{' '}
            <span className="text-[#e8e8e8]">Profile</span>
          </div>
        </div>

        <div className="pt-20 px-8 max-w-4xl max-h-full pb-24">{children}</div>
      </main>
    </div>
  );
}
