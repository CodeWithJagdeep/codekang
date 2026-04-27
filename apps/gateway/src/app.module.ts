import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SharedAuthClientModule } from './modules/shared/shared-auth-client.module';
import { AuthProxyModule } from './modules/auth/auth.module';
import { AgentProxyModule } from './modules/agent/agent.module';
import { ReposProxyModule } from './modules/repos/repos.module';
import { PlansProxyModule } from './modules/plans/plans.module';
import { OrganizationsProxyModule } from './modules/organizations/organizations.module';
import { ReviewProxyModule } from './modules/review/review.module';
import { NotificationsProxyModule } from './modules/notifications/notifications.module';
import { SupportProxyModule } from './modules/support/support.module';
import { AuditProxyModule } from './modules/audit/audit.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { EventsModule } from './modules/events/events.module';
import { IntegrationsProxyModule } from './modules/integrations/integrations.module';
import { NewsletterProxyModule } from './modules/newsletter/newsletter.module';
import { ContactProxyModule } from './modules/contact/contact.module';
import { CareersProxyModule } from './modules/careers/careers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.development',
        '.env',
        '../../.env.development',
        '../../.env',
      ],
    }),

    ThrottlerModule.forRoot([
      { name: 'short', ttl: 10_000, limit: 30 },
      { name: 'medium', ttl: 60_000, limit: 200 },
    ]),

    SharedAuthClientModule,
    AuthProxyModule,
    AgentProxyModule,
    ReposProxyModule,
    PlansProxyModule,
    OrganizationsProxyModule,
    ReviewProxyModule,
    NotificationsProxyModule,
    SupportProxyModule,
    AuditProxyModule,
    RealtimeModule,
    EventsModule,
    IntegrationsProxyModule,
    NewsletterProxyModule,
    ContactProxyModule,
    CareersProxyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
