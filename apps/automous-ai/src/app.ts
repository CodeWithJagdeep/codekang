import express, { Express, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { env } from './config/env';
import { logger } from './utils/logger';
import { Sentry } from './config/sentry';
import healthRouter from './routes/health';
import webhookRouter from './routes/webhook';
import queueRouter from './routes/queue';
import statusRouter from './routes/status';
import adminRouter from './routes/admin';
import githubAppRouter from './routes/github-app';
import reviewRouter from './routes/review';
import { startWorkers } from './queue/index';

// ─── Types ────────────────────────────────────────────────────────────────

interface AppRequest extends Request {
  requestId: string;
  startTime: number;
}

// ─── Create App ───────────────────────────────────────────────────────────

export function createApp(): Express {
  const app: Express = express();

  // Capture raw body for webhook signature verification
  app.use(
    express.json({
      verify: (req: Request & { rawBody?: string }, _res, buf) => {
        req.rawBody = buf.toString('utf8');
      },
    }),
  );
  app.use(express.urlencoded({ extended: true }));

  // Request context
  app.use((req: Request, res: Response, next: NextFunction) => {
    const r = req as AppRequest;
    r.requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
    r.startTime = Date.now();
    res.setHeader('x-request-id', r.requestId);
    next();
  });

  // Logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    const r = req as AppRequest;

    logger.info('Incoming request', {
      requestId: r.requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
    });

    res.on('finish', () => {
      const duration = Date.now() - r.startTime;

      const level =
        res.statusCode >= 500
          ? 'error'
          : res.statusCode >= 400
            ? 'warn'
            : 'info';

      logger[level]('Request completed', {
        requestId: r.requestId,
        statusCode: res.statusCode,
        durationMs: duration,
      });
    });

    next();
  });

  // ── Routes ─────────────────────────────────────────────────────────────
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'CodeKang - Autonomous GitHub Issue Fixer',
      environment: env.NODE_ENV,
      endpoints: {
        health: '/health',
        webhook: env.WEBHOOK_PATH,
        queueStatus: '/queue/status',
        jobStatus: '/status/:jobId',
        batchScan: 'POST /api/admin/batch-scan',
        batchStatus: 'GET /api/admin/batch-scan/status',
        githubAppSetup: 'GET /github/setup',
        githubAppCallback: 'GET /github/callback',
      },
    });
  });

  app.use('/health', healthRouter);
  app.use(env.WEBHOOK_PATH, webhookRouter);
  app.use('/queue', queueRouter);
  app.use('/status', statusRouter);
  app.use('/api/admin', adminRouter);
  app.use('/github', githubAppRouter);
  app.use('/review', reviewRouter);

  // Start BullMQ workers
  startWorkers();

  // 404
  app.use((req: Request, res: Response) => {
    const r = req as AppRequest;

    logger.warn('Route not found', {
      requestId: r.requestId,
      url: req.url,
    });

    res.status(404).json({
      error: 'Not Found',
      requestId: r.requestId,
    });
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    const r = req as AppRequest;

    logger.error('Unhandled error', {
      requestId: r.requestId,
      error: err.message,
    });
    Sentry.captureException(err);

    res.status(500).json({
      error: 'Internal Server Error',
      requestId: r.requestId,
    });
  });

  return app;
}
