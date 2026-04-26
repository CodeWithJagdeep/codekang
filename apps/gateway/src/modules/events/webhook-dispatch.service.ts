import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES } from '../../common';

interface AgentJobData {
  status?: string;
  repo?: string;
  issueTitle?: string;
  issueNumber?: number;
  prUrl?: string;
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
    const job = data as AgentJobData;
    if (job.status !== 'completed' && job.status !== 'failed') return;

    const integrations = await firstValueFrom<StoredIntegration[]>(
      this.authClient.send('integration.list', { userId }),
    ).catch((): StoredIntegration[] => []);

    await Promise.allSettled(
      integrations
        .filter((i) => i.status === 'connected')
        .map((i) => this.dispatchOne(i, job)),
    );
  }

  private dispatchOne(integration: StoredIntegration, job: AgentJobData): Promise<void> {
    if (integration.provider === 'slack' && integration.config.webhook_url) {
      return this.sendSlack(integration.config.webhook_url, job);
    }
    if (integration.provider === 'discord' && integration.config.webhook_url) {
      return this.sendDiscord(integration.config.webhook_url, job);
    }
    return Promise.resolve();
  }

  private async sendSlack(url: string, job: AgentJobData): Promise<void> {
    const ok = job.status === 'completed';
    const title = job.issueTitle ?? `Issue #${job.issueNumber ?? '?'}`;
    const text = ok
      ? `✅ CodeKang fixed *${title}* in \`${job.repo ?? 'unknown'}\`${job.prUrl ? ` — <${job.prUrl}|View PR>` : ''}`
      : `❌ CodeKang failed to fix *${title}* in \`${job.repo ?? 'unknown'}\``;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
    } catch (err) {
      this.logger.warn('Slack dispatch failed', { error: (err as Error).message });
    }
  }

  private async sendDiscord(url: string, job: AgentJobData): Promise<void> {
    const ok = job.status === 'completed';
    const title = job.issueTitle ?? `Issue #${job.issueNumber ?? '?'}`;
    const content = ok
      ? `✅ **CodeKang** fixed **${title}** in \`${job.repo ?? 'unknown'}\`${job.prUrl ? `\n🔗 ${job.prUrl}` : ''}`
      : `❌ **CodeKang** failed to fix **${title}** in \`${job.repo ?? 'unknown'}\``;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
    } catch (err) {
      this.logger.warn('Discord dispatch failed', { error: (err as Error).message });
    }
  }
}
