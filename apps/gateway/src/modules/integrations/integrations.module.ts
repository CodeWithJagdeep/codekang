import { Module } from '@nestjs/common';
import { IntegrationsProxyController } from './integrations.controller';
import { OAuthIntegrationsController } from './oauth-integrations.controller';
import { IntegrationValidationService } from './integration-validation.service';
import { OAuthIntegrationsService } from './oauth-integrations.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [IntegrationsProxyController, OAuthIntegrationsController],
  providers: [IntegrationValidationService, OAuthIntegrationsService],
})
export class IntegrationsProxyModule {}
