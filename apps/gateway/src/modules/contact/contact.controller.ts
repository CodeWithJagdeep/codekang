import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGE_PATTERNS } from '../../common';

@ApiTags('contact')
@Controller('contact')
export class ContactProxyController {
  constructor(@Inject(SERVICES.REPOS) private readonly reposClient: ClientProxy) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact inquiry' })
  submit(@Body() dto: { name: string; email: string; company?: string; inquiryType: string; message: string }) {
    return firstValueFrom(this.reposClient.send(MESSAGE_PATTERNS.CONTACT_SUBMIT, dto));
  }
}
