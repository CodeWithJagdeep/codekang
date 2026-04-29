import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { WebhookDispatchService } from './webhook-dispatch.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  controllers: [EventsController],
  providers: [WebhookDispatchService],
  exports: [WebhookDispatchService],
})
export class EventsModule {}
