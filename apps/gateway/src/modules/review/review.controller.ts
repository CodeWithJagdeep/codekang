import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard, CurrentUser, SERVICES, MESSAGE_PATTERNS } from '../../common';
import type { IUser } from '../../common';

@ApiTags('review')
@Controller('review')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewProxyController {
  private readonly aiUrl: string;

  constructor(
    private readonly config: ConfigService,
    @Inject(SERVICES.REPOS) private readonly reposClient: ClientProxy,
  ) {
    this.aiUrl = this.config.get('AUTONOMOUS_AI_URL', 'http://localhost:4000');
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated review analytics for the user\'s connected repos' })
  @ApiQuery({ name: 'days', enum: ['7', '30', '90', '0'], required: false })
  async getStats(
    @CurrentUser() user: IUser,
    @Query('days') days?: string,
  ) {
    // Fetch user's connected repos so we only show their own data
    const repos = await firstValueFrom<Array<{ owner: string; name: string }>>(
      this.reposClient.send(MESSAGE_PATTERNS.REPOS_LIST_CONNECTED, { userId: user.id }),
    ).catch(() => [] as Array<{ owner: string; name: string }>);

    if (!repos || repos.length === 0) {
      return {
        totals:  { reviews: 0, bugs: 0, fixed: 0, approved: 0, requestChanges: 0, commented: 0 },
        prev:    { reviews: 0, bugs: 0, fixed: 0 },
        daily:   [],
        byRepo:  [],
        recent:  [],
      };
    }

    const reposParam = repos.map((r) => `${r.owner}/${r.name}`).join(',');
    const daysParam  = days ?? '30';

    const res = await fetch(
      `${this.aiUrl}/review/stats?repos=${encodeURIComponent(reposParam)}&days=${daysParam}`,
    ).catch(() => null);

    if (!res || !res.ok) {
      return {
        totals:  { reviews: 0, bugs: 0, fixed: 0, approved: 0, requestChanges: 0, commented: 0 },
        prev:    { reviews: 0, bugs: 0, fixed: 0 },
        daily:   [],
        byRepo:  [],
        recent:  [],
      };
    }
    return res.json();
  }

  @Get(':owner/:repo/:prNumber')
  @ApiOperation({ summary: 'Get AI review result for a pull request' })
  async getReview(
    @CurrentUser() _user: IUser,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('prNumber') prNumber: string,
  ) {
    const res = await fetch(
      `${this.aiUrl}/review/${owner}/${repo}/${prNumber}`,
    ).catch(() => null);

    if (!res) throw new InternalServerErrorException('AI service unreachable');
    if (res.status === 404) throw new NotFoundException('No review found for this PR');
    if (!res.ok) throw new InternalServerErrorException('AI service error');
    return res.json();
  }

  @Post(':owner/:repo/:prNumber/fix')
  @ApiOperation({ summary: 'Trigger agent to fix issues found in the AI review' })
  async triggerFix(
    @CurrentUser() user: IUser,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('prNumber') prNumber: string,
    @Body() body: Record<string, unknown>,
  ) {
    const res = await fetch(
      `${this.aiUrl}/review/${owner}/${repo}/${prNumber}/fix`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...body, approvedBy: user.email ?? user.id }),
      },
    ).catch(() => null);

    if (!res) throw new InternalServerErrorException('AI service unreachable');
    if (res.status === 404) throw new NotFoundException('No review found for this PR');
    if (res.status === 400) {
      const err = (await res.json()) as { error: string };
      throw new BadRequestException(err.error);
    }
    if (!res.ok) throw new InternalServerErrorException('AI service error');
    return res.json();
  }
}
