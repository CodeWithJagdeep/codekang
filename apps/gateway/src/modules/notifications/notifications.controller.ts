import { Controller, Get, Patch, Param, UseGuards, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGE_PATTERNS, CurrentUser, JwtAuthGuard } from '../../common';
import type { IUser } from '../../common';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsProxyController {
  constructor(@Inject(SERVICES.REPOS) private readonly reposClient: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'List user notifications' })
  list(@CurrentUser() user: IUser, @Query('limit') limit?: number, @Query('offset') offset?: number) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.NOTIF_LIST, { userId: user.id, limit, offset }),
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  unreadCount(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.NOTIF_UNREAD_COUNT, { userId: user.id }),
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@CurrentUser() user: IUser, @Param('id') notificationId: string) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.NOTIF_READ, { userId: user.id, notificationId }),
    );
  }
}
