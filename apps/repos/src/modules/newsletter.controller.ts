import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NewsletterService } from './newsletter.service';
import { MESSAGE_PATTERNS } from '../common';

@Controller()
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @MessagePattern(MESSAGE_PATTERNS.NEWSLETTER_SUBSCRIBE)
  subscribe(@Payload() data: { email: string; source?: string }) {
    return this.newsletterService.subscribe(data.email, data.source);
  }
}
