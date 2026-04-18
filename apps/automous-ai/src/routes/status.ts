import { Router, type Request, type Response } from 'express';
import { indexQueue, fixQueue } from '../queue/index';

const router = Router();

// GET /status/:jobId — look up a job across both queues
router.get('/:jobId', async (req: Request, res: Response): Promise<void> => {
  const jobId = req.params['jobId'] as string;

  const job =
    (await indexQueue.getJob(jobId)) ?? (await fixQueue.getJob(jobId));

  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  const state = await job.getState();

  res.json({
    jobId: job.id,
    name: job.name,
    status: state,
    progress: job.progress,
    result: job.returnvalue,
    error: job.failedReason,
    createdAt: new Date(job.timestamp).toISOString(),
    processedAt: job.processedOn
      ? new Date(job.processedOn).toISOString()
      : null,
    finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
    attempts: job.attemptsMade,
  });
});

export default router;
