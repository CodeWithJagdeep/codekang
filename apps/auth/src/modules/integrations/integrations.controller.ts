import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IntegrationsService } from './integrations.service';

@Controller()
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @MessagePattern('integration.list')
  list(@Payload() data: { userId: string }) {
    return this.service.list(data.userId);
  }

  @MessagePattern('integration.connect')
  connect(
    @Payload()
    data: {
      userId: string;
      provider: string;
      config?: Record<string, unknown>;
    },
  ) {
    return this.service.connect(data.userId, data.provider, data.config ?? {});
  }

  @MessagePattern('integration.disconnect')
  disconnect(@Payload() data: { userId: string; provider: string }) {
    return this.service.disconnect(data.userId, data.provider);
  }

  @MessagePattern('integration.update_status')
  updateStatus(
    @Payload() data: { userId: string; provider: string; status: string },
  ) {
    return this.service.updateStatus(data.userId, data.provider, data.status);
  }

  @MessagePattern('integration.update_config')
  updateConfig(
    @Payload()
    data: {
      userId: string;
      provider: string;
      config: Record<string, unknown>;
    },
  ) {
    return this.service.updateConfig(data.userId, data.provider, data.config);
  }
}
