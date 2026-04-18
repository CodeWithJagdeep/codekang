import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReposProxyController } from './repos.controller';
import { SERVICES } from '../../common';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.REPOS,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('REPOS_SERVICE_HOST', 'localhost'),
            port: config.get<number>('REPOS_TCP_PORT', 3003),
          },
        }),
      },
    ]),
  ],
  controllers: [ReposProxyController],
})
export class ReposProxyModule {}
