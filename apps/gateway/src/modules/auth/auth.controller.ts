import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  UseGuards,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import {
  SERVICES,
  MESSAGE_PATTERNS,
  CurrentUser,
  JwtAuthGuard,
} from '../../common';
import type { IUser } from '../../common';

class SocialLoginDto {
  @ApiProperty({ enum: ['google', 'github'], description: 'OAuth provider' })
  @IsIn(['google', 'github'])
  provider: 'google' | 'github';

  @ApiProperty({
    description:
      'Google: credential.idToken from GoogleAuthProvider.credentialFromResult()  |  GitHub: credential.accessToken from GithubAuthProvider.credentialFromResult()',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

class LinkVcsDto {
  @ApiProperty({ enum: ['gitlab', 'bitbucket'] })
  @IsIn(['gitlab', 'bitbucket'])
  provider: 'gitlab' | 'bitbucket';

  @ApiProperty({ description: 'Personal access token or OAuth token for the VCS provider' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

class UpdatePlanDto {
  @ApiProperty({ enum: ['free', 'starter', 'pro', 'team', 'enterprise'] })
  @IsIn(['free', 'starter', 'pro', 'team', 'enterprise'])
  plan: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthProxyController {
  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@CurrentUser() user: IUser) {
    return user;
  }

  @Post('social')
  @ApiOperation({
    summary: 'Exchange a Google ID token or GitHub access token for a platform JWT',
    description:
      'Frontend: after Firebase popup, pass `GoogleAuthProvider.credentialFromResult(result).idToken` (Google) or `GithubAuthProvider.credentialFromResult(result).accessToken` (GitHub).',
  })
  socialLogin(@Body() dto: SocialLoginDto) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_FIREBASE_LOGIN, {
        provider: dto.provider,
        token: dto.token,
      }),
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  refresh(@Body() dto: RefreshDto) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_REFRESH_TOKEN, {
        refreshToken: dto.refreshToken,
      }),
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout(@CurrentUser() user: IUser) {
    await firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_LOGOUT, { userId: user.id }),
    );
  }

  @Post('onboarding/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark onboarding as completed' })
  completeOnboarding(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_COMPLETE_ONBOARDING, {
        userId: user.id,
      }),
    );
  }

  @Post('vcs/link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link a VCS provider (GitLab or Bitbucket) using a personal access token' })
  linkVcs(@CurrentUser() user: IUser, @Body() dto: LinkVcsDto) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_LINK_VCS, {
        userId: user.id,
        provider: dto.provider,
        token: dto.token,
      }),
    );
  }

  @Patch('plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the current user plan (onboarding plan selection)' })
  updatePlan(@CurrentUser() user: IUser, @Body() dto: UpdatePlanDto) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_UPDATE_PLAN, {
        userId: user.id,
        plan: dto.plan,
      }),
    );
  }
}
