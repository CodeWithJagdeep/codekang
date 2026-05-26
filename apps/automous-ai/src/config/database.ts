import { Pool } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  min: env.DB_POOL_MIN,
  max: env.DB_POOL_MAX,
});

export async function checkDB(): Promise<boolean> {
  try {
    await db.query('SELECT 1');
    return true;
  } catch (err) {
    logger.error('DB health check failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
