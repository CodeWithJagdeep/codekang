'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';

const PUBLIC_ONLY = ['/in/login', '/in/signup'];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (PUBLIC_ONLY.some((p) => pathname.startsWith(p)) && getAccessToken()) {
      router.replace('/dashboard');
    }
  }, [router, pathname]);

  return <>{children}</>;
}
