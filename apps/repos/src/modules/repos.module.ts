import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReposController } from './repos.controller';
import { ReposService } from './repos.service';
import { Repository } from '../entities/repository.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Repository])],
  controllers: [ReposController],
  providers: [ReposService],
})
export class ReposModule {}
