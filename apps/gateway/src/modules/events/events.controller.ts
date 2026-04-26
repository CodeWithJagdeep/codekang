import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { WebhookDispatchService } from './webhook-dispatch.service';

interface InternalEventDto {
  userId: string;
  event: string;
  data: unknown;
}

@Controller('internal/events')
export class EventsController {
  constructor(
    private readonly realtimeGateway: RealtimeGateway,
    private readonly webhookDispatch: WebhookDispatchService,
  ) {}

  @Post()
  @HttpCode(200)
  async emit(
    @Body() body: InternalEventDto,
    @Headers('x-internal-secret') secret: string,
  ) {
    const expected = process.env.INTERNAL_SECRET;
    if (!expected || secret !== expected) throw new UnauthorizedException();

    this.realtimeGateway.emitToUser(body.userId, body.event, body.data);

    // fire-and-forget Slack / Discord dispatch
    void this.webhookDispatch.dispatch(body.userId, body.event, body.data);

    return { ok: true };
  }
}
