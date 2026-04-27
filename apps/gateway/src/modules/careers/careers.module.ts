import { Module } from '@nestjs/common';
import { CareersProxyController } from './careers.controller';
import { SharedReposClientModule } from '../shared/shared-repos-client.module';

@Module({
  imports: [SharedReposClientModule],
  controllers: [CareersProxyController],
})
export class CareersProxyModule {}
