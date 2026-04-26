import { Queue } from 'bullmq';
import { redis } from '../config/redis';
import { env } from '../config/env';

// ─── Queue names ──────────────────────────────────────────────────────────────

export const INDEX_QUEUE = 'index-repo';
export const FIX_QUEUE = 'fix-issue';
export const EXECUTE_FIX_QUEUE = 'execute-fix';
export const FIX_PR_QUEUE = 'fix-pr';

// ─── Shared job options ───────────────────────────────────────────────────────

const defaultJobOptions = {
  attempts: env.JOB_ATTEMPTS,
  backoff: {
    type: 'exponential' as const,
    delay: env.JOB_BACKOFF_DELAY,
  },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 },
};

// ─── Factory functions ────────────────────────────────────────────────────────

export function createIndexQueue(): Queue {
  return new Queue(INDEX_QUEUE, {
    connection: redis,
    defaultJobOptions,
  });
}

export function createFixQueue(): Queue {
  return new Queue(FIX_QUEUE, {
    connection: redis,
    defaultJobOptions,
  });
}

export function createExecuteFixQueue(): Queue {
  return new Queue(EXECUTE_FIX_QUEUE, {
    connection: redis,
    defaultJobOptions,
  });
}

export function createFixPRQueue(): Queue {
  return new Queue(FIX_PR_QUEUE, {
    connection: redis,
    defaultJobOptions,
  });
}
