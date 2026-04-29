import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SERVICES } from '../../common';

@Global()
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
            host: config.get<string>('AI_AGENT_SERVICE_HOST', 'localhost'),
            port: config.get<number>('AI_AGENT_TCP_PORT', 3002),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class SharedAgentClientModule {}
