'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  Search,
  CheckCircle2,
  AlertCircle,
  Info,
  MoreVertical,
  Trash2,
  Check,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { fetchNotifications, markNotificationRead, type INotification } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';

type NotificationType = 'info' | 'success' | 'warning' | 'alert';

interface UINotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
  repoName?: string;
  link?: string | null;
}

const TYPE_CONFIG = {
  info: { icon: Info, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  success: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  warning: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  alert: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
};

function mapBackendNotification(n: INotification): UINotification {
  let type: NotificationType = 'info';
  if (n.type === 'alert' || n.type === 'error') type = 'alert';
  if (n.type === 'success') type = 'success';
  if (n.type === 'warning') type = 'warning';

  return {
    id: n.id,
    title: n.title,
    message: n.message,
    time: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }),
    type,
    read: n.isRead,
    link: n.link,
  };
}

export default function NotificationsPage() {
  const { resolved } = useTheme();
  const L = resolved === 'light';

  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications().then((res) => {
      setNotifications(res.map(mapBackendNotification));
      setIsLoading(false);
    });
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
      })
      .filter((n) =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.repoName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [notifications, filter, searchTerm]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await markNotificationRead(id).catch(() => {});
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    for (const n of unread) {
      await markNotificationRead(n.id).catch(() => {});
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-dvh overflow-hidden" style={{ background: '#1c1c1c' }}>
      {/* ── Header / Breadcrumb ── */}
      <div className="px-4 md:px-8 pt-4 md:pt-6 pb-2">
        <div
          className="flex items-center gap-2 text-[12px] font-medium"
          style={{ color: '#a1a1aa' }}
        >
          <span>Notifications</span>
        </div>
      </div>

      {/* ── Title & Actions ── */}
      <div className="px-4 md:px-8 pb-4 md:pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-[24px] md:text-[28px] font-bold"
            style={{ color: '#e8e8e8' }}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 text-[14px] font-medium px-2 py-0.5 rounded-full bg-[#f8423b] text-white align-middle">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-[13px] mt-1" style={{ color: '#71717a' }}>
            Stay updated with your repository activities and AI reviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex-1 md:flex-none items-center justify-center flex gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: '#27272a', color: '#e8e8e8' }}
          >
            <Check size={16} strokeWidth={2} />
            Mark all as read
          </button>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="px-4 md:px-8 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#121214] rounded-lg border border-[#27272a]/60">
          {(['all', 'unread', 'read'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all capitalize ${
                filter === t
                  ? 'bg-[#27272a] text-[#f4f4f5]'
                  : 'text-[#52525b] hover:text-[#a1a1aa]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div
          className="flex items-center gap-3 px-3 py-2 rounded-md border w-full max-w-[300px]"
          style={{ background: '#121214', borderColor: '#27272a' }}
        >
          <Search size={16} style={{ color: '#71717a' }} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search notifications"
            className="bg-transparent outline-none flex-1 text-[13px] w-full"
            style={{ color: '#e8e8e8' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Notifications List ── */}
      <div className="flex-1 px-4 md:px-8 overflow-y-auto custom-scrollbar pb-8">
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/2 border-b border-white/10">
                <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#71717a]">
                  Activity
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#71717a] hidden md:table-cell">
                  Repository
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#71717a] text-right">
                  Time
                </th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((n) => {
                  const Config = TYPE_CONFIG[n.type];
                  return (
                    <tr
                      key={n.id}
                      className={`group hover:bg-white/2 transition-colors ${!n.read ? 'bg-[#f8423b]/2' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: Config.bg, color: Config.color }}
                          >
                            <Config.icon size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[14px] font-semibold ${!n.read ? 'text-[#f4f4f5]' : 'text-[#a1a1aa]'}`}
                              >
                                {n.title}
                              </span>
                              {!n.read && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#f8423b]" />
                              )}
                            </div>
                            <p className="text-[13px] mt-0.5 line-clamp-1 md:line-clamp-none" style={{ color: n.read ? '#71717a' : '#a1a1aa' }}>
                              {n.message}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        {n.repoName ? (
                          <span className="text-[13px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#a1a1aa]">
                            {n.repoName}
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#52525b]">System</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-[12px]" style={{ color: '#71717a' }}>
                          {n.time}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {!n.read && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              className="p-1.5 rounded-md text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(n.id)}
                            className="p-1.5 rounded-md text-[#71717a] hover:text-red-400 hover:bg-red-400/5 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/2 flex items-center justify-center text-[#3f3f46]">
                        <Bell size={24} />
                      </div>
                      <p className="text-[14px]" style={{ color: '#71717a' }}>
                        No notifications found.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
