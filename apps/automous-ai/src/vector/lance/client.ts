import * as lancedb from '@lancedb/lancedb';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

let _db: lancedb.Connection | null = null;

export async function getLanceDB(): Promise<lancedb.Connection> {
  if (_db) return _db;
  _db = await lancedb.connect(env.LANCE_DB_PATH);
  logger.info('LanceDB connected', { path: env.LANCE_DB_PATH });
  return _db;
}

export async function closeLanceDB(): Promise<void> {
  _db = null;
}
