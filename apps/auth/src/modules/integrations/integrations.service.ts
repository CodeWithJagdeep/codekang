import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { UserIntegration } from '../../entities/user-integration.entity';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(UserIntegration)
    private readonly repo: Repository<UserIntegration>,
  ) {}

  list(userId: string) {
    return this.repo.find({ where: { userId }, order: { connectedAt: 'DESC' } });
  }

  async connect(
    userId: string,
    provider: string,
    config: Record<string, unknown>,
  ) {
    const existing = await this.repo.findOne({ where: { userId, provider } });
    if (existing) {
      existing.status = 'connected';
      existing.config = { ...existing.config, ...config };
      return this.repo.save(existing);
    }
    return this.repo.save(
      this.repo.create({ userId, provider, status: 'connected', accessToken: null, config }),
    );
  }

  async disconnect(userId: string, provider: string) {
    const integration = await this.repo.findOne({ where: { userId, provider } });
    if (!integration) throw new RpcException({ message: 'Integration not found', statusCode: 404 });
    await this.repo.remove(integration);
    return { success: true };
  }

  async updateStatus(userId: string, provider: string, status: string) {
    const integration = await this.repo.findOne({ where: { userId, provider } });
    if (!integration) throw new RpcException({ message: 'Integration not found', statusCode: 404 });
    integration.status = status;
    return this.repo.save(integration);
  }

  async updateConfig(userId: string, provider: string, config: Record<string, unknown>) {
    const integration = await this.repo.findOne({ where: { userId, provider } });
    if (!integration) throw new RpcException({ message: 'Integration not found', statusCode: 404 });
    integration.config = { ...integration.config, ...config };
    return this.repo.save(integration);
  }
}
