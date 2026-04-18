import IORedis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

export const redis = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // required for BullMQ
});

redis.on('connect', () => {
  logger.debug('Redis connected');
  // BullMQ requires noeviction — set it automatically on connect
  redis.config('SET', 'maxmemory-policy', 'noeviction').catch(() => {});
});

redis.on('error', (err) => {
  logger.error('Redis error', { error: err.message });
});

// BullMQ connection helper
export const redisConnection = {
  connection: redis,
};
