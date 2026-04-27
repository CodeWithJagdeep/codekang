import { Module } from '@nestjs/common';
import { NewsletterProxyController } from './newsletter.controller';
import { SharedReposClientModule } from '../shared/shared-repos-client.module';

@Module({
  imports: [SharedReposClientModule],
  controllers: [NewsletterProxyController],
})
export class NewsletterProxyModule {}
