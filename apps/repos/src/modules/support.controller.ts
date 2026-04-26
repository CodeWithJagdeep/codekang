import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SupportService } from './support.service';
import { MESSAGE_PATTERNS } from '../common';

@Controller()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @MessagePattern(MESSAGE_PATTERNS.SUPPORT_CREATE)
  create(@Payload() data: { userId: string; subject: string; category: string; priority: string; message: string }) {
    return this.supportService.createTicket(data.userId, data);
  }

  @MessagePattern(MESSAGE_PATTERNS.SUPPORT_LIST)
  list(@Payload() data: { userId: string }) {
    return this.supportService.listTickets(data.userId);
  }
}
