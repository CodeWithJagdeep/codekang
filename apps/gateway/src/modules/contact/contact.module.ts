import { Module } from '@nestjs/common';
import { ContactProxyController } from './contact.controller';
import { SharedReposClientModule } from '../shared/shared-repos-client.module';

@Module({
  imports: [SharedReposClientModule],
  controllers: [ContactProxyController],
})
export class ContactProxyModule {}
