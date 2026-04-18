import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SERVICES } from '../../common';
import { JwtAuthGuard } from '../../common';
import { PlanGuard } from '../../common';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.AUTH,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('AUTH_SERVICE_HOST', 'localhost'),
            port: config.get<number>('AUTH_TCP_PORT', 3001),
          },
        }),
      },
    ]),
  ],
  providers: [JwtAuthGuard, PlanGuard],
  exports: [ClientsModule, JwtAuthGuard, PlanGuard],
})
export class SharedAuthClientModule {}
