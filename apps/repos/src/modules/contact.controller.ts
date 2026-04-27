import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContactService } from './contact.service';
import { MESSAGE_PATTERNS } from '../common';

@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @MessagePattern(MESSAGE_PATTERNS.CONTACT_SUBMIT)
  submit(@Payload() data: { name: string; email: string; company?: string; inquiryType: string; message: string }) {
    return this.contactService.submit(data);
  }
}
