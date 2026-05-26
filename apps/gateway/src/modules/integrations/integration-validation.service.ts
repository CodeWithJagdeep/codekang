import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class IntegrationValidationService {
  async validate(
    provider: string,
    config: Record<string, string>,
  ): Promise<void> {
    switch (provider) {
      case 'slack':
        return this.validateSlack(config);
      case 'discord':
        return this.validateDiscord(config);
      case 'linear':
        return this.validateLinear(config);
      case 'jira':
        return this.validateJira(config);
      case 'notion':
        return this.validateNotion(config);
      case 'gitlab':
        return this.validateGitlab(config);
      case 'bitbucket':
        return this.validateBitbucket(config);
      case 'vercel':
        return this.validateVercel(config);
      case 'sentry':
        return this.validateSentry(config);
      case 'github':
        return; // managed via OAuth — no manual validation needed
    }
  }

  private async validateSlack(config: Record<string, string>): Promise<void> {
    const { webhook_url } = config;
    if (!webhook_url)
      throw new BadRequestException('Slack webhook URL is required');
    if (!webhook_url.startsWith('https://hooks.slack.com/')) {
      throw new BadRequestException(
        'Invalid Slack webhook URL — must start with https://hooks.slack.com/',
      );
    }
    let res: Response;
    try {
      res = await fetch(webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "✅ *CodeKang* connected! You'll receive AI fix notifications here.",
        }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new BadRequestException(
        'Could not reach Slack — check the webhook URL',
      );
    }
    if (!res.ok) {
      throw new BadRequestException(
        'Slack rejected the webhook URL — it may be expired or invalid',
      );
    }
  }

  private async validateDiscord(config: Record<string, string>): Promise<void> {
    const { webhook_url } = config;
    if (!webhook_url)
      throw new BadRequestException('Discord webhook URL is required');
    if (!webhook_url.startsWith('https://discord.com/api/webhooks/')) {
      throw new BadRequestException(
        'Invalid Discord webhook URL — must start with https://discord.com/api/webhooks/',
      );
    }
    let res: Response;
    try {
      res = await fetch(webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content:
            "✅ **CodeKang** connected! You'll receive AI fix notifications here.",
        }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new BadRequestException(
        'Could not reach Discord — check the webhook URL',
      );
    }
    // Discord returns 204 No Content on success
    if (!res.ok && res.status !== 204) {
      throw new BadRequestException(
        'Discord rejected the webhook URL — it may be deleted or invalid',
      );
    }
  }

  private async validateLinear(config: Record<string, string>): Promise<void> {
    const { api_key, team_id } = config;
    if (!api_key) throw new BadRequestException('Linear API key is required');
    if (!team_id) throw new BadRequestException('Linear team ID is required');

    let res: Response;
    try {
      res = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: api_key },
        body: JSON.stringify({
          query: `{ team(id: "${team_id}") { id name } }`,
        }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new BadRequestException('Could not reach Linear API');
    }
    if (res.status === 401)
      throw new BadRequestException('Invalid Linear API key');
    if (!res.ok)
      throw new BadRequestException(`Linear responded ${res.status}`);

    const json = (await res.json()) as {
      errors?: { message: string }[];
      data?: { team?: { id: string; name: string } };
    };
    if (json.errors?.length)
      throw new BadRequestException(`Linear: ${json.errors[0].message}`);
    if (!json.data?.team)
      throw new BadRequestException(
        'Linear team not found — check the team ID',
      );
  }

  private async validateJira(config: Record<string, string>): Promise<void> {
    const { domain, email, api_token, project_key } = config;
    if (!domain) throw new BadRequestException('Jira domain is required');
    if (!email) throw new BadRequestException('Jira account email is required');
    if (!api_token) throw new BadRequestException('Jira API token is required');
    if (!project_key)
      throw new BadRequestException('Jira project key is required');

    const base64 = Buffer.from(`${email}:${api_token}`).toString('base64');
    let res: Response;
    try {
      res = await fetch(`https://${domain}/rest/api/3/project/${project_key}`, {
        headers: {
          Authorization: `Basic ${base64}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new BadRequestException(`Could not reach Jira at ${domain}`);
    }
    if (res.status === 401)
      throw new BadRequestException(
        'Invalid Jira credentials — check email and API token',
      );
    if (res.status === 404)
      throw new BadRequestException(`Jira project "${project_key}" not found`);
    if (res.status === 403)
      throw new BadRequestException(
        'Jira access denied — check your permissions for this project',
      );
    if (!res.ok) throw new BadRequestException(`Jira responded ${res.status}`);
  }

  private async validateNotion(config: Record<string, string>): Promise<void> {
    const { token, database_id } = config;
    if (!token)
      throw new BadRequestException('Notion integration token is required');
    if (!database_id)
      throw new BadRequestException('Notion database ID is required');

    let res: Response;
    try {
      res = await fetch(`https://api.notion.com/v1/databases/${database_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
        },
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new BadRequestException('Could not reach Notion API');
    }
    if (res.status === 401)
      throw new BadRequestException('Invalid Notion integration token');
    if (res.status === 404) {
      throw new BadRequestException(
        'Notion database not found — check the database ID and make sure your integration has access to it',
      );
    }
    if (!res.ok)
      throw new BadRequestException(`Notion responded ${res.status}`);
  }

  private async validateGitlab(config: Record<string, string>): Promise<void> {
    const { access_token, instance_url } = config;
    if (!access_token)
      throw new BadRequestException('GitLab access token is required');

    const base = (instance_url || 'https://gitlab.com').replace(/\/$/, '');
    let res: Response;
    try {
      res = await fetch(`${base}/api/v4/user`, {
        headers: { 'PRIVATE-TOKEN': access_token },
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new BadRequestException(`Could not reach GitLab at ${base}`);
    }
    if (res.status === 401)
      throw new BadRequestException('Invalid GitLab access token');
    if (!res.ok)
      throw new BadRequestException(`GitLab responded ${res.status}`);
  }

  private async validateBitbucket(
    config: Record<string, string>,
  ): Promise<void> {
    const { username, app_password, workspace } = config;
    if (!username)
      throw new BadRequestException('Bitbucket username is required');
    if (!app_password)
      throw new BadRequestException('Bitbucket app password is required');
    if (!workspace)
      throw new BadRequestException('Bitbucket workspace slug is required');

    const base64 = Buffer.from(`${username}:${app_password}`).toString(
      'base64',
    );
    let res: Response;
    try {
      res = await fetch(
        `https://api.bitbucket.org/2.0/workspaces/${workspace}`,
        {
          headers: { Authorization: `Basic ${base64}` },
          signal: AbortSignal.timeout(5000),
        },
      );
    } catch {
      throw new BadRequestException('Could not reach Bitbucket API');
    }
    if (res.status === 401)
      throw new BadRequestException('Invalid Bitbucket credentials');
    if (res.status === 404)
      throw new BadRequestException(
        `Bitbucket workspace "${workspace}" not found`,
      );
    if (!res.ok)
      throw new BadRequestException(`Bitbucket responded ${res.status}`);
  }

  private async validateVercel(config: Record<string, string>): Promise<void> {
    const { deploy_hook_url } = config;
    if (!deploy_hook_url)
      throw new BadRequestException('Vercel deploy hook URL is required');
    if (
      !deploy_hook_url.startsWith(
        'https://api.vercel.com/v1/integrations/deploy/',
      )
    ) {
      throw new BadRequestException('Invalid Vercel deploy hook URL format');
    }
    // Can't validate without triggering a real deploy — just format-check
  }

  private async validateSentry(config: Record<string, string>): Promise<void> {
    const { dsn } = config;
    if (!dsn) throw new BadRequestException('Sentry DSN is required');
    try {
      const url = new URL(dsn);
      if (
        !url.hostname.includes('sentry.io') &&
        !url.hostname.includes('ingest.sentry.io')
      ) {
        throw new BadRequestException(
          'Invalid Sentry DSN — must be a sentry.io URL',
        );
      }
    } catch {
      throw new BadRequestException('Invalid Sentry DSN format');
    }
  }
}
