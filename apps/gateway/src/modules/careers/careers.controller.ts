import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGE_PATTERNS } from '../../common';

@ApiTags('careers')
@Controller('careers')
export class CareersProxyController {
  constructor(@Inject(SERVICES.REPOS) private readonly reposClient: ClientProxy) {}

  @Post('apply')
  @ApiOperation({ summary: 'Submit a career application' })
  apply(@Body() dto: { name: string; email: string; phone?: string; jobSlug: string; jobTitle: string; resumeUrl?: string; coverNote?: string }) {
    return firstValueFrom(this.reposClient.send(MESSAGE_PATTERNS.CAREER_APPLY, dto));
  }
}
