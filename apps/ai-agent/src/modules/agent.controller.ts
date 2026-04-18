import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AgentService } from './agent.service';
import { MESSAGE_PATTERNS } from '../common';

@Controller()
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @MessagePattern(MESSAGE_PATTERNS.AGENT_CREATE_CONVERSATION)
  createConversation(
    @Payload()
    data: {
      userId: string;
      title?: string;
      repoOwner?: string;
      repoName?: string;
      issueNumber?: number;
      issueTitle?: string;
      context?: string;
    },
  ) {
    return this.agentService.createConversation(data);
  }

  @MessagePattern(MESSAGE_PATTERNS.AGENT_GET_CONVERSATIONS)
  getConversations(@Payload() data: { userId: string }) {
    return this.agentService.getConversations(data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.AGENT_GET_CONVERSATION)
  getConversation(@Payload() data: { id: string; userId: string }) {
    return this.agentService.getConversation(data.id, data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.AGENT_DELETE_CONVERSATION)
  deleteConversation(@Payload() data: { id: string; userId: string }) {
    return this.agentService.deleteConversation(data.id, data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.AGENT_SEND_MESSAGE)
  sendMessage(
    @Payload()
    data: {
      conversationId: string;
      userId: string;
      content: string;
    },
  ) {
    return this.agentService.sendMessage(
      data.conversationId,
      data.userId,
      data.content,
    );
  }

  @MessagePattern(MESSAGE_PATTERNS.AGENT_FIX_ISSUE)
  fixIssue(
    @Payload()
    data: {
      userId: string;
      conversationId: string;
      repoOwner: string;
      repoName: string;
      issueNumber: number;
      issueTitle: string;
      issueBody: string;
    },
  ) {
    return this.agentService.fixIssue(data);
  }

  @MessagePattern(MESSAGE_PATTERNS.AGENT_GET_USAGE)
  getUsage(@Payload() data: { userId: string }) {
    return this.agentService.getUsage(data.userId);
  }
}
