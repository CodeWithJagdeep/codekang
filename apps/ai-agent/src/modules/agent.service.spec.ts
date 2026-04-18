import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { AgentService } from './agent.service';
import { Conversation } from '../entities/conversation.entity';
import { UsageLog } from '../entities/usage-log.entity';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockConversation = (overrides = {}): Conversation =>
  ({
    id: 'conv-uuid-1',
    userId: 'user-uuid-1',
    title: 'Test Conversation',
    messages: [],
    repoOwner: null,
    repoName: null,
    issueNumber: null,
    issueTitle: null,
    context: null,
    totalCreditsUsed: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as Conversation;

const mockAnthropicResponse = (text: string) => ({
  content: [{ type: 'text', text }],
  usage: { input_tokens: 100, output_tokens: 50 },
});

const mockConvRepo = () => ({
  create: jest.fn().mockImplementation((d) => ({ ...d, id: 'conv-uuid-1' })),
  save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  }),
});

const mockUsageRepo = () => ({
  create: jest.fn().mockImplementation((d) => d),
  save: jest.fn().mockResolvedValue({}),
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  }),
});

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn(),
    },
  })),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AgentService', () => {
  let service: AgentService;
  let convRepo: ReturnType<typeof mockConvRepo>;
  let usageRepo: ReturnType<typeof mockUsageRepo>;
  let anthropicCreate: jest.Mock;

  beforeEach(async () => {
    convRepo = mockConvRepo();
    usageRepo = mockUsageRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        { provide: getRepositoryToken(Conversation), useValue: convRepo },
        { provide: getRepositoryToken(UsageLog), useValue: usageRepo },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('sk-ant-fake'),
            get: jest.fn().mockReturnValue('claude-sonnet-4-6'),
          },
        },
      ],
    }).compile();

    service = module.get(AgentService);
    anthropicCreate = (service as any).anthropic.messages.create;
  });

  // ── createConversation ─────────────────────────────────────────────────────

  describe('createConversation', () => {
    it('creates a basic conversation', async () => {
      convRepo.save.mockResolvedValue(mockConversation());

      const result = await service.createConversation({
        userId: 'user-uuid-1',
      });

      expect(convRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-uuid-1', messages: [] }),
      );
      expect(result.id).toBe('conv-uuid-1');
    });

    it('creates a conversation with repo and issue context', async () => {
      const conv = mockConversation({
        repoOwner: 'acme',
        repoName: 'backend',
        issueNumber: 42,
        issueTitle: 'Login broken',
      });
      convRepo.save.mockResolvedValue(conv);

      const result = await service.createConversation({
        userId: 'user-uuid-1',
        repoOwner: 'acme',
        repoName: 'backend',
        issueNumber: 42,
        issueTitle: 'Login broken',
      });

      expect(result.repoOwner).toBe('acme');
      expect(result.issueNumber).toBe(42);
    });

    it('uses provided title', async () => {
      convRepo.save.mockResolvedValue(
        mockConversation({ title: 'Custom Title' }),
      );

      const result = await service.createConversation({
        userId: 'user-uuid-1',
        title: 'Custom Title',
      });

      expect(result.title).toBe('Custom Title');
    });
  });

  // ── getConversations ───────────────────────────────────────────────────────

  describe('getConversations', () => {
    it('returns all conversations for user ordered by updatedAt DESC', async () => {
      const convs = [
        mockConversation(),
        mockConversation({ id: 'conv-uuid-2' }),
      ];
      convRepo.find.mockResolvedValue(convs);

      const result = await service.getConversations('user-uuid-1');

      expect(convRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-uuid-1' } }),
      );
      expect(result).toHaveLength(2);
    });
  });

  // ── getConversation ────────────────────────────────────────────────────────

  describe('getConversation', () => {
    it('returns conversation when found', async () => {
      convRepo.findOne.mockResolvedValue(mockConversation());

      const result = await service.getConversation(
        'conv-uuid-1',
        'user-uuid-1',
      );

      expect(result.id).toBe('conv-uuid-1');
    });

    it('throws NotFoundException when conversation missing', async () => {
      convRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getConversation('bad-id', 'user-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── deleteConversation ─────────────────────────────────────────────────────

  describe('deleteConversation', () => {
    it('removes conversation', async () => {
      const conv = mockConversation();
      convRepo.findOne.mockResolvedValue(conv);

      await service.deleteConversation('conv-uuid-1', 'user-uuid-1');

      expect(convRepo.remove).toHaveBeenCalledWith(conv);
    });

    it('throws NotFoundException for non-existent conversation', async () => {
      convRepo.findOne.mockResolvedValue(null);

      await expect(
        service.deleteConversation('bad-id', 'user-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── sendMessage ────────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('appends user and assistant messages and tracks usage', async () => {
      const conv = mockConversation();
      convRepo.findOne.mockResolvedValue(conv);
      anthropicCreate.mockResolvedValue(
        mockAnthropicResponse('Here is the fix!'),
      );
      convRepo.save.mockImplementation((d) => Promise.resolve(d));

      const result = await service.sendMessage(
        'conv-uuid-1',
        'user-uuid-1',
        'How do I fix auth?',
      );

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].role).toBe('user');
      expect(result.messages[1].role).toBe('assistant');
      expect(result.messages[1].content).toBe('Here is the fix!');
      expect(result.totalCreditsUsed).toBe(1);
      expect(usageRepo.save).toHaveBeenCalled();
    });

    it('auto-generates title from first message', async () => {
      const conv = mockConversation();
      convRepo.findOne.mockResolvedValue(conv);
      anthropicCreate.mockResolvedValue(mockAnthropicResponse('Response'));
      convRepo.save.mockImplementation((d) => Promise.resolve(d));

      const result = await service.sendMessage(
        'conv-uuid-1',
        'user-uuid-1',
        'How do I fix the authentication bug?',
      );

      expect(result.title).toBe('How do I fix the authentication bug?');
    });

    it('truncates title at 60 chars', async () => {
      const conv = mockConversation();
      convRepo.findOne.mockResolvedValue(conv);
      anthropicCreate.mockResolvedValue(mockAnthropicResponse('Response'));
      convRepo.save.mockImplementation((d) => Promise.resolve(d));

      const longMsg = 'A'.repeat(80);
      const result = await service.sendMessage(
        'conv-uuid-1',
        'user-uuid-1',
        longMsg,
      );

      expect(result.title).toHaveLength(61); // 60 + "…"
      expect(result.title.endsWith('…')).toBe(true);
    });

    it('throws NotFoundException when conversation not found', async () => {
      convRepo.findOne.mockResolvedValue(null);

      await expect(
        service.sendMessage('bad-id', 'user-uuid-1', 'hello'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── fixIssue ───────────────────────────────────────────────────────────────

  describe('fixIssue', () => {
    it('generates structured fix and consumes 10 credits', async () => {
      const conv = mockConversation();
      convRepo.findOne.mockResolvedValue(conv);
      anthropicCreate.mockResolvedValue(
        mockAnthropicResponse(
          '## Root Cause Analysis\nNull pointer.\n## Fix\n```diff\n+fix\n```\n## Test\ntest\n## PR Description\nTitle: fix null ptr',
        ),
      );
      convRepo.save.mockImplementation((d) => Promise.resolve(d));

      const result = await service.fixIssue({
        userId: 'user-uuid-1',
        conversationId: 'conv-uuid-1',
        repoOwner: 'acme',
        repoName: 'api',
        issueNumber: 7,
        issueTitle: 'NPE on login',
        issueBody: 'Stack trace: NullPointerException at AuthService.java:42',
      });

      expect(result.repoOwner).toBe('acme');
      expect(result.issueNumber).toBe(7);
      expect(result.totalCreditsUsed).toBe(10);
      expect(result.messages).toHaveLength(2);
      expect(usageRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'fix_issue', creditsUsed: 10 }),
      );
    });

    it('sets conversation title from issue when first message', async () => {
      const conv = mockConversation();
      convRepo.findOne.mockResolvedValue(conv);
      anthropicCreate.mockResolvedValue(mockAnthropicResponse('Fix here'));
      convRepo.save.mockImplementation((d) => Promise.resolve(d));

      const result = await service.fixIssue({
        userId: 'user-uuid-1',
        conversationId: 'conv-uuid-1',
        repoOwner: 'acme',
        repoName: 'api',
        issueNumber: 99,
        issueTitle: 'Memory leak in cache',
        issueBody: '...',
      });

      expect(result.title).toBe('Fix #99: Memory leak in cache');
    });
  });

  // ── getUsage ───────────────────────────────────────────────────────────────

  describe('getUsage', () => {
    it('aggregates usage logs for current month', async () => {
      const logs = [
        { action: 'chat', creditsUsed: 1, inputTokens: 100, outputTokens: 50 },
        { action: 'chat', creditsUsed: 1, inputTokens: 200, outputTokens: 100 },
        {
          action: 'fix_issue',
          creditsUsed: 10,
          inputTokens: 500,
          outputTokens: 300,
        },
      ];
      convRepo.createQueryBuilder().getMany.mockResolvedValue([]);
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(logs),
      };
      usageRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getUsage('user-uuid-1');

      expect(result.totalCredits).toBe(12);
      expect(result.totalInputTokens).toBe(800);
      expect(result.totalOutputTokens).toBe(450);
      expect(result.breakdown).toHaveLength(2);
    });

    it('returns zeros when no usage logs', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      usageRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getUsage('user-uuid-1');

      expect(result.totalCredits).toBe(0);
      expect(result.breakdown).toHaveLength(0);
    });
  });
});
