import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReposModule } from './modules/repos.module';
import { Repository } from './entities/repository.entity';

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
        entities: [Repository],
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
  ],
})
export class AppModule {}
