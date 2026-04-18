import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AgentProxyController } from './agent.controller';
import { SERVICES } from '../../common';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.AI_AGENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('AI_AGENT_SERVICE_HOST', 'localhost'),
            port: config.get<number>('AI_AGENT_TCP_PORT', 3002),
          },
        }),
      },
    ]),
  ],
  controllers: [AgentProxyController],
})
export class AgentProxyModule {}
