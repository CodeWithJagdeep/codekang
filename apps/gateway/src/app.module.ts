import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SharedAuthClientModule } from './modules/shared/shared-auth-client.module';
import { AuthProxyModule } from './modules/auth/auth.module';
import { AgentProxyModule } from './modules/agent/agent.module';
import { ReposProxyModule } from './modules/repos/repos.module';
import { PlansProxyModule } from './modules/plans/plans.module';

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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
