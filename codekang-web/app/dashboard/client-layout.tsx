'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, fetchSubscription, type ISubscription, type User } from '@/lib/auth';
import { OrgProvider } from '@/lib/org-context';
import Sidebar from '@/component/dashboard/sidebar';
import { Menu } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { resolved } = useTheme();
  const isLight = resolved === 'light';
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<ISubscription | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/in/login');
      return;
    }

    const raw = localStorage.getItem('user');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { }
    }

    fetchSubscription()
      .then(setSubscription)
      .catch(() => { });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVerified(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? 'bg-[#f4f5f7]' : 'bg-[#1c1c1c]'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-[#f8423b] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return null;
  }

  return (
    <OrgProvider>
      <div
        className="flex h-screen w-screen overflow-hidden"
        style={{ background: isLight ? '#f4f5f7' : '#1c1c1c' }}
      >
        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        <Sidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          user={user}
          subscription={subscription}
          onUpgrade={() => router.push('/dashboard/billing')}
          onAddCredits={() => router.push('/dashboard/billing?tab=credits')}
        />

        <div className="flex-1 min-w-0 flex flex-col relative z-0 overflow-hidden">
          {/* Mobile Header Menu Toggle */}
          <div className={`md:hidden flex items-center justify-between px-4 py-3 border-b ${isLight ? 'border-[#e8eaed] bg-white' : 'border-[#2a2a2a] bg-[#1c1c1c]'}`}>
            <div className="font-bold text-[#e8e8e8]">CodeKang</div>
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1 rounded hover:bg-white/5 transition-colors"
            >
              <Menu size={20} className="text-[#a1a1aa]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </OrgProvider>
  );
}
