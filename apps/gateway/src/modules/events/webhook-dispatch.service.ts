import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES } from '../../common';

interface AgentJobEvent {
  jobId?: string;
  phase?: string;
  status?: string;
  repo?: string;
  issueTitle?: string;
  issueNumber?: number;
  prUrl?: string;
  message?: string;
}

interface StoredIntegration {
  provider: string;
  status: string;
  config: Record<string, string>;
}

@Injectable()
export class WebhookDispatchService {
  private readonly logger = new Logger(WebhookDispatchService.name);

  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
  ) {}

  async dispatch(userId: string, event: string, data: unknown): Promise<void> {
    if (!userId || event !== 'agent:job') return;
    const job = data as AgentJobEvent;
    if (job.status !== 'completed' && job.status !== 'failed') return;

    const integrations = await this.getUserIntegrations(userId);

    await Promise.allSettled(
      integrations
        .filter((i) => i.status === 'connected')
        .map((i) => this.dispatchOne(i, job)),
    );
  }

  async test(
    userId: string,
    provider: string,
  ): Promise<{ ok: boolean; error?: string }> {
    const integrations = await this.getUserIntegrations(userId);
    const integration = integrations.find((i) => i.provider === provider);
    if (!integration)
      return { ok: false, error: 'Integration not found or not connected' };
    if (integration.status !== 'connected')
      return { ok: false, error: 'Integration is disabled' };

    const testJob: AgentJobEvent = {
      jobId: 'test-job',
      status: 'completed',
      repo: 'example/repo',
      issueTitle: 'Test notification from CodeKang',
      issueNumber: 1,
    };

    try {
      await this.dispatchOne(integration, testJob, true);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  private async getUserIntegrations(
    userId: string,
  ): Promise<StoredIntegration[]> {
    return firstValueFrom<StoredIntegration[]>(
      this.authClient.send('integration.list', { userId }),
    ).catch((): StoredIntegration[] => []);
  }

  private dispatchOne(
    integration: StoredIntegration,
    job: AgentJobEvent,
    isTest = false,
  ): Promise<void> {
    switch (integration.provider) {
      case 'slack':
        if (integration.config.webhook_url) {
          return this.sendSlack(integration.config.webhook_url, job, isTest);
        }
        break;
      case 'discord':
        if (integration.config.webhook_url) {
          return this.sendDiscord(integration.config.webhook_url, job, isTest);
        }
        break;
      case 'linear':
        // supports both OAuth access_token and legacy api_key
        if (
          (integration.config.access_token || integration.config.api_key) &&
          integration.config.team_id
        ) {
          const key = integration.config.access_token
            ? `Bearer ${integration.config.access_token}`
            : integration.config.api_key;
          return this.sendLinear(key, integration.config.team_id, job, isTest);
        }
        break;
      case 'jira':
        // supports both OAuth (access_token + cloud_id) and legacy (domain + email + api_token)
        if (integration.config.access_token && integration.config.cloud_id) {
          return this.sendJiraOAuth(
            integration.config.access_token,
            integration.config.cloud_id,
            integration.config.project_key,
            job,
            isTest,
          );
        }
        if (
          integration.config.domain &&
          integration.config.email &&
          integration.config.api_token &&
          integration.config.project_key
        ) {
          return this.sendJira(integration.config, job, isTest);
        }
        break;
      case 'notion':
        // supports both OAuth access_token and legacy token
        if (
          (integration.config.access_token || integration.config.token) &&
          integration.config.database_id
        ) {
          const token =
            integration.config.access_token ?? integration.config.token;
          return this.sendNotion(
            token,
            integration.config.database_id,
            job,
            isTest,
          );
        }
        break;
      case 'vercel':
        if (
          integration.config.deploy_hook_url &&
          (job.status === 'completed' || isTest)
        ) {
          return this.triggerVercelDeploy(
            integration.config.deploy_hook_url,
            isTest,
          );
        }
        break;
    }
    return Promise.resolve();
  }

  private async sendSlack(
    url: string,
    job: AgentJobEvent,
    isTest = false,
  ): Promise<void> {
    const ok = job.status === 'completed';
    const title = job.issueTitle ?? `Issue #${job.issueNumber ?? '?'}`;
    const text = isTest
      ? "✅ *CodeKang* is connected to Slack! You'll receive notifications here when AI fixes complete."
      : ok
        ? `✅ CodeKang fixed *${title}* in \`${job.repo ?? 'unknown'}\`${job.prUrl ? ` — <${job.prUrl}|View PR>` : ''}`
        : `❌ CodeKang failed to fix *${title}* in \`${job.repo ?? 'unknown'}\``;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`Slack responded ${res.status}`);
    } catch (err) {
      this.logger.warn('Slack dispatch failed', {
        error: (err as Error).message,
      });
      if (isTest) throw err;
    }
  }

  private async sendDiscord(
    url: string,
    job: AgentJobEvent,
    isTest = false,
  ): Promise<void> {
    const ok = job.status === 'completed';
    const title = job.issueTitle ?? `Issue #${job.issueNumber ?? '?'}`;
    const content = isTest
      ? "✅ **CodeKang** is connected to Discord! You'll receive notifications here when AI fixes complete."
      : ok
        ? `✅ **CodeKang** fixed **${title}** in \`${job.repo ?? 'unknown'}\`${job.prUrl ? `\n🔗 ${job.prUrl}` : ''}`
        : `❌ **CodeKang** failed to fix **${title}** in \`${job.repo ?? 'unknown'}\``;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(`Discord responded ${res.status}`);
    } catch (err) {
      this.logger.warn('Discord dispatch failed', {
        error: (err as Error).message,
      });
      if (isTest) throw err;
    }
  }

  private async sendLinear(
    apiKey: string,
    teamId: string,
    job: AgentJobEvent,
    isTest = false,
  ): Promise<void> {
    const title = isTest
      ? '[CodeKang] Connection test — integration is working'
      : `[CodeKang] Fixed: ${job.issueTitle ?? `Issue #${job.issueNumber}`}`;
    const description = isTest
      ? 'This issue was created by CodeKang to verify your Linear integration.'
      : `CodeKang automatically fixed this issue in \`${job.repo ?? 'unknown'}\`.${job.prUrl ? `\n\nPR: ${job.prUrl}` : ''}`;

    const query = `
      mutation CreateIssue($teamId: String!, $title: String!, $description: String) {
        issueCreate(input: { teamId: $teamId, title: $title, description: $description }) {
          success
          issue { id url }
        }
      }
    `;

    try {
      const res = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiKey,
        },
        body: JSON.stringify({
          query,
          variables: { teamId, title, description },
        }),
      });
      if (!res.ok) throw new Error(`Linear responded ${res.status}`);
      const json = (await res.json()) as { errors?: { message: string }[] };
      if (json.errors?.length) throw new Error(json.errors[0].message);
    } catch (err) {
      this.logger.warn('Linear dispatch failed', {
        error: (err as Error).message,
      });
      if (isTest) throw err;
    }
  }

  private async sendJiraOAuth(
    accessToken: string,
    cloudId: string,
    projectKey: string,
    job: AgentJobEvent,
    isTest = false,
  ): Promise<void> {
    const summary = isTest
      ? '[CodeKang] Connection test — integration is working'
      : `[CodeKang] Fixed: ${job.issueTitle ?? `Issue #${job.issueNumber}`}`;
    const bodyText = isTest
      ? 'This ticket was created by CodeKang to verify your Jira integration.'
      : `CodeKang automatically fixed this issue in ${job.repo ?? 'unknown'}.${job.prUrl ? ` PR: ${job.prUrl}` : ''}`;

    try {
      const res = await fetch(
        `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            fields: {
              project: { key: projectKey },
              summary,
              description: {
                version: 1,
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: bodyText }],
                  },
                ],
              },
              issuetype: { name: 'Task' },
            },
          }),
        },
      );
      if (!res.ok) throw new Error(`Jira responded ${res.status}`);
    } catch (err) {
      this.logger.warn('Jira OAuth dispatch failed', {
        error: (err as Error).message,
      });
      if (isTest) throw err;
    }
  }

  private async sendJira(
    config: Record<string, string>,
    job: AgentJobEvent,
    isTest = false,
  ): Promise<void> {
    const { domain, email, api_token, project_key } = config;
    const base64 = Buffer.from(`${email}:${api_token}`).toString('base64');
    const summary = isTest
      ? '[CodeKang] Connection test — integration is working'
      : `[CodeKang] Fixed: ${job.issueTitle ?? `Issue #${job.issueNumber}`}`;
    const bodyText = isTest
      ? 'This ticket was created by CodeKang to verify your Jira integration.'
      : `CodeKang automatically fixed this issue in ${job.repo ?? 'unknown'}.${job.prUrl ? ` PR: ${job.prUrl}` : ''}`;

    try {
      const res = await fetch(`https://${domain}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64}`,
        },
        body: JSON.stringify({
          fields: {
            project: { key: project_key },
            summary,
            description: {
              version: 1,
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: bodyText }],
                },
              ],
            },
            issuetype: { name: 'Task' },
          },
        }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Jira responded ${res.status}: ${errBody}`);
      }
    } catch (err) {
      this.logger.warn('Jira dispatch failed', {
        error: (err as Error).message,
      });
      if (isTest) throw err;
    }
  }

  private async sendNotion(
    token: string,
    databaseId: string,
    job: AgentJobEvent,
    isTest = false,
  ): Promise<void> {
    const pageTitle = isTest
      ? 'CodeKang — Connection test'
      : `[CodeKang Fix] ${job.issueTitle ?? `Issue #${job.issueNumber}`}`;
    const bodyText = isTest
      ? 'This page was created by CodeKang to verify your Notion integration.'
      : `Repository: ${job.repo ?? 'unknown'}${job.prUrl ? `\nPR: ${job.prUrl}` : ''}\nStatus: ${job.status === 'completed' ? 'Fixed' : 'Failed'}`;

    try {
      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties: {
            title: { title: [{ text: { content: pageTitle } }] },
          },
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: { rich_text: [{ text: { content: bodyText } }] },
            },
          ],
        }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Notion responded ${res.status}: ${errBody}`);
      }
    } catch (err) {
      this.logger.warn('Notion dispatch failed', {
        error: (err as Error).message,
      });
      if (isTest) throw err;
    }
  }

  private async triggerVercelDeploy(
    deployHookUrl: string,
    isTest = false,
  ): Promise<void> {
    try {
      const res = await fetch(deployHookUrl, { method: 'POST' });
      if (!res.ok) throw new Error(`Vercel responded ${res.status}`);
    } catch (err) {
      this.logger.warn('Vercel deploy trigger failed', {
        error: (err as Error).message,
      });
      if (isTest) throw err;
    }
  }
}
