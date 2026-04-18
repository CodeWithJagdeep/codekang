import { Router, type Request, type Response } from 'express';
import { checkDB } from '../config/database';
import { redis } from '../config/redis';
import { indexQueue, fixQueue } from '../queue/index';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const [dbOk, redisOk] = await Promise.all([
    checkDB(),
    redis
      .ping()
      .then(() => true)
      .catch(() => false),
  ]);

  const [indexCounts, fixCounts] = await Promise.all([
    indexQueue.getJobCounts(),
    fixQueue.getJobCounts(),
  ]);

  const healthy = dbOk && redisOk;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    services: {
      database: dbOk ? 'up' : 'down',
      redis: redisOk ? 'up' : 'down',
    },
    queues: {
      index: indexCounts,
      fix: fixCounts,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
