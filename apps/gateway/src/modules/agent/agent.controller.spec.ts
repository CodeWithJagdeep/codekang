import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { AgentProxyController } from './agent.controller';
import { SERVICES } from '../../common';
import type { IUser } from '../../common';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = (): IUser => ({
  id: 'user-uuid-1',
  email: 'dev@test.com',
  name: 'Dev User',
  provider: 'github',
  providerId: 'gh-123',
  plan: 'pro',
  onboardingCompleted: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockConversation = () => ({
  id: 'conv-uuid-1',
  userId: 'user-uuid-1',
  title: 'Test',
  messages: [],
  repoOwner: null,
  repoName: null,
  issueNumber: null,
  totalCreditsUsed: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeMockClient = (responseValue: unknown) => ({
  send: jest.fn().mockReturnValue({
    pipe: jest.fn(),
    subscribe: jest.fn(),
    toPromise: jest.fn().mockResolvedValue(responseValue),
    [Symbol.observable ?? Symbol('observable')]: jest.fn(),
  }),
});

// rxjs firstValueFrom requires an observable — mock it properly
jest.mock('rxjs', () => {
  const actual = jest.requireActual('rxjs');
  return {
    ...actual,
    firstValueFrom: jest.fn().mockImplementation((obs) => obs.toPromise()),
  };
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AgentProxyController', () => {
  let controller: AgentProxyController;
  let agentClient: ReturnType<typeof makeMockClient>;
  let authClient: ReturnType<typeof makeMockClient>;

  beforeEach(async () => {
    agentClient = makeMockClient(mockConversation());
    authClient = makeMockClient({ success: true });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentProxyController],
      providers: [
        { provide: SERVICES.AI_AGENT, useValue: agentClient },
        { provide: SERVICES.AUTH, useValue: authClient },
      ],
    }).compile();

    controller = module.get(AgentProxyController);
  });

  describe('createConversation', () => {
    it('creates conversation with repo context', async () => {
      const result = await controller.createConversation(mockUser(), {
        repoOwner: 'acme',
        repoName: 'backend',
        issueNumber: 5,
        issueTitle: 'Bug',
      });

      expect(agentClient.send).toHaveBeenCalledWith(
        'agent.create_conversation',
        expect.objectContaining({ userId: 'user-uuid-1', repoOwner: 'acme' }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('getConversations', () => {
    it('lists conversations for authenticated user', async () => {
      agentClient = makeMockClient([mockConversation()]);
      const module = await Test.createTestingModule({
        controllers: [AgentProxyController],
        providers: [
          { provide: SERVICES.AI_AGENT, useValue: agentClient },
          { provide: SERVICES.AUTH, useValue: authClient },
        ],
      }).compile();
      controller = module.get(AgentProxyController);

      await controller.getConversations(mockUser());

      expect(agentClient.send).toHaveBeenCalledWith('agent.get_conversations', {
        userId: 'user-uuid-1',
      });
    });
  });

  describe('sendMessage', () => {
    it('consumes credits then forwards message to agent', async () => {
      await controller.sendMessage(mockUser(), 'conv-uuid-1', {
        content: 'How do I fix this?',
      });

      // First call: consume credits
      expect(authClient.send).toHaveBeenCalledWith('auth.consume_credits', {
        userId: 'user-uuid-1',
        cost: 1,
      });
      // Second call: send message to agent
      expect(agentClient.send).toHaveBeenCalledWith(
        'agent.send_message',
        expect.objectContaining({
          conversationId: 'conv-uuid-1',
          userId: 'user-uuid-1',
          content: 'How do I fix this?',
        }),
      );
    });
  });

  describe('fixIssue', () => {
    it('consumes 10 credits then triggers fix', async () => {
      await controller.fixIssue(mockUser(), 'conv-uuid-1', {
        repoOwner: 'acme',
        repoName: 'api',
        issueNumber: 7,
        issueTitle: 'NPE on login',
        issueBody: 'Stack trace...',
      });

      expect(authClient.send).toHaveBeenCalledWith('auth.consume_credits', {
        userId: 'user-uuid-1',
        cost: 10,
      });
      expect(agentClient.send).toHaveBeenCalledWith(
        'agent.fix_issue',
        expect.objectContaining({ issueNumber: 7, repoOwner: 'acme' }),
      );
    });
  });

  describe('deleteConversation', () => {
    it('sends delete message to agent', async () => {
      await controller.deleteConversation(mockUser(), 'conv-uuid-1');

      expect(agentClient.send).toHaveBeenCalledWith(
        'agent.delete_conversation',
        { id: 'conv-uuid-1', userId: 'user-uuid-1' },
      );
    });
  });

  describe('getUsage', () => {
    it('requests usage stats from agent service', async () => {
      await controller.getUsage(mockUser());

      expect(agentClient.send).toHaveBeenCalledWith('agent.get_usage', {
        userId: 'user-uuid-1',
      });
    });
  });
});
