'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';

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
    // Use a slight delay to avoid cascading render lint error if necessary
    // or just ensure logic is sound.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVerified(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-violet-400 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return null;
  }

  return <>{children}</>;
}
