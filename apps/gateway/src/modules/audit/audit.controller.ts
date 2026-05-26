import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import {
  SERVICES,
  MESSAGE_PATTERNS,
  CurrentUser,
  JwtAuthGuard,
} from '../../common';
import type { IUser } from '../../common';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditProxyController {
  constructor(
    @Inject(SERVICES.REPOS) private readonly reposClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List user audit logs' })
  list(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.AUDIT_LIST, { userId: user.id }),
    );
  }
}
