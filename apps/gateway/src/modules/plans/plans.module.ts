import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlansProxyController } from './plans.controller';

@Module({
  imports: [ConfigModule],
  controllers: [PlansProxyController],
})
export class PlansProxyModule {}
