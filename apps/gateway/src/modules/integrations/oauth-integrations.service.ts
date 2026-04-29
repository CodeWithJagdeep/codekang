import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';

const GATEWAY = () => process.env.GATEWAY_URL ?? 'http://localhost:3000';
const CALLBACK = (provider: string) => `${GATEWAY()}/api/v1/integrations/${provider}/callback`;

@Injectable()
export class OAuthIntegrationsService {
  // ── State signing ──────────────────────────────────────────────────────────

  signState(userId: string): string {
    const secret = process.env.INTERNAL_SECRET ?? 'dev-secret';
    const hmac = createHmac('sha256', secret).update(userId).digest('hex').slice(0, 16);
    return Buffer.from(`${userId}.${hmac}`).toString('base64url');
  }

  verifyState(state: string): string {
    try {
      const decoded = Buffer.from(state, 'base64url').toString();
      const [userId, hmac] = decoded.split('.');
      if (!userId || !hmac) throw new Error();
      const secret = process.env.INTERNAL_SECRET ?? 'dev-secret';
      const expected = createHmac('sha256', secret).update(userId).digest('hex').slice(0, 16);
      if (hmac !== expected) throw new UnauthorizedException('Invalid OAuth state');
      return userId;
    } catch {
      throw new UnauthorizedException('Invalid OAuth state');
    }
  }

  // ── Discord ────────────────────────────────────────────────────────────────

