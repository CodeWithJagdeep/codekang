import { env } from '../config/env';
import { logger } from './logger';

// ─── Event shapes ─────────────────────────────────────────────────────────────

export interface AgentJobEvent {
  jobId: string;
  phase: 'propose' | 'execute' | 'fix_pr' | 'review';
  status: 'started' | 'completed' | 'failed';
  repo: string;       // "owner/repo"
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

// ─── Fire-and-forget notifier ─────────────────────────────────────────────────
// Sends agent progress events to the gateway which broadcasts them via Socket.IO.
// Failures are logged but never throw — the agent must not be blocked by this.

export async function notifyGateway(
  userId: string,
  event: 'agent:job' | 'agent:step',
  data: AgentJobEvent | AgentStepEvent,
): Promise<void> {
  if (!env.GATEWAY_INTERNAL_URL || !env.INTERNAL_SECRET || !userId) return;

  try {
    await fetch(`${env.GATEWAY_INTERNAL_URL}/api/v1/internal/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': env.INTERNAL_SECRET,
      },
      body: JSON.stringify({ userId, event, data }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    logger.warn('Failed to notify gateway (non-blocking)', {
      event,
      error: (err as Error).message,
    });
  }
}
