import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
