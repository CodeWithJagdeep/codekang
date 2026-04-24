import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { Octokit } from '@octokit/rest';
import { Repository } from '../entities/repository.entity';
import { PLANS } from '../common';
import type {
  IRepository,
  IGitHubRepo,
  IGitHubIssue,
  IGitHubPR,
  PlanTier,
} from '../common';

@Injectable()
export class ReposService {
  constructor(
    @InjectRepository(Repository)
    private readonly repoRepo: TypeOrmRepository<Repository>,
  ) {}

  private getOctokit(token: string): Octokit {
    return new Octokit({ auth: token });
  }

  async listGitHubRepos(
    userId: string,
    githubToken: string,
  ): Promise<IGitHubRepo[]> {
    const octokit = this.getOctokit(githubToken);
    const repos: IGitHubRepo[] = [];
    let page = 1;

    while (true) {
      const { data } = await octokit.repos.listForAuthenticatedUser({
        per_page: 100,
        page,
        sort: 'updated',
        affiliation: 'owner,collaborator,organization_member',
      });
      if (data.length === 0) break;
      repos.push(...(data as unknown as IGitHubRepo[]));
      if (data.length < 100) break;
      page++;
    }

    return repos;
  }

  async listConnectedRepos(userId: string): Promise<IRepository[]> {
    const repos = await this.repoRepo.find({
      where: { userId, isInstalled: true },
      order: { updatedAt: 'DESC' },
    });
    return repos as unknown as IRepository[];
  }

  async getConnectedRepo(userId: string, repoId: string): Promise<IRepository> {
    const repo = await this.repoRepo.findOne({ where: { id: repoId, userId } });
    if (!repo) throw new NotFoundException('Repository not found');
    return repo as unknown as IRepository;
  }

  async connectRepo(
    userId: string,
    userPlan: PlanTier,
    owner: string,
    repoName: string,
    githubToken: string,
  ): Promise<IRepository> {
    const plan = PLANS[userPlan];
    const maxRepos = plan.features.maxPrivateRepos;
    if (maxRepos !== -1) {
      const count = await this.repoRepo.count({
        where: { userId, isInstalled: true },
      });
      if (count >= maxRepos) {
        const nextTier =
          userPlan === 'free'
            ? 'Starter ($12/mo)'
            : userPlan === 'starter'
              ? 'Pro ($24/mo)'
              : userPlan === 'pro'
                ? 'Team ($199/mo)'
                : 'Enterprise';
        throw new ForbiddenException(
          `Your ${plan.name} plan allows up to ${maxRepos} private repos. Upgrade to ${nextTier} to connect more.`,
        );
      }
    }

    const octokit = this.getOctokit(githubToken);
    const { data: ghRepo } = await octokit.repos.get({ owner, repo: repoName });

    let repo = await this.repoRepo.findOne({
      where: { userId, githubId: ghRepo.id },
    });

    if (!repo) {
      repo = this.repoRepo.create({
        userId,
        githubId: ghRepo.id,
        owner: ghRepo.owner.login,
        name: ghRepo.name,
        fullName: ghRepo.full_name,
        description: ghRepo.description ?? undefined,
        private: ghRepo.private,
        defaultBranch: ghRepo.default_branch,
        language: ghRepo.language ?? undefined,
        stargazersCount: ghRepo.stargazers_count,
        htmlUrl: ghRepo.html_url,
        githubUpdatedAt: new Date(ghRepo.updated_at),
        isInstalled: false,
      });
    }

    // Install webhook
    try {
      const webhook = await octokit.repos.createWebhook({
        owner,
        repo: repoName,
        config: {
          url:
            process.env.WEBHOOK_URL ??
            `${process.env.AUTONOMOUS_AI_URL}/webhook`,
          content_type: 'json',
          secret: process.env.GITHUB_WEBHOOK_SECRET,
        },
        events: ['issues', 'pull_request', 'push'],
        active: true,
      });
      repo.webhookId = webhook.data.id;
    } catch {
      // Webhook creation is non-blocking — continue without it
    }

    repo.isInstalled = true;
    await this.repoRepo.save(repo);
    return repo as unknown as IRepository;
  }

  async disconnectRepo(
    userId: string,
    repoId: string,
    githubToken: string,
  ): Promise<void> {
    const repo = await this.repoRepo.findOne({ where: { id: repoId, userId } });
    if (!repo) throw new NotFoundException('Repository not found');

    if (repo.webhookId) {
      try {
        const octokit = this.getOctokit(githubToken);
        await octokit.repos.deleteWebhook({
          owner: repo.owner,
          repo: repo.name,
          hook_id: repo.webhookId,
        });
      } catch {
        // Non-blocking
      }
    }

    repo.isInstalled = false;
    repo.webhookId = 0;
    await this.repoRepo.save(repo);
  }

  async getIssues(
    userId: string,
    owner: string,
    repoName: string,
    githubToken: string,
    state: 'open' | 'closed' | 'all' = 'open',
    page = 1,
  ): Promise<IGitHubIssue[]> {
    const octokit = this.getOctokit(githubToken);
    const { data } = await octokit.issues.listForRepo({
      owner,
      repo: repoName,
      state,
      per_page: 30,
      page,
      sort: 'updated',
    });
    return data.filter((i) => !i.pull_request) as unknown as IGitHubIssue[];
  }

  async getIssue(
    userId: string,
    owner: string,
    repoName: string,
    issueNumber: number,
    githubToken: string,
  ): Promise<IGitHubIssue> {
    const octokit = this.getOctokit(githubToken);
    const { data } = await octokit.issues.get({
      owner,
      repo: repoName,
      issue_number: issueNumber,
    });
    return data as unknown as IGitHubIssue;
  }

  async getPullRequests(
    userId: string,
    owner: string,
    repoName: string,
    githubToken: string,
    state: 'open' | 'closed' | 'all' = 'open',
    page = 1,
  ): Promise<IGitHubPR[]> {
    const octokit = this.getOctokit(githubToken);
    const { data } = await octokit.pulls.list({
      owner,
      repo: repoName,
      state,
      per_page: 30,
      page,
      sort: 'updated',
    });
    return data as unknown as IGitHubPR[];
  }

  async getPullRequest(
    userId: string,
    owner: string,
    repoName: string,
    prNumber: number,
    githubToken: string,
  ): Promise<IGitHubPR> {
    const octokit = this.getOctokit(githubToken);
    const { data } = await octokit.pulls.get({
      owner,
      repo: repoName,
      pull_number: prNumber,
    });
    return data as unknown as IGitHubPR;
  }

  async syncRepoMetadata(
    userId: string,
    repoId: string,
    githubToken: string,
  ): Promise<IRepository> {
    const repo = await this.repoRepo.findOne({ where: { id: repoId, userId } });
    if (!repo) throw new NotFoundException('Repository not found');

    const octokit = this.getOctokit(githubToken);
    const { data: ghRepo } = await octokit.repos.get({
      owner: repo.owner,
      repo: repo.name,
    });

    repo.description = ghRepo.description ?? repo.description;
    repo.stargazersCount = ghRepo.stargazers_count;
    repo.language = ghRepo.language ?? repo.language;
    repo.defaultBranch = ghRepo.default_branch;
    repo.githubUpdatedAt = new Date(ghRepo.updated_at);
    await this.repoRepo.save(repo);
    return repo as unknown as IRepository;
  }
}
