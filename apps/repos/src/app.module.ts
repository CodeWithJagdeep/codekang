import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReposModule } from './modules/repos.module';
import { OrganizationsModule } from './modules/organizations.module';
import { NotificationsModule } from './modules/notifications.module';
import { SupportModule } from './modules/support.module';
import { AuditModule } from './modules/audit.module';
import { Repository } from './entities/repository.entity';
import {
  Organization,
  OrganizationMember,
  OrgRepository,
} from './entities/organization.entity';
import { Notification } from './entities/notification.entity';
import { SupportTicket, SupportMessage } from './entities/support.entity';
import { AuditLog } from './entities/audit.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow('DATABASE_URL'),
        entities: [
          Repository,
          Organization,
          OrganizationMember,
          OrgRepository,
          Notification,
          SupportTicket,
          SupportMessage,
          AuditLog,
        ],
        synchronize: config.get('NODE_ENV') !== 'production',
        ssl:
          config.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
        extra: {
          max: 15,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
        logging:
          config.get('NODE_ENV') === 'development'
            ? ['error', 'warn']
            : ['error'],
      }),
    }),
    ReposModule,
    OrganizationsModule,
    NotificationsModule,
    SupportModule,
    AuditModule,
  ],
})
export class AppModule {}
