import { Module } from '@nestjs/common';
import { PlansProxyController } from './plans.controller';

@Module({
  controllers: [PlansProxyController],
})
export class PlansProxyModule {}
