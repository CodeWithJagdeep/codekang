import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { MESSAGE_PATTERNS } from '../common';

@Controller()
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @MessagePattern(MESSAGE_PATTERNS.NOTIF_LIST)
  list(@Payload() data: { userId: string; limit?: number; offset?: number }) {
    return this.notifService.listForUser(data.userId, data.limit, data.offset);
  }

  @MessagePattern(MESSAGE_PATTERNS.NOTIF_READ)
  markRead(@Payload() data: { userId: string; notificationId: string }) {
    return this.notifService.markAsRead(data.userId, data.notificationId);
  }

  @MessagePattern(MESSAGE_PATTERNS.NOTIF_UNREAD_COUNT)
  unreadCount(@Payload() data: { userId: string }) {
    return this.notifService.getUnreadCount(data.userId);
  }
}
