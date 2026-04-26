import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { AuditLog } from '../entities/audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: TypeOrmRepository<AuditLog>,
  ) {}

  async listLogs(userId: string) {
    const logs = await this.auditRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100, // Reasonable limit
    });
    return logs;
  }
}
