import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { SharedReposClientModule } from '../shared/shared-repos-client.module';

@Module({
  // SharedAuthClientModule is @Global() so AUTH client is already in scope
  imports: [SharedReposClientModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
