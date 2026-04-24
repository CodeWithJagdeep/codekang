import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReposService } from './repos.service';
import { MESSAGE_PATTERNS } from '../common';
import type { PlanTier } from '../common';

@Controller()
export class ReposController {
  constructor(private readonly reposService: ReposService) {}

  @MessagePattern(MESSAGE_PATTERNS.REPOS_LIST)
  listGitHubRepos(@Payload() data: { userId: string; githubToken: string }) {
    return this.reposService.listGitHubRepos(data.userId, data.githubToken);
  }

  @MessagePattern(MESSAGE_PATTERNS.REPOS_LIST_CONNECTED)
  listConnected(@Payload() data: { userId: string }) {
    return this.reposService.listConnectedRepos(data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.REPOS_GET_ONE)
  getOne(@Payload() data: { userId: string; repoId: string }) {
    return this.reposService.getConnectedRepo(data.userId, data.repoId);
  }

  @MessagePattern(MESSAGE_PATTERNS.REPOS_CONNECT)
  connectRepo(
    @Payload()
    data: {
      userId: string;
      userPlan: PlanTier;
      owner: string;
      repoName: string;
      githubToken: string;
    },
  ) {
    return this.reposService.connectRepo(
      data.userId,
      data.userPlan,
      data.owner,
      data.repoName,
      data.githubToken,
    );
  }

  @MessagePattern(MESSAGE_PATTERNS.REPOS_DISCONNECT)
  disconnectRepo(
    @Payload() data: { userId: string; repoId: string; githubToken: string },
  ) {
    return this.reposService.disconnectRepo(
      data.userId,
      data.repoId,
      data.githubToken,
    );
  }

  @MessagePattern(MESSAGE_PATTERNS.REPOS_GET_ISSUES)
  getIssues(
    @Payload()
    data: {
      userId: string;
      owner: string;
      repoName: string;
      githubToken: string;
      state?: 'open' | 'closed' | 'all';
      page?: number;
    },
  ) {
    return this.reposService.getIssues(
      data.userId,
      data.owner,
      data.repoName,
      data.githubToken,
      data.state,
      data.page,
    );
  }

  @MessagePattern(MESSAGE_PATTERNS.REPOS_GET_ISSUE)
  getIssue(
    @Payload()
    data: {
      userId: string;
      owner: string;
      repoName: string;
      issueNumber: number;
      githubToken: string;
    },
  ) {
    return this.reposService.getIssue(
      data.userId,
      data.owner,
      data.repoName,
      data.issueNumber,
      data.githubToken,
    );
  }

  @MessagePattern(MESSAGE_PATTERNS.REPOS_GET_PRS)
  getPullRequests(
    @Payload()
    data: {
      userId: string;
      owner: string;
      repoName: string;
      githubToken: string;
      state?: 'open' | 'closed' | 'all';
      page?: number;
    },
  ) {
    return this.reposService.getPullRequests(
      data.userId,
      data.owner,
      data.repoName,
      data.githubToken,
      data.state,
      data.page,
    );
  }

  @MessagePattern(MESSAGE_PATTERNS.REPOS_GET_PR)
  getPullRequest(
    @Payload()
    data: {
      userId: string;
      owner: string;
      repoName: string;
      prNumber: number;
      githubToken: string;
    },
  ) {
    return this.reposService.getPullRequest(
      data.userId,
      data.owner,
      data.repoName,
      data.prNumber,
      data.githubToken,
    );
  }

  @MessagePattern(MESSAGE_PATTERNS.REPOS_SYNC)
  syncRepo(
    @Payload() data: { userId: string; repoId: string; githubToken: string },
  ) {
    return this.reposService.syncRepoMetadata(
      data.userId,
      data.repoId,
      data.githubToken,
    );
  }
}
