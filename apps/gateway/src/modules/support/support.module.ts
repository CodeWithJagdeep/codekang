import { Module } from '@nestjs/common';
import { SupportProxyController } from './support.controller';
import { SharedReposClientModule } from '../shared/shared-repos-client.module';

@Module({
  imports: [SharedReposClientModule],
  controllers: [SupportProxyController],
})
export class SupportProxyModule {}
