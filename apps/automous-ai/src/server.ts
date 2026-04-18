import './config/env';

import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { ensureSchema } from './vector/schema';
import { cleanupAllContainers } from './repo/manager';
import { shutdownEmbedder } from './vector/embeddings';

const app = createApp();

async function start() {
  // Ensure pgvector schema before accepting any traffic
  logger.info('Ensuring database schema');
  await ensureSchema();

  const server = app.listen(env.PORT, () => {
    logger.info('Server started', {
      port: env.PORT,
      environment: env.NODE_ENV,
      url: `http://localhost:${env.PORT}`,
    });
  });
  return server;
}

let server: Awaited<ReturnType<typeof start>> | undefined;

start()
  .then((s) => {
    server = s;
  })
  .catch((err: unknown) => {
    logger.error('Startup failed', { error: (err as Error).message });
    process.exit(1);
  });

// ─── Graceful shutdown ────────────────────────────────────────────────────

async function shutdown(signal: string) {
  logger.info(`${signal} received — cleaning up`);
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  setTimeout(() => {
    logger.error('Force shutdown');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ─── Crash guards ─────────────────────────────────────────────────────────

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message });
  // Promise.all([cleanupAllContainers(), shutdownEmbedder()]).finally(() => process.exit(1));
});