  buildDiscordOAuthUrl(userId: string): string {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) throw new BadRequestException('Discord OAuth is not configured — set DISCORD_CLIENT_ID');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: CALLBACK('discord'),
      response_type: 'code',
      scope: 'webhook.incoming',
      state: this.signState(userId),
    });
    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  async exchangeDiscordCode(code: string): Promise<Record<string, string>> {
    const res = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: CALLBACK('discord'),
      }),
    });
    if (!res.ok) throw new BadRequestException(`Discord token exchange failed: ${res.status}`);
    const data = (await res.json()) as { webhook?: { url: string; channel_id: string; guild_id: string; name: string } };
    if (!data.webhook?.url) throw new BadRequestException('Discord did not return a webhook URL');
    return { webhook_url: data.webhook.url, channel_id: data.webhook.channel_id, guild_id: data.webhook.guild_id };
  }

  // ── Slack ──────────────────────────────────────────────────────────────────

  buildSlackOAuthUrl(userId: string): string {
    const clientId = process.env.SLACK_CLIENT_ID;
    if (!clientId) throw new BadRequestException('Slack OAuth is not configured — set SLACK_CLIENT_ID');
    const params = new URLSearchParams({
      client_id: clientId,
      user_scope: 'incoming-webhook',
      redirect_uri: CALLBACK('slack'),
      state: this.signState(userId),
    });
    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  async exchangeSlackCode(code: string): Promise<Record<string, string>> {
    const res = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: CALLBACK('slack'),
      }),
    });
    if (!res.ok) throw new BadRequestException(`Slack token exchange failed: ${res.status}`);
    const data = (await res.json()) as {
      ok: boolean;
      incoming_webhook?: { url: string; channel: string; channel_id: string };
      error?: string;
    };
    if (!data.ok) throw new BadRequestException(`Slack error: ${data.error ?? 'unknown'}`);
    if (!data.incoming_webhook?.url) throw new BadRequestException('Slack did not return a webhook URL');
    return { webhook_url: data.incoming_webhook.url, channel: data.incoming_webhook.channel };
  }

  // ── Linear ─────────────────────────────────────────────────────────────────

  buildLinearOAuthUrl(userId: string): string {
    const clientId = process.env.LINEAR_CLIENT_ID;
    if (!clientId) throw new BadRequestException('Linear OAuth is not configured — set LINEAR_CLIENT_ID');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: CALLBACK('linear'),
      response_type: 'code',
      scope: 'read,write',
      state: this.signState(userId),
    });
    return `https://linear.app/oauth/authorize?${params.toString()}`;
  }

  async exchangeLinearCode(code: string): Promise<Record<string, string>> {
    const res = await fetch('https://api.linear.app/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.LINEAR_CLIENT_ID!,
        client_secret: process.env.LINEAR_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: CALLBACK('linear'),
      }),
    });
    if (!res.ok) throw new BadRequestException(`Linear token exchange failed: ${res.status}`);
    const token = (await res.json()) as { access_token: string };
    if (!token.access_token) throw new BadRequestException('Linear did not return an access token');

    // Fetch the user's first team automatically
    const teamsRes = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.access_token}` },
      body: JSON.stringify({ query: '{ teams { nodes { id name } } }' }),
    });
    const teamsData = (await teamsRes.json()) as { data?: { teams?: { nodes: { id: string; name: string }[] } } };
    const firstTeam = teamsData.data?.teams?.nodes?.[0];

    return {
      access_token: token.access_token,
      team_id: firstTeam?.id ?? '',
      team_name: firstTeam?.name ?? '',
    };
  }

  // ── Notion ─────────────────────────────────────────────────────────────────

  buildNotionOAuthUrl(userId: string): string {
    const clientId = process.env.NOTION_CLIENT_ID;
    if (!clientId) throw new BadRequestException('Notion OAuth is not configured — set NOTION_CLIENT_ID');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: CALLBACK('notion'),
      response_type: 'code',
      owner: 'user',
      state: this.signState(userId),
    });
    return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
  }

  async exchangeNotionCode(code: string): Promise<Record<string, string>> {
    const clientId = process.env.NOTION_CLIENT_ID!;
    const clientSecret = process.env.NOTION_CLIENT_SECRET!;
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basic}`,
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: CALLBACK('notion'),
      }),
    });
    if (!res.ok) throw new BadRequestException(`Notion token exchange failed: ${res.status}`);
    const data = (await res.json()) as {
      access_token: string;
      workspace_id: string;
      workspace_name: string;
      bot_id: string;
    };
    if (!data.access_token) throw new BadRequestException('Notion did not return an access token');
    return {
      access_token: data.access_token,
      workspace_id: data.workspace_id,
      workspace_name: data.workspace_name ?? '',
    };
  }

  // ── Jira (Atlassian) ───────────────────────────────────────────────────────

  buildJiraOAuthUrl(userId: string): string {
    const clientId = process.env.JIRA_CLIENT_ID;
    if (!clientId) throw new BadRequestException('Jira OAuth is not configured — set JIRA_CLIENT_ID');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: CALLBACK('jira'),
      response_type: 'code',
      scope: 'read:jira-work write:jira-work offline_access',
      state: this.signState(userId),
      prompt: 'consent',
      audience: 'api.atlassian.com',
    });
    return `https://auth.atlassian.com/authorize?${params.toString()}`;
  }

  async exchangeJiraCode(code: string): Promise<Record<string, string>> {
    const res = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.JIRA_CLIENT_ID!,
        client_secret: process.env.JIRA_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: CALLBACK('jira'),
      }),
    });
    if (!res.ok) throw new BadRequestException(`Jira token exchange failed: ${res.status}`);
    const token = (await res.json()) as { access_token: string; refresh_token: string };
    if (!token.access_token) throw new BadRequestException('Jira did not return an access token');

    // Get the accessible Jira cloud instances
    const sitesRes = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: { Authorization: `Bearer ${token.access_token}`, Accept: 'application/json' },
    });
    const sites = (await sitesRes.json()) as { id: string; name: string; url: string }[];
    const firstSite = sites?.[0];

    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token ?? '',
      cloud_id: firstSite?.id ?? '',
      site_name: firstSite?.name ?? '',
      site_url: firstSite?.url ?? '',
    };
  }

  // ── GitLab ─────────────────────────────────────────────────────────────────

  buildGitlabOAuthUrl(userId: string): string {
    const clientId = process.env.GITLAB_CLIENT_ID;
    if (!clientId) throw new BadRequestException('GitLab OAuth is not configured — set GITLAB_CLIENT_ID');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: CALLBACK('gitlab'),
      response_type: 'code',
      scope: 'api read_repository write_repository',
      state: this.signState(userId),
    });
    return `https://gitlab.com/oauth/authorize?${params.toString()}`;
  }

  async exchangeGitlabCode(code: string): Promise<Record<string, string>> {
    const res = await fetch('https://gitlab.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITLAB_CLIENT_ID!,
        client_secret: process.env.GITLAB_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: CALLBACK('gitlab'),
      }),
    });
    if (!res.ok) throw new BadRequestException(`GitLab token exchange failed: ${res.status}`);
    const token = (await res.json()) as { access_token: string; refresh_token: string };
    if (!token.access_token) throw new BadRequestException('GitLab did not return an access token');

    const userRes = await fetch('https://gitlab.com/api/v4/user', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const user = (await userRes.json()) as { username: string; name: string };

    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token ?? '',
      instance_url: 'https://gitlab.com',
      username: user.username ?? '',
    };
  }

  // ── Bitbucket ──────────────────────────────────────────────────────────────

  buildBitbucketOAuthUrl(userId: string): string {
    const clientId = process.env.BITBUCKET_CLIENT_ID;
    if (!clientId) throw new BadRequestException('Bitbucket OAuth is not configured — set BITBUCKET_CLIENT_ID');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: CALLBACK('bitbucket'),
      response_type: 'code',
      scope: 'repository:read repository:write pullrequest:read pullrequest:write',
      state: this.signState(userId),
    });
    return `https://bitbucket.org/site/oauth2/authorize?${params.toString()}`;
  }

  async exchangeBitbucketCode(code: string): Promise<Record<string, string>> {
    const clientId = process.env.BITBUCKET_CLIENT_ID!;
    const clientSecret = process.env.BITBUCKET_CLIENT_SECRET!;
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch('https://bitbucket.org/site/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({ grant_type: 'authorization_code', code }),
    });
    if (!res.ok) throw new BadRequestException(`Bitbucket token exchange failed: ${res.status}`);
    const token = (await res.json()) as { access_token: string; refresh_token: string };
    if (!token.access_token) throw new BadRequestException('Bitbucket did not return an access token');

    const userRes = await fetch('https://api.bitbucket.org/2.0/user', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const user = (await userRes.json()) as { username: string; display_name: string };

    // Get first workspace
    const wsRes = await fetch('https://api.bitbucket.org/2.0/workspaces?pagelen=1', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const wsData = (await wsRes.json()) as { values?: { slug: string; name: string }[] };
    const firstWs = wsData.values?.[0];

    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token ?? '',
      username: user.username ?? '',
      workspace: firstWs?.slug ?? '',
      workspace_name: firstWs?.name ?? '',
    };
  }
}
