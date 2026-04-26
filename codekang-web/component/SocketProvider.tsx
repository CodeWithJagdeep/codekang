'use client';

import React, { createContext, useContext } from 'react';
import { useSocket, type UseSocketReturn } from '@/lib/socket';

const SocketContext = createContext<UseSocketReturn>({
  state: 'disconnected',
  unreadCount: 0,
  latestNotification: null,
  recentActivity: [],
  requestNotificationCount: () => {},
  activeJobs: [],
  agentSteps: {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket();
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext(): UseSocketReturn {
  return useContext(SocketContext);
}
