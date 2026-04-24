import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Inject,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { firstValueFrom } from 'rxjs';
import {
  SERVICES,
  MESSAGE_PATTERNS,
  CurrentUser,
  JwtAuthGuard,
} from '../../common';
import type { IUser } from '../../common';

class ConnectRepoDto {
  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsNotEmpty()
  repoName: string;
}

@ApiTags('repos')
@Controller('repos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReposProxyController {
  constructor(
    @Inject(SERVICES.REPOS) private readonly reposClient: ClientProxy,
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
  ) {}

  private async getGithubToken(userId: string): Promise<string> {
    const token = await firstValueFrom<string | null>(
      this.authClient.send('auth.get_github_token', { userId }),
    );
    if (!token) {
      throw new BadRequestException(
        'No GitHub token found. Please log in with GitHub to access repository features.',
      );
    }
    return token;
  }

  @Get()
  @ApiOperation({ summary: 'List all GitHub repos for the authenticated user' })
  async listRepos(@CurrentUser() user: IUser) {
    const githubToken = await this.getGithubToken(user.id);
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.REPOS_LIST, {
        userId: user.id,
        githubToken,
      }),
    );
  }

  @Get('connected')
  @ApiOperation({ summary: 'List repos connected (installed) to CodeKang' })
  listConnected(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.REPOS_LIST_CONNECTED, {
        userId: user.id,
      }),
    );
  }

  @Post('connect')
  @ApiOperation({
    summary: 'Connect a repository to CodeKang (installs webhook)',
  })
  async connectRepo(@CurrentUser() user: IUser, @Body() dto: ConnectRepoDto) {
    const githubToken = await this.getGithubToken(user.id);
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.REPOS_CONNECT, {
        userId: user.id,
        userPlan: user.plan,
        owner: dto.owner,
        repoName: dto.repoName,
        githubToken,
      }),
    );
  }

  @Delete(':repoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect a repository from CodeKang' })
  async disconnectRepo(
    @CurrentUser() user: IUser,
    @Param('repoId') repoId: string,
  ) {
    const githubToken = await this.getGithubToken(user.id);
    await firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.REPOS_DISCONNECT, {
        userId: user.id,
        repoId,
        githubToken,
      }),
      { defaultValue: null },
    );
  }

  @Get(':owner/:repo/issues')
  @ApiOperation({ summary: 'List issues for a repository' })
  @ApiQuery({ name: 'state', enum: ['open', 'closed', 'all'], required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  async getIssues(
    @CurrentUser() user: IUser,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('state') state?: 'open' | 'closed' | 'all',
    @Query('page') page?: number,
  ) {
    const githubToken = await this.getGithubToken(user.id);
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.REPOS_GET_ISSUES, {
        userId: user.id,
        owner,
        repoName: repo,
        githubToken,
        state: state ?? 'open',
        page: page ?? 1,
      }),
    );
  }

  @Get(':owner/:repo/issues/:number')
  @ApiOperation({ summary: 'Get a single issue' })
  async getIssue(
    @CurrentUser() user: IUser,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number') issueNumber: number,
  ) {
    const githubToken = await this.getGithubToken(user.id);
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.REPOS_GET_ISSUE, {
        userId: user.id,
        owner,
        repoName: repo,
        issueNumber: Number(issueNumber),
        githubToken,
      }),
    );
  }

  @Get(':owner/:repo/pulls')
  @ApiOperation({ summary: 'List pull requests for a repository' })
  @ApiQuery({ name: 'state', enum: ['open', 'closed', 'all'], required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  async getPullRequests(
    @CurrentUser() user: IUser,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('state') state?: 'open' | 'closed' | 'all',
    @Query('page') page?: number,
  ) {
    const githubToken = await this.getGithubToken(user.id);
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.REPOS_GET_PRS, {
        userId: user.id,
        owner,
        repoName: repo,
        githubToken,
        state: state ?? 'open',
        page: page ?? 1,
      }),
    );
  }

  @Get(':owner/:repo/pulls/:number')
  @ApiOperation({ summary: 'Get a single pull request' })
  async getPullRequest(
    @CurrentUser() user: IUser,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number') prNumber: number,
  ) {
    const githubToken = await this.getGithubToken(user.id);
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.REPOS_GET_PR, {
        userId: user.id,
        owner,
        repoName: repo,
        prNumber: Number(prNumber),
        githubToken,
      }),
    );
  }

  @Get(':repoId')
  @ApiOperation({ summary: 'Get a single connected repository by ID' })
  getOne(@CurrentUser() user: IUser, @Param('repoId') repoId: string) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.REPOS_GET_ONE, {
        userId: user.id,
        repoId,
      }),
    );
  }

  @Post(':repoId/sync')
  @ApiOperation({ summary: 'Sync repo metadata from GitHub' })
  async syncRepo(@CurrentUser() user: IUser, @Param('repoId') repoId: string) {
    const githubToken = await this.getGithubToken(user.id);
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.REPOS_SYNC, {
        userId: user.id,
        repoId,
        githubToken,
      }),
    );
  }
}
