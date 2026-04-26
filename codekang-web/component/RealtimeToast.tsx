'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useSocketContext } from '@/component/SocketProvider';
import type { NewNotificationEvent } from '@/lib/socket';

interface ToastEntry extends NewNotificationEvent {
  dismissedAt?: number;
}

export default function RealtimeToast() {
  const { latestNotification } = useSocketContext();
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  useEffect(() => {
    if (!latestNotification) return;
    setToasts((prev) => {
      if (prev.some((t) => t.id === latestNotification.id)) return prev;
      return [latestNotification, ...prev].slice(0, 3);
    });

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== latestNotification.id));
    }, 6000);
    return () => clearTimeout(timer);
  }, [latestNotification]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-[320px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 p-3.5 rounded-xl border shadow-xl animate-in slide-in-from-bottom-2 fade-in duration-300"
          style={{
            background: '#18181b',
            borderColor: '#27272a',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(248,66,59,0.12)' }}
          >
            <Bell size={13} style={{ color: '#f8423b' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{toast.title}</p>
            <p className="text-[12px] mt-0.5 text-[#71717a] line-clamp-2">{toast.message}</p>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="p-1 rounded-md hover:bg-white/5 transition-colors shrink-0"
            style={{ color: '#71717a' }}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
