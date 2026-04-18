'use client';

import {
  ChevronDown,
  MessageSquareText,
  HelpCircle,
  BookOpen,
  GitPullRequest,
  Search,
  Plus,
  MoreHorizontal,
  PanelLeft,
  Settings,
} from 'lucide-react';

const nav = [
  { icon: MessageSquareText, label: 'Sessions', active: true },
  { icon: HelpCircle, label: 'Ask' },
  { icon: BookOpen, label: 'Wiki' },
  { icon: GitPullRequest, label: 'Review' },
];

const recent = [
  {
    title: 'Migrate gradient text to #317CFF',
    time: '1 hour ago',
    status: '2 open',
    statusColor: 'text-accent-green',
    active: true,
    dot: true,
  },
  {
    title: 'Add Github troubleshooting to docs',
    time: '2 hours ago',
    status: '1 merged',
    statusColor: 'text-violet-600',
  },
  {
    title: 'Update icons in account page',
    time: '4 hours ago',
    status: '1 merged',
    statusColor: 'text-violet-600',
  },
];

export default function Sidebar() {
  return (
    <aside className="w-[240px] shrink-0 bg-bg-subtle border-r border-border flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-[52px] border-b border-border-subtle">
        <button className="flex items-center gap-1.5 text-[13px] font-medium text-ink hover:bg-black/5 rounded-md px-1.5 py-1 transition-colors">
          <span className="cognition-logo" />
          <span>Cognition</span>
          <ChevronDown size={13} className="text-ink-soft" strokeWidth={2} />
        </button>
        <button className="p-1 rounded-md hover:bg-black/5 transition-colors">
          <PanelLeft size={15} className="text-ink-muted" strokeWidth={1.8} />
        </button>
      </div>

      {/* Main nav */}
      <nav className="px-2 pt-3 pb-2">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] transition-colors ${
                item.active
                  ? 'bg-black/[0.06] text-ink font-medium'
                  : 'text-ink-muted hover:bg-black/[0.04]'
              }`}
            >
              <Icon size={15} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Recent section */}
      <div className="px-2 mt-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1.5 text-ink-soft">
          <span className="text-[12px] font-medium">Recent</span>
          <div className="flex items-center gap-0.5">
            <button className="p-1 rounded hover:bg-black/[0.06] transition-colors">
              <Search size={12} strokeWidth={2} />
            </button>
            <button className="p-1 rounded hover:bg-black/[0.06] transition-colors">
              <Plus size={12} strokeWidth={2} />
            </button>
            <button className="p-1 rounded hover:bg-black/[0.06] transition-colors">
              <MoreHorizontal size={12} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="mt-1 space-y-0.5">
          {recent.map((r, i) => (
            <button
              key={i}
              className={`w-full text-left px-2 py-2 rounded-md transition-colors group ${
                r.active ? 'bg-black/[0.06]' : 'hover:bg-black/[0.04]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13px] font-medium text-ink truncate">
                  {r.title}
                </div>
                {r.dot && (
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ink-soft shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11.5px] text-ink-soft">
                <span>{r.time}</span>
                <span className="text-ink-soft">·</span>
                <span className={`flex items-center gap-1 ${r.statusColor}`}>
                  <GitPullRequest size={10} strokeWidth={2} />
                  {r.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings footer */}
      <div className="border-t border-border-subtle p-2">
        <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] text-ink-muted hover:bg-black/[0.04] transition-colors">
          <Settings size={15} strokeWidth={1.8} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
