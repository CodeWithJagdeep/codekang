import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Repository } from './entities/repository.entity';
import {
  Organization,
  OrganizationMember,
  OrgRepository,
} from './entities/organization.entity';
import { Notification } from './entities/notification.entity';
import { SupportTicket, SupportMessage } from './entities/support.entity';
import { AuditLog } from './entities/audit.entity';
import { NewsletterSubscriber } from './entities/newsletter.entity';
import { ContactInquiry } from './entities/contact.entity';
import { CareerApplication } from './entities/career.entity';

// Used by the TypeORM CLI for migration generation and running.
// Run from the apps/repos directory:
//   npm run migration:generate -- src/migrations/MigrationName
//   npm run migration:run
//   npm run migration:revert
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    Repository,
    Organization,
    OrganizationMember,
    OrgRepository,
    Notification,
    SupportTicket,
    SupportMessage,
    AuditLog,
    NewsletterSubscriber,
    ContactInquiry,
    CareerApplication,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  ssl:
    process.env.DB_SSL === 'false'
      ? false
      : process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
});
