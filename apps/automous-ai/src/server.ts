import './config/env';

import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { initSentry, Sentry } from './config/sentry';
import { ensureSchema } from './vector/schema';
import { cleanupAllContainers } from './repo/manager';
import { shutdownEmbedder } from './vector/embeddings';
import { closeLanceDB } from './vector/lance/client';
import { validateGitHubAppKey } from './github/api';

initSentry();

const app = createApp();

async function start() {
  // Fail fast if the PEM path points to a directory (Docker mount misconfiguration)
  validateGitHubAppKey();

  // Ensures Postgres relational schema + LanceDB vector tables
  logger.info('Ensuring database schema (Postgres + LanceDB)');
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
  await Promise.all([
    cleanupAllContainers(),
    shutdownEmbedder(),
    closeLanceDB(),
  ]).catch(() => {});
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
  Sentry.captureException(
    reason instanceof Error ? reason : new Error(String(reason)),
  );
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message });
  Sentry.captureException(err);
  void Promise.all([
    cleanupAllContainers(),
    shutdownEmbedder(),
    closeLanceDB(),
  ]).finally(() => process.exit(1));
});
