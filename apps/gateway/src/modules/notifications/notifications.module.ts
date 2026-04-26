import { Module } from '@nestjs/common';
import { NotificationsProxyController } from './notifications.controller';
import { SharedReposClientModule } from '../shared/shared-repos-client.module';

@Module({
  imports: [SharedReposClientModule],
  controllers: [NotificationsProxyController],
})
export class NotificationsProxyModule {}
