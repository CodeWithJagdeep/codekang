import { Router, type Request, type Response } from 'express';
import { indexQueue, fixQueue } from '../queue/index';

const router = Router();

// GET /queue/status — overview of both queues
router.get('/status', async (_req: Request, res: Response): Promise<void> => {
  const [indexCounts, fixCounts] = await Promise.all([
    indexQueue.getJobCounts(),
    fixQueue.getJobCounts(),
  ]);
  res.json({ indexQueue: indexCounts, fixQueue: fixCounts });
});

// POST /queue/index — manually trigger a repo index
router.post('/index', async (req: Request, res: Response): Promise<void> => {
  const { owner, repo } = req.body as { owner?: string; repo?: string };

  if (!owner || !repo) {
    res.status(400).json({ error: 'owner and repo are required' });
    return;
  }

  const job = await indexQueue.add('index-repo', {
    owner,
    repo,
    installationId: 0,
    triggeredBy: 'manual',
  });

  res.status(202).json({ jobId: job.id, status: 'queued' });
});

export default router;
