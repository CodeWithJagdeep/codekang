import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGE_PATTERNS } from '../../common';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterProxyController {
  constructor(
    @Inject(SERVICES.REPOS) private readonly reposClient: ClientProxy,
  ) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  subscribe(@Body() dto: { email: string; source?: string }) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.NEWSLETTER_SUBSCRIBE, dto),
    );
  }
}
