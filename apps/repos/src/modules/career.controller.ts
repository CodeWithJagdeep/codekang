import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CareerService } from './career.service';
import { MESSAGE_PATTERNS } from '../common';

@Controller()
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @MessagePattern(MESSAGE_PATTERNS.CAREER_APPLY)
  apply(@Payload() data: { name: string; email: string; phone?: string; jobSlug: string; jobTitle: string; resumeUrl?: string; coverNote?: string }) {
    return this.careerService.apply(data);
  }

  @MessagePattern(MESSAGE_PATTERNS.CAREER_LIST)
  list() {
    return this.careerService.list();
  }
}
