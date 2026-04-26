import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsIn,
} from 'class-validator';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGE_PATTERNS, CurrentUser, JwtAuthGuard } from '../../common';
import type { IUser } from '../../common';

class ConnectIntegrationDto {
  @IsObject()
  @IsOptional()
  config?: Record<string, string>;
}

class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['connected', 'disabled'])
  status: string;
}

class UpdateConfigDto {
  @IsObject()
  config: Record<string, string>;
}

@ApiTags('integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IntegrationsProxyController {
  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all integrations for the authenticated user' })
  list(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.INTEGRATION_LIST, { userId: user.id }),
    );
  }

  @Post(':provider')
  @ApiOperation({ summary: 'Connect an integration' })
  connect(
    @CurrentUser() user: IUser,
    @Param('provider') provider: string,
    @Body() body: ConnectIntegrationDto,
  ) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.INTEGRATION_CONNECT, {
        userId: user.id,
        provider,
        config: body.config ?? {},
      }),
    );
  }

  @Delete(':provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect an integration' })
  disconnect(
    @CurrentUser() user: IUser,
    @Param('provider') provider: string,
  ) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.INTEGRATION_DISCONNECT, {
        userId: user.id,
        provider,
      }),
    );
  }

  @Patch(':provider/status')
  @ApiOperation({ summary: 'Enable or disable an integration' })
  updateStatus(
    @CurrentUser() user: IUser,
    @Param('provider') provider: string,
    @Body() body: UpdateStatusDto,
  ) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.INTEGRATION_UPDATE_STATUS, {
        userId: user.id,
        provider,
        status: body.status,
      }),
    );
  }

  @Patch(':provider/config')
  @ApiOperation({ summary: 'Update integration configuration' })
  updateConfig(
    @CurrentUser() user: IUser,
    @Param('provider') provider: string,
    @Body() body: UpdateConfigDto,
  ) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.INTEGRATION_UPDATE_CONFIG, {
        userId: user.id,
        provider,
        config: body.config,
      }),
    );
  }
}
