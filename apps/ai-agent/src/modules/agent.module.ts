import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { Conversation } from '../entities/conversation.entity';
import { UsageLog } from '../entities/usage-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, UsageLog])],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
