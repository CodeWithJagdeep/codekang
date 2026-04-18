import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReposProxyController } from './repos.controller';
import { SERVICES } from '../../common';
import type { IUser } from '../../common';

jest.mock('rxjs', () => {
  const actual = jest.requireActual('rxjs');
  return {
    ...actual,
    firstValueFrom: jest.fn().mockImplementation((obs) => obs.toPromise()),
  };
});

const mockUser = (plan: IUser['plan'] = 'pro'): IUser => ({
  id: 'user-uuid-1',
  email: 'dev@test.com',
  name: 'Dev',
  provider: 'github',
  providerId: 'gh-1',
  plan,
  onboardingCompleted: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeClient = (returnValue: unknown) => ({
  send: jest
    .fn()
    .mockReturnValue({ toPromise: jest.fn().mockResolvedValue(returnValue) }),
});

describe('ReposProxyController', () => {
  let controller: ReposProxyController;
  let reposClient: ReturnType<typeof makeClient>;
  let authClient: ReturnType<typeof makeClient>;

  const setupModule = async (githubToken: string | null = 'gho_token') => {
    reposClient = makeClient([]);
    authClient = makeClient(githubToken);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReposProxyController],
      providers: [
        { provide: SERVICES.REPOS, useValue: reposClient },
        { provide: SERVICES.AUTH, useValue: authClient },
      ],
    }).compile();

    controller = module.get(ReposProxyController);
  };

  beforeEach(async () => setupModule());

  describe('listRepos', () => {
    it('fetches GitHub token then lists repos', async () => {
      await controller.listRepos(mockUser());

      expect(authClient.send).toHaveBeenCalledWith('auth.get_github_token', {
        userId: 'user-uuid-1',
      });
      expect(reposClient.send).toHaveBeenCalledWith(
        'repos.list',
        expect.objectContaining({
          userId: 'user-uuid-1',
          githubToken: 'gho_token',
        }),
      );
    });

    it('throws BadRequestException when GitHub token is missing', async () => {
      await setupModule(null);

      await expect(controller.listRepos(mockUser())).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('listConnected', () => {
    it('returns connected repos without needing GitHub token', async () => {
      await controller.listConnected(mockUser());

      expect(reposClient.send).toHaveBeenCalledWith('repos.list_connected', {
        userId: 'user-uuid-1',
      });
      expect(authClient.send).not.toHaveBeenCalled();
    });
  });

  describe('connectRepo', () => {
    it('connects repo with user plan info', async () => {
      reposClient = makeClient({ id: 'repo-uuid-1', isInstalled: true });
      const module = await Test.createTestingModule({
        controllers: [ReposProxyController],
        providers: [
          { provide: SERVICES.REPOS, useValue: reposClient },
          { provide: SERVICES.AUTH, useValue: authClient },
        ],
      }).compile();
      controller = module.get(ReposProxyController);

      await controller.connectRepo(mockUser('pro'), {
        owner: 'acme',
        repoName: 'backend',
      });

      expect(reposClient.send).toHaveBeenCalledWith(
        'repos.connect',
        expect.objectContaining({
          userId: 'user-uuid-1',
          userPlan: 'pro',
          owner: 'acme',
          repoName: 'backend',
        }),
      );
    });
  });

  describe('disconnectRepo', () => {
    it('disconnects repo with user GitHub token', async () => {
      await controller.disconnectRepo(mockUser(), 'repo-uuid-1');

      expect(reposClient.send).toHaveBeenCalledWith(
        'repos.disconnect',
        expect.objectContaining({
          repoId: 'repo-uuid-1',
          githubToken: 'gho_token',
        }),
      );
    });
  });

  describe('getIssues', () => {
    it('fetches issues with default state=open page=1', async () => {
      await controller.getIssues(mockUser(), 'acme', 'backend');

      expect(reposClient.send).toHaveBeenCalledWith(
        'repos.get_issues',
        expect.objectContaining({
          owner: 'acme',
          repoName: 'backend',
          state: 'open',
          page: 1,
        }),
      );
    });

    it('accepts custom state and page', async () => {
      await controller.getIssues(mockUser(), 'acme', 'backend', 'closed', 3);

      expect(reposClient.send).toHaveBeenCalledWith(
        'repos.get_issues',
        expect.objectContaining({ state: 'closed', page: 3 }),
      );
    });
  });

  describe('getPullRequests', () => {
    it('fetches PRs with default state=open', async () => {
      await controller.getPullRequests(mockUser(), 'acme', 'backend');

      expect(reposClient.send).toHaveBeenCalledWith(
        'repos.get_prs',
        expect.objectContaining({ owner: 'acme', state: 'open' }),
      );
    });
  });

  describe('getIssue', () => {
    it('fetches a single issue by number', async () => {
      await controller.getIssue(mockUser(), 'acme', 'backend', 5);

      expect(reposClient.send).toHaveBeenCalledWith(
        'repos.get_issue',
        expect.objectContaining({ owner: 'acme', issueNumber: 5 }),
      );
    });
  });
});
