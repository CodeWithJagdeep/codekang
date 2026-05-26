import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../entities/conversation.entity';
import { UsageLog } from '../entities/usage-log.entity';
import type { IConversation, IMessage } from '../common';

interface CreateConversationOpts {
  userId: string;
  title?: string;
  repoOwner?: string;
  repoName?: string;
  issueNumber?: number;
  issueTitle?: string;
  context?: string;
}

interface FixIssueOpts {
  userId: string;
  conversationId: string;
  repoOwner: string;
  repoName: string;
  issueNumber: number;
  issueTitle: string;
  issueBody: string;
}

@Injectable()
export class AgentService {
  private readonly anthropic: Anthropic;
  private readonly model: string;

  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(UsageLog)
    private readonly usageRepo: Repository<UsageLog>,
    private readonly config: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: config.getOrThrow('ANTHROPIC_API_KEY'),
    });
    this.model = config.get('ANTHROPIC_MODEL', 'claude-sonnet-4-6');
  }

  async createConversation(
    opts: CreateConversationOpts,
  ): Promise<IConversation> {
    const conv = this.convRepo.create({
      userId: opts.userId,
      title: opts.title ?? 'New Conversation',
      messages: [],
      repoOwner: opts.repoOwner,
      repoName: opts.repoName,
      issueNumber: opts.issueNumber,
      issueTitle: opts.issueTitle,
      context: opts.context,
    });
    return this.convRepo.save(conv);
  }

  async getConversations(userId: string): Promise<IConversation[]> {
    return this.convRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      select: [
        'id',
        'userId',
        'title',
        'repoOwner',
        'repoName',
        'issueNumber',
        'issueTitle',
        'totalCreditsUsed',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async getConversation(id: string, userId: string): Promise<IConversation> {
    const conv = await this.convRepo.findOne({ where: { id, userId } });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async deleteConversation(id: string, userId: string): Promise<void> {
    const conv = await this.convRepo.findOne({ where: { id, userId } });
    if (!conv) throw new NotFoundException('Conversation not found');
    await this.convRepo.remove(conv);
  }

  async sendMessage(
    conversationId: string,
    userId: string,
    content: string,
  ): Promise<IConversation> {
    const conv = await this.convRepo.findOne({
      where: { id: conversationId, userId },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    const userMessage: IMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      createdAt: new Date(),
    };
    conv.messages = [...conv.messages, userMessage];

    if (conv.messages.length === 1) {
      conv.title = content.slice(0, 60) + (content.length > 60 ? '…' : '');
    }

    const anthropicMessages: Anthropic.MessageParam[] = conv.messages.map(
      (m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }),
    );

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: this.buildSystemPrompt(conv),
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: anthropicMessages,
    });

    const assistantContent = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    const assistantMessage: IMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: assistantContent,
      createdAt: new Date(),
    };

    conv.messages = [...conv.messages, assistantMessage];
    conv.totalCreditsUsed += 1;
    await this.convRepo.save(conv);

    await this.usageRepo.save(
      this.usageRepo.create({
        userId,
        conversationId,
        action: 'chat',
        creditsUsed: 1,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        repoFullName:
          conv.repoOwner && conv.repoName
            ? `${conv.repoOwner}/${conv.repoName}`
            : undefined,
        issueNumber: conv.issueNumber,
      }),
    );

    return conv;
  }

  async fixIssue(opts: FixIssueOpts): Promise<IConversation> {
    const conv = await this.convRepo.findOne({
      where: { id: opts.conversationId, userId: opts.userId },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    const userMessage: IMessage = {
      id: uuidv4(),
      role: 'user',
      content: `Please analyze and fix GitHub issue #${opts.issueNumber}: **${opts.issueTitle}**\n\n${opts.issueBody}`,
      createdAt: new Date(),
    };
    conv.messages = [...conv.messages, userMessage];
    conv.repoOwner = opts.repoOwner;
    conv.repoName = opts.repoName;
    conv.issueNumber = opts.issueNumber;
    conv.issueTitle = opts.issueTitle;

    if (conv.messages.length === 1) {
      conv.title = `Fix #${opts.issueNumber}: ${opts.issueTitle}`.slice(0, 60);
    }

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 8192,
      system: [
        {
          type: 'text',
          text: this.buildIssueFixSystemPrompt(opts),
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: conv.messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    });

    const assistantContent = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    conv.messages = [
      ...conv.messages,
      {
        id: uuidv4(),
        role: 'assistant',
        content: assistantContent,
        createdAt: new Date(),
      },
    ];
    conv.totalCreditsUsed += 10;
    await this.convRepo.save(conv);

    await this.usageRepo.save(
      this.usageRepo.create({
        userId: opts.userId,
        conversationId: opts.conversationId,
        action: 'fix_issue',
        creditsUsed: 10,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        repoFullName: `${opts.repoOwner}/${opts.repoName}`,
        issueNumber: opts.issueNumber,
      }),
    );

    return conv;
  }

  async getUsage(userId: string): Promise<{
    totalCredits: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    breakdown: { action: string; count: number; credits: number }[];
  }> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const logs = await this.usageRepo
      .createQueryBuilder('ul')
      .where('ul.user_id = :userId', { userId })
      .andWhere('ul.created_at >= :start', { start: monthStart })
      .getMany();

    const breakdown = Object.values(
      logs.reduce(
        (acc, log) => {
          if (!acc[log.action])
            acc[log.action] = { action: log.action, count: 0, credits: 0 };
          acc[log.action].count += 1;
          acc[log.action].credits += log.creditsUsed;
          return acc;
        },
        {} as Record<
          string,
          { action: string; count: number; credits: number }
        >,
      ),
    );

    return {
      totalCredits: logs.reduce((s, l) => s + l.creditsUsed, 0),
      totalInputTokens: logs.reduce((s, l) => s + l.inputTokens, 0),
      totalOutputTokens: logs.reduce((s, l) => s + l.outputTokens, 0),
      breakdown,
    };
  }

  private buildSystemPrompt(conv: Conversation): string {
    const repoCtx =
      conv.repoOwner && conv.repoName
        ? `\n\nRepository context: **${conv.repoOwner}/${conv.repoName}**` +
          (conv.issueNumber
            ? ` — Issue #${conv.issueNumber}: ${conv.issueTitle}`
            : '') +
          (conv.context ? `\n\nAdditional context:\n${conv.context}` : '')
        : '';

    return `You are CodeKang AI — an elite software engineering assistant that helps developers understand code, fix bugs, review pull requests, and architect better systems.${repoCtx}

RULES:
- Be concise and direct. Every word must add value.
- Always use fenced code blocks with language identifiers.
- Identify root cause before prescribing fixes.
- Show minimal, targeted diffs — not full file rewrites unless necessary.
- Suggest tests whenever proposing a fix.
- Flag security issues clearly with severity and remediation.
- Never hallucinate file paths or function names — state your assumptions explicitly.`;
  }

  private buildIssueFixSystemPrompt(opts: FixIssueOpts): string {
    return `You are CodeKang AI — an expert software engineer fixing a GitHub issue.

Repository: ${opts.repoOwner}/${opts.repoName}
Issue #${opts.issueNumber}: ${opts.issueTitle}

RESPOND IN THIS EXACT STRUCTURE:

## Root Cause Analysis
Concise explanation of what is broken and why, with specific file/line references if possible.

## Fix
Exact code changes in diff or full-file format. Include the file path above each block:
\`\`\`diff
// path/to/file.ts
- old line
+ new line
\`\`\`

## Test
A test case (unit or integration) that verifies the fix works. Include the file path.

## PR Description
**Title:** [concise title under 72 chars]

**Body:**
[Clear markdown description of what was changed and why — ready to paste into GitHub]

Be precise. Show real code. No vague guidance.`;
  }

  async deleteAllUserData(userId: string): Promise<void> {
    await this.convRepo.delete({ userId });
    await this.usageRepo.delete({ userId });
  }
}
