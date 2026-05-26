import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReposController } from './repos.controller';
import { ReposService } from './repos.service';
import { Repository } from '../entities/repository.entity';
import { Organization, OrgRepository } from '../entities/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repository, Organization, OrgRepository]),
  ],
  controllers: [ReposController],
  providers: [ReposService],
})
export class ReposModule {}
