import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { RefreshTokenBlacklist } from './entities/refresh-token-blacklist.entity';
import { Otp } from './entities/otp.entity';
import { UserIntegration } from './entities/user-integration.entity';
import { UserSession } from './entities/user-session.entity';

// Used by the TypeORM CLI for migration generation and running.
// Run from the apps/auth directory:
//   npm run migration:generate -- src/migrations/MigrationName
//   npm run migration:run
//   npm run migration:revert
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, RefreshTokenBlacklist, Otp, UserIntegration, UserSession],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  ssl:
    process.env.DB_SSL === 'false'
      ? false
      : process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
});
