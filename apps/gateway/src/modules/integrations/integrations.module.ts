import { Module } from '@nestjs/common';
import { IntegrationsProxyController } from './integrations.controller';

@Module({
  controllers: [IntegrationsProxyController],
})
export class IntegrationsProxyModule {}
