import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { UsageLog } from './entities/usage-log.entity';

// Used by the TypeORM CLI for migration generation and running.
// Run from the apps/ai-agent directory:
//   npm run migration:generate -- src/migrations/MigrationName
//   npm run migration:run
//   npm run migration:revert
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Conversation, UsageLog],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  ssl:
    process.env.DB_SSL === 'false'
      ? false
      : process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
});
