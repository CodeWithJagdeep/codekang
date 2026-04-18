import { Worker, type Job } from 'bullmq';
import { redis } from '../config/redis';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
  createIndexQueue,
  createFixQueue,
  createExecuteFixQueue,
  INDEX_QUEUE,
  FIX_QUEUE,
  EXECUTE_FIX_QUEUE,
} from './config';
import { indexRepoJob } from '../services/index-service';
import { proposeFixJob, executeApprovedFix } from '../services/fix-service';
import type {
  IndexJobData,
  FixJobData,
  ExecuteFixJobData,
  JobResult,
} from '../types/queue';

// ─── Singleton queue instances ────────────────────────────────────────────────

export const indexQueue = createIndexQueue();
export const fixQueue = createFixQueue();
export const executeFixQueue = createExecuteFixQueue();

// ─── Worker startup ───────────────────────────────────────────────────────────

export function startWorkers(): void {
  const indexWorker = new Worker<IndexJobData, JobResult>(
    INDEX_QUEUE,
    async (job: Job<IndexJobData>): Promise<JobResult> => {
      logger.info('Index job started', { jobId: job.id, ...job.data });
      return indexRepoJob(job.data);
    },
    { connection: redis, concurrency: env.INDEX_WORKER_CONCURRENCY },
  );

  // Phase 1: analyze + post proposal (fast, no code written)
  const fixWorker = new Worker<FixJobData, JobResult>(
    FIX_QUEUE,
    async (job: Job<FixJobData>): Promise<JobResult> => {
      logger.info('Propose job started', {
        jobId: job.id,
        issue: job.data.issueNumber,
      });
      return proposeFixJob(job.data);
    },
    { connection: redis, concurrency: env.FIX_WORKER_CONCURRENCY },
  );

  // Phase 2: apply fix after contributor approval
  const executeFixWorker = new Worker<ExecuteFixJobData, JobResult>(
    EXECUTE_FIX_QUEUE,
    async (job: Job<ExecuteFixJobData>): Promise<JobResult> => {
      logger.info('Execute fix job started', {
        jobId: job.id,
        issue: job.data.issueNumber,
        approvedBy: job.data.approvedBy,
      });
      return executeApprovedFix(job.data);
    },
    { connection: redis, concurrency: env.FIX_WORKER_CONCURRENCY },
  );

  indexWorker.on('completed', (job, result: JobResult) => {
    logger.info('Index job done', { jobId: job.id, success: result.success });
  });
  indexWorker.on('failed', (job, err: Error) => {
    logger.error('Index job failed', { jobId: job?.id, error: err.message });
  });

  fixWorker.on('completed', (job, result: JobResult) => {
    logger.info('Propose job done', { jobId: job.id, success: result.success });
  });
  fixWorker.on('failed', (job, err: Error) => {
    logger.error('Propose job failed', { jobId: job?.id, error: err.message });
  });

  executeFixWorker.on('completed', (job, result: JobResult) => {
    logger.info('Execute fix done', { jobId: job.id, success: result.success });
  });
  executeFixWorker.on('failed', (job, err: Error) => {
    logger.error('Execute fix failed', { jobId: job?.id, error: err.message });
  });

  logger.info('Workers started', {
    indexConcurrency: env.INDEX_WORKER_CONCURRENCY,
    fixConcurrency: env.FIX_WORKER_CONCURRENCY,
  });
}
