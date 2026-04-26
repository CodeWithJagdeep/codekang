'use client';

import { ThemeProvider } from '@/lib/theme';
import { SocketProvider } from '@/component/SocketProvider';
import RealtimeToast from '@/component/RealtimeToast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SocketProvider>
        {children}
        <RealtimeToast />
      </SocketProvider>
    </ThemeProvider>
  );
}
