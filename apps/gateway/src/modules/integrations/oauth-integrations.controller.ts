import {
  Controller,
  Get,
  Query,
  Res,
  Inject,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { SERVICES, CurrentUser, JwtAuthGuard } from '../../common';
import type { IUser } from '../../common';
import { OAuthIntegrationsService } from './oauth-integrations.service';

const FRONTEND = () => process.env.FRONTEND_URL ?? 'http://localhost:3010';
const successRedirect = (provider: string) =>
  `${FRONTEND()}/dashboard/integrations?connected=${provider}`;
const errorRedirect = (provider: string, reason: string) =>
  `${FRONTEND()}/dashboard/integrations?error=${provider}_${reason}`;

@ApiTags('integrations')
@Controller('integrations')
export class OAuthIntegrationsController {
  private readonly logger = new Logger(OAuthIntegrationsController.name);

  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
    private readonly oauth: OAuthIntegrationsService,
  ) {}

  // ── OAuth start endpoints (protected — return the URL for frontend to redirect) ──

  @Get('discord/oauth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Discord OAuth URL' })
  startDiscord(@CurrentUser() user: IUser) {
    return { url: this.oauth.buildDiscordOAuthUrl(user.id) };
  }

  @Get('slack/oauth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Slack OAuth URL' })
  startSlack(@CurrentUser() user: IUser) {
    return { url: this.oauth.buildSlackOAuthUrl(user.id) };
  }

  @Get('linear/oauth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Linear OAuth URL' })
  startLinear(@CurrentUser() user: IUser) {
    return { url: this.oauth.buildLinearOAuthUrl(user.id) };
  }

  @Get('notion/oauth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Notion OAuth URL' })
  startNotion(@CurrentUser() user: IUser) {
    return { url: this.oauth.buildNotionOAuthUrl(user.id) };
  }

  @Get('jira/oauth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Jira OAuth URL' })
  startJira(@CurrentUser() user: IUser) {
    return { url: this.oauth.buildJiraOAuthUrl(user.id) };
  }

  @Get('gitlab/oauth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get GitLab OAuth URL' })
  startGitlab(@CurrentUser() user: IUser) {
    return { url: this.oauth.buildGitlabOAuthUrl(user.id) };
  }

  @Get('bitbucket/oauth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Bitbucket OAuth URL' })
  startBitbucket(@CurrentUser() user: IUser) {
    return { url: this.oauth.buildBitbucketOAuthUrl(user.id) };
  }

  // ── OAuth callbacks (public — called by provider after user authorizes) ────

  @Get('discord/callback')
  async discordCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) return res.redirect(errorRedirect('discord', 'denied'));
    try {
      const userId = this.oauth.verifyState(state);
      const config = await this.oauth.exchangeDiscordCode(code);
      await this.store(userId, 'discord', config);
      return res.redirect(successRedirect('discord'));
    } catch (err) {
      this.logger.error('Discord callback failed', err);
      return res.redirect(errorRedirect('discord', 'failed'));
    }
  }

  @Get('slack/callback')
  async slackCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) return res.redirect(errorRedirect('slack', 'denied'));
    try {
      const userId = this.oauth.verifyState(state);
      const config = await this.oauth.exchangeSlackCode(code);
      await this.store(userId, 'slack', config);
      return res.redirect(successRedirect('slack'));
    } catch (err) {
      this.logger.error('Slack callback failed', err);
      return res.redirect(errorRedirect('slack', 'failed'));
    }
  }

  @Get('linear/callback')
  async linearCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) return res.redirect(errorRedirect('linear', 'denied'));
    try {
      const userId = this.oauth.verifyState(state);
      const config = await this.oauth.exchangeLinearCode(code);
      await this.store(userId, 'linear', config);
      return res.redirect(successRedirect('linear'));
    } catch (err) {
      this.logger.error('Linear callback failed', err);
      return res.redirect(errorRedirect('linear', 'failed'));
    }
  }

  @Get('notion/callback')
  async notionCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) return res.redirect(errorRedirect('notion', 'denied'));
    try {
      const userId = this.oauth.verifyState(state);
      const config = await this.oauth.exchangeNotionCode(code);
      await this.store(userId, 'notion', config);
      // Notion still needs a database_id — redirect with a configure flag
      return res.redirect(`${successRedirect('notion')}&configure=notion`);
    } catch (err) {
      this.logger.error('Notion callback failed', err);
      return res.redirect(errorRedirect('notion', 'failed'));
    }
  }

  @Get('jira/callback')
  async jiraCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) return res.redirect(errorRedirect('jira', 'denied'));
    try {
      const userId = this.oauth.verifyState(state);
      const config = await this.oauth.exchangeJiraCode(code);
      await this.store(userId, 'jira', config);
      // Jira still needs a project_key — redirect with a configure flag
      return res.redirect(`${successRedirect('jira')}&configure=jira`);
    } catch (err) {
      this.logger.error('Jira callback failed', err);
      return res.redirect(errorRedirect('jira', 'failed'));
    }
  }

  @Get('gitlab/callback')
  async gitlabCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) return res.redirect(errorRedirect('gitlab', 'denied'));
    try {
      const userId = this.oauth.verifyState(state);
      const config = await this.oauth.exchangeGitlabCode(code);
      await this.store(userId, 'gitlab', config);
      return res.redirect(successRedirect('gitlab'));
    } catch (err) {
      this.logger.error('GitLab callback failed', err);
      return res.redirect(errorRedirect('gitlab', 'failed'));
    }
  }

  @Get('bitbucket/callback')
  async bitbucketCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) return res.redirect(errorRedirect('bitbucket', 'denied'));
    try {
      const userId = this.oauth.verifyState(state);
      const config = await this.oauth.exchangeBitbucketCode(code);
      await this.store(userId, 'bitbucket', config);
      return res.redirect(successRedirect('bitbucket'));
    } catch (err) {
      this.logger.error('Bitbucket callback failed', err);
      return res.redirect(errorRedirect('bitbucket', 'failed'));
    }
  }

  // ── Helper ─────────────────────────────────────────────────────────────────

  private store(
    userId: string,
    provider: string,
    config: Record<string, string>,
  ) {
    return firstValueFrom(
      this.authClient.send('integration.connect', { userId, provider, config }),
    );
  }
}
