import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import {
  SERVICES,
  MESSAGE_PATTERNS,
  CurrentUser,
  JwtAuthGuard,
} from '../../common';
import type { IUser } from '../../common';

class CreateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  repoOwner?: string;

  @IsOptional()
  @IsString()
  repoName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  issueNumber?: number;

  @IsOptional()
  @IsString()
  issueTitle?: string;

  @IsOptional()
  @IsString()
  context?: string;
}

class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

class FixIssueDto {
  @IsString()
  @IsNotEmpty()
  repoOwner: string;

  @IsString()
  @IsNotEmpty()
  repoName: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  issueNumber: number;

  @IsString()
  @IsNotEmpty()
  issueTitle: string;

  @IsString()
  @IsNotEmpty()
  issueBody: string;
}

@ApiTags('agent')
@Controller('agent')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentProxyController {
  constructor(
    @Inject(SERVICES.AI_AGENT) private readonly agentClient: ClientProxy,
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
  ) {}

  @Post('conversations')
  @ApiOperation({
    summary: 'Create a new conversation (optionally with repo/issue context)',
  })
  createConversation(
    @CurrentUser() user: IUser,
    @Body() dto: CreateConversationDto,
  ) {
    return firstValueFrom(
      this.agentClient.send(MESSAGE_PATTERNS.AGENT_CREATE_CONVERSATION, {
        userId: user.id,
        ...dto,
      }),
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List all conversations' })
  getConversations(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.agentClient.send(MESSAGE_PATTERNS.AGENT_GET_CONVERSATIONS, {
        userId: user.id,
      }),
    );
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a conversation with messages' })
  getConversation(@CurrentUser() user: IUser, @Param('id') id: string) {
    return firstValueFrom(
      this.agentClient.send(MESSAGE_PATTERNS.AGENT_GET_CONVERSATION, {
        id,
        userId: user.id,
      }),
    );
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a conversation' })
  deleteConversation(@CurrentUser() user: IUser, @Param('id') id: string) {
    return firstValueFrom(
      this.agentClient.send(MESSAGE_PATTERNS.AGENT_DELETE_CONVERSATION, {
        id,
        userId: user.id,
      }),
    );
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message to the AI agent' })
  async sendMessage(
    @CurrentUser() user: IUser,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    // Consume 1 credit for chat
    await firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_CONSUME_CREDITS, {
        userId: user.id,
        cost: 1,
      }),
    );
    return firstValueFrom(
      this.agentClient.send(MESSAGE_PATTERNS.AGENT_SEND_MESSAGE, {
        conversationId: id,
        userId: user.id,
        content: dto.content,
      }),
    );
  }

  @Post('conversations/:id/fix-issue')
  @ApiOperation({
    summary:
      'Use AI agent to analyze and fix a GitHub issue (costs 10 credits)',
  })
  async fixIssue(
    @CurrentUser() user: IUser,
    @Param('id') id: string,
    @Body() dto: FixIssueDto,
  ) {
    // Consume 10 credits for fix
    await firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_CONSUME_CREDITS, {
        userId: user.id,
        cost: 10,
      }),
    );
    return firstValueFrom(
      this.agentClient.send(MESSAGE_PATTERNS.AGENT_FIX_ISSUE, {
        userId: user.id,
        conversationId: id,
        ...dto,
      }),
    );
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get current month AI usage stats' })
  getUsage(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.agentClient.send(MESSAGE_PATTERNS.AGENT_GET_USAGE, {
        userId: user.id,
      }),
    );
  }
}
