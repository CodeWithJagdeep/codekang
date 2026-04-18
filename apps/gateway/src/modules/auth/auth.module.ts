import { Module } from '@nestjs/common';
import { AuthProxyController } from './auth.controller';

@Module({
  controllers: [AuthProxyController],
})
export class AuthProxyModule {}
