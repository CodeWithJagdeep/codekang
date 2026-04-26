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

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, OrganizationMember, OrgRepository, Repository]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
})
export class OrganizationsModule {}
