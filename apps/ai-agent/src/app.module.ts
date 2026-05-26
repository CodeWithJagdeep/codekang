import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentModule } from './modules/agent.module';
import { Conversation } from './entities/conversation.entity';
import { UsageLog } from './entities/usage-log.entity';

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
        entities: [Conversation, UsageLog],
        migrations: ['dist/migrations/*.js'],
        migrationsRun: true,
        synchronize: false,
        ssl:
          config.get('DB_SSL') === 'false'
            ? false
            : config.get('NODE_ENV') === 'production'
              ? { rejectUnauthorized: false }
              : false,
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
        logging:
          config.get('NODE_ENV') === 'development'
            ? ['error', 'warn']
            : ['error'],
      }),
    }),
    AgentModule,
  ],
})
export class AppModule {}
