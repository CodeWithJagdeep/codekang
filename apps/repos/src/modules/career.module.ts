import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerService } from './career.service';
import { CareerController } from './career.controller';
import { CareerApplication } from '../entities/career.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CareerApplication])],
  controllers: [CareerController],
  providers: [CareerService],
})
export class CareerModule {}
