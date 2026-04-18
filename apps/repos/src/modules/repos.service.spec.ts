import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReposService } from './repos.service';
import { Repository } from '../entities/repository.entity';

// ─── Mock Octokit ─────────────────────────────────────────────────────────────

const mockOctokit = {
  repos: {
    listForAuthenticatedUser: jest.fn(),
    get: jest.fn(),
    createWebhook: jest.fn(),
    deleteWebhook: jest.fn(),
  },
  issues: {
    listForRepo: jest.fn(),
    get: jest.fn(),
  },
  pulls: {
    list: jest.fn(),
    get: jest.fn(),
  },
};

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => mockOctokit),
}));

// ─── Mock repo entity ─────────────────────────────────────────────────────────

const mockRepo = (overrides = {}): Repository =>
  ({
    id: 'repo-uuid-1',
    userId: 'user-uuid-1',
    githubId: 12345,
    owner: 'acme',
    name: 'backend',
    fullName: 'acme/backend',
    description: 'Main backend service',
    private: false,
    defaultBranch: 'main',
    language: 'TypeScript',
    stargazersCount: 42,
    isInstalled: true,
    webhookId: 99,
    htmlUrl: 'https://github.com/acme/backend',
    githubUpdatedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as Repository;

const mockRepoRepo = () => ({
  create: jest.fn().mockImplementation((d) => d),
  save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn().mockResolvedValue(0),
  remove: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ReposService', () => {
  let service: ReposService;
  let repoRepo: ReturnType<typeof mockRepoRepo>;

  beforeEach(async () => {
    repoRepo = mockRepoRepo();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReposService,
        { provide: getRepositoryToken(Repository), useValue: repoRepo },
      ],
    }).compile();

    service = module.get(ReposService);
  });

  // ── listGitHubRepos ────────────────────────────────────────────────────────

  describe('listGitHubRepos', () => {
    it('returns all repos for user (single page)', async () => {
      const fakeRepos = [
        { id: 1, name: 'repo1' },
        { id: 2, name: 'repo2' },
      ];
      mockOctokit.repos.listForAuthenticatedUser.mockResolvedValue({
        data: fakeRepos,
      });

      const result = await service.listGitHubRepos('user-1', 'gho_token');

      expect(result).toHaveLength(2);
    });

    it('paginates until empty page', async () => {
      mockOctokit.repos.listForAuthenticatedUser
        .mockResolvedValueOnce({ data: Array(100).fill({ id: 1, name: 'r' }) })
        .mockResolvedValueOnce({ data: [] });

      const result = await service.listGitHubRepos('user-1', 'gho_token');

      expect(result).toHaveLength(100);
      expect(mockOctokit.repos.listForAuthenticatedUser).toHaveBeenCalledTimes(
        2,
      );
    });
  });

  // ── listConnectedRepos ─────────────────────────────────────────────────────

  describe('listConnectedRepos', () => {
    it('returns repos connected to CodeKang', async () => {
      repoRepo.find.mockResolvedValue([
        mockRepo(),
        mockRepo({ id: 'repo-uuid-2' }),
      ]);

      const result = await service.listConnectedRepos('user-uuid-1');

      expect(result).toHaveLength(2);
      expect(repoRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-uuid-1' } }),
      );
    });
  });

  // ── connectRepo ────────────────────────────────────────────────────────────

  describe('connectRepo', () => {
    const ghRepoData = {
      id: 12345,
      owner: { login: 'acme' },
      name: 'backend',
      full_name: 'acme/backend',
      description: 'Main API',
      private: false,
      default_branch: 'main',
      language: 'TypeScript',
      stargazers_count: 42,
      html_url: 'https://github.com/acme/backend',
      updated_at: new Date().toISOString(),
    };

    beforeEach(() => {
      mockOctokit.repos.get.mockResolvedValue({ data: ghRepoData });
      mockOctokit.repos.createWebhook.mockResolvedValue({ data: { id: 777 } });
    });

    it('connects repo and installs webhook', async () => {
      repoRepo.findOne.mockResolvedValue(null);
      repoRepo.save.mockImplementation((d) =>
        Promise.resolve({ ...d, id: 'repo-uuid-1' }),
      );

      const result = await service.connectRepo(
        'user-uuid-1',
        'pro',
        'acme',
        'backend',
        'gho_token',
      );

      expect(mockOctokit.repos.createWebhook).toHaveBeenCalled();
      expect(repoRepo.save).toHaveBeenCalled();
      expect(result.isInstalled).toBe(true);
    });

    it('blocks when free plan repo limit reached', async () => {
      repoRepo.count.mockResolvedValue(5); // at limit (maxPrivateRepos = 5 for free)

      await expect(
        service.connectRepo(
          'user-uuid-1',
          'free',
          'acme',
          'backend',
          'gho_token',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows unlimited repos on team plan', async () => {
      repoRepo.count.mockResolvedValue(999);
      repoRepo.findOne.mockResolvedValue(null);
      repoRepo.save.mockImplementation((d) =>
        Promise.resolve({ ...d, id: 'new-id' }),
      );

      const result = await service.connectRepo(
        'user-uuid-1',
        'team',
        'acme',
        'backend',
        'gho_token',
      );

      expect(result.isInstalled).toBe(true);
    });

    it('updates existing repo record rather than creating duplicate', async () => {
      const existing = mockRepo({ isInstalled: false });
      repoRepo.findOne.mockResolvedValue(existing);
      repoRepo.save.mockImplementation((d) => Promise.resolve(d));

      await service.connectRepo(
        'user-uuid-1',
        'pro',
        'acme',
        'backend',
        'gho_token',
      );

      expect(repoRepo.create).not.toHaveBeenCalled();
    });

    it('continues without failing when webhook creation errors', async () => {
      mockOctokit.repos.createWebhook.mockRejectedValue(
        new Error('Webhook already exists'),
      );
      repoRepo.findOne.mockResolvedValue(null);
      repoRepo.save.mockImplementation((d) =>
        Promise.resolve({ ...d, id: 'repo-uuid-1' }),
      );

      const result = await service.connectRepo(
        'user-uuid-1',
        'pro',
        'acme',
        'backend',
        'gho_token',
      );

      expect(result.isInstalled).toBe(true);
    });
  });

  // ── disconnectRepo ─────────────────────────────────────────────────────────

  describe('disconnectRepo', () => {
    it('removes webhook and marks repo as not installed', async () => {
      const repo = mockRepo();
      repoRepo.findOne.mockResolvedValue(repo);
      repoRepo.save.mockImplementation((d) => Promise.resolve(d));

      await service.disconnectRepo('user-uuid-1', 'repo-uuid-1', 'gho_token');

      expect(mockOctokit.repos.deleteWebhook).toHaveBeenCalled();
      expect(repoRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isInstalled: false }),
      );
    });

    it('throws NotFoundException when repo not found', async () => {
      repoRepo.findOne.mockResolvedValue(null);

      await expect(
        service.disconnectRepo('user-uuid-1', 'bad-id', 'gho_token'),
      ).rejects.toThrow(NotFoundException);
    });

    it('continues without failing when webhook delete errors', async () => {
      const repo = mockRepo();
      repoRepo.findOne.mockResolvedValue(repo);
      mockOctokit.repos.deleteWebhook.mockRejectedValue(new Error('Not found'));
      repoRepo.save.mockImplementation((d) => Promise.resolve(d));

      await service.disconnectRepo('user-uuid-1', 'repo-uuid-1', 'gho_token');

      expect(repoRepo.save).toHaveBeenCalled();
    });
  });

  // ── getIssues ──────────────────────────────────────────────────────────────

  describe('getIssues', () => {
    it('returns issues filtering out pull requests', async () => {
      const data = [
        { id: 1, number: 1, title: 'Bug', pull_request: undefined },
        {
          id: 2,
          number: 2,
          title: 'PR disguised',
          pull_request: { url: '...' },
        },
        { id: 3, number: 3, title: 'Feature req', pull_request: undefined },
      ];
      mockOctokit.issues.listForRepo.mockResolvedValue({ data });

      const result = await service.getIssues(
        'user-uuid-1',
        'acme',
        'backend',
        'gho_token',
        'open',
        1,
      );

      expect(result).toHaveLength(2);
      expect(result.every((i: any) => !i.pull_request)).toBe(true);
    });
  });

  // ── getIssue ───────────────────────────────────────────────────────────────

  describe('getIssue', () => {
    it('returns a single issue', async () => {
      mockOctokit.issues.get.mockResolvedValue({
        data: { id: 1, number: 5, title: 'Bug' },
      });

      const result = await service.getIssue(
        'user-uuid-1',
        'acme',
        'backend',
        5,
        'gho_token',
      );

      expect(mockOctokit.issues.get).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: 'acme',
          repo: 'backend',
          issue_number: 5,
        }),
      );
      expect((result as any).number).toBe(5);
    });
  });

  // ── getPullRequests ────────────────────────────────────────────────────────

  describe('getPullRequests', () => {
    it('returns pull requests from GitHub', async () => {
      const data = [{ id: 1, number: 3, title: 'Add feature' }];
      mockOctokit.pulls.list.mockResolvedValue({ data });

      const result = await service.getPullRequests(
        'user-uuid-1',
        'acme',
        'backend',
        'gho_token',
        'open',
        1,
      );

      expect(result).toHaveLength(1);
    });
  });
});
