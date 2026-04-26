import { Module } from '@nestjs/common';
import { AuditProxyController } from './audit.controller';
import { SharedReposClientModule } from '../shared/shared-repos-client.module';

@Module({
  imports: [SharedReposClientModule],
  controllers: [AuditProxyController],
})
export class AuditProxyModule {}
