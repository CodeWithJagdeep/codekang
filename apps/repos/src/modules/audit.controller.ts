import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuditService } from './audit.service';
import { MESSAGE_PATTERNS } from '../common';

@Controller()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @MessagePattern(MESSAGE_PATTERNS.AUDIT_LIST)
  list(@Payload() data: { userId: string }) {
    return this.auditService.listLogs(data.userId);
  }
}
