import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import {
  Organization,
  OrganizationMember,
  OrgRepository,
} from '../entities/organization.entity';
import { Repository } from '../entities/repository.entity';
import { Notification } from '../entities/notification.entity';
import { SupportTicket, SupportMessage } from '../entities/support.entity';
import { AuditLog } from '../entities/audit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization, OrganizationMember, OrgRepository, Repository,
      Notification, SupportTicket, SupportMessage, AuditLog,
    ]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
})
export class OrganizationsModule {}
