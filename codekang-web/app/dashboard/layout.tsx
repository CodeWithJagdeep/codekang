'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';
import Sidebar from '@/component/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/in/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVerified(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121214]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-[#f97316] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return null;
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: '#121214' }}
    >
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col relative z-0">
        {children}
      </div>
    </div>
  );
}
