import { Controller, Get, Post, Body, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGE_PATTERNS, CurrentUser, JwtAuthGuard } from '../../common';
import type { IUser } from '../../common';

@ApiTags('support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportProxyController {
  constructor(@Inject(SERVICES.REPOS) private readonly reposClient: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'List user support tickets' })
  list(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.SUPPORT_LIST, { userId: user.id }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create support ticket' })
  create(
    @CurrentUser() user: IUser,
    @Body() dto: { subject: string; category: string; priority: string; message: string }
  ) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.SUPPORT_CREATE, { userId: user.id, ...dto }),
    );
  }
}
