'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getAccessToken } from '@/lib/auth';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000';

// ─── Event shapes ─────────────────────────────────────────────────────────────

export interface NotificationCountEvent {
  count: number;
}

export interface NewNotificationEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  createdAt: string;
}

export interface ActivityEvent {
  type: 'pr_review' | 'agent_run' | 'security' | 'issue';
  status: 'started' | 'completed' | 'failed';
  title: string;
  detail?: string;
  repoName?: string;
  link?: string;
  ts: number;
}

export interface AgentJobEvent {
  jobId: string;
  phase: 'propose' | 'execute' | 'fix_pr' | 'review';
  status: 'started' | 'completed' | 'failed';
  repo: string;
  issueNumber?: number;
  issueTitle?: string;
  prUrl?: string;
  message?: string;
  ts: number;
}

export interface AgentStepEvent {
  jobId: string;
  repo: string;
  issueNumber?: number;
  step: number;
  toolName: string;
  status: 'running' | 'done' | 'error';
  outputPreview?: string;
  durationMs?: number;
  ts: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export interface UseSocketReturn {
  state: ConnectionState;
  unreadCount: number;
  latestNotification: NewNotificationEvent | null;
  recentActivity: ActivityEvent[];
  requestNotificationCount: () => void;
  activeJobs: AgentJobEvent[];
  agentSteps: Record<string, AgentStepEvent[]>; // jobId → steps
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<NewNotificationEvent | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const [activeJobs, setActiveJobs] = useState<AgentJobEvent[]>([]);
  const [agentSteps, setAgentSteps] = useState<Record<string, AgentStepEvent[]>>({});

  const requestNotificationCount = useCallback(() => {
    socketRef.current?.emit('notifications:request_count');
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    setState('connecting');

    const socket = io(`${WS_URL}/ws`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on('connect', () => setState('connected'));
    socket.on('disconnect', () => setState('disconnected'));
    socket.on('connect_error', () => setState('disconnected'));

    socket.on('notification:count', (data: NotificationCountEvent) => {
      setUnreadCount(data.count);
    });

    socket.on('notification:new', (data: NewNotificationEvent) => {
      setLatestNotification(data);
      setUnreadCount((n) => n + 1);
    });

    socket.on('activity:event', (data: ActivityEvent) => {
      setRecentActivity((prev) => [data, ...prev].slice(0, 50));
    });

    socket.on('agent:job', (data: AgentJobEvent) => {
      setActiveJobs((prev) => {
        const filtered = prev.filter((j) => j.jobId !== data.jobId);
        if (data.status === 'started') return [data, ...filtered];
        // completed/failed — remove from active, keep a short history
        return filtered;
      });
    });

    socket.on('agent:step', (data: AgentStepEvent) => {
      setAgentSteps((prev) => ({
        ...prev,
        [data.jobId]: [...(prev[data.jobId] ?? []), data].slice(-50),
      }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setState('disconnected');
    };
  }, []);

  return { state, unreadCount, latestNotification, recentActivity, requestNotificationCount, activeJobs, agentSteps };
}
