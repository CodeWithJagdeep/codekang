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
  Logger,
  Ip,
  Headers,
  Delete,
  Param,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
} from '@nestjs/swagger';
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
  @ApiProperty({ enum: ['github', 'gitlab', 'bitbucket'] })
  @IsIn(['github', 'gitlab', 'bitbucket'])
  provider: 'github' | 'gitlab' | 'bitbucket';

  @ApiProperty({
    description: 'Personal access token or OAuth token for the VCS provider',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

class UpdatePlanDto {
  @ApiProperty({ enum: ['free', 'starter', 'pro', 'team', 'enterprise'] })
  @IsIn(['free', 'starter', 'pro', 'team', 'enterprise'])
  plan: string;
}

class SendOtpDto {
  @ApiProperty({ description: 'Email address to send OTP to' })
  @IsString()
  @IsNotEmpty()
  email: string;
}

class VerifyOtpDto {
  @ApiProperty({ description: 'Email address tied to the OTP' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The 6-digit verification code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

class GithubExchangeDto {
  @ApiProperty({ description: 'The OAuth code from GitHub' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'The redirect URI used in the authorization request' })
  @IsString()
  @IsNotEmpty()
  redirectUri: string;
}

class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  organizationName?: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthProxyController {
  private readonly logger = new Logger(AuthProxyController.name);

  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
    @Inject(SERVICES.REPOS) private readonly reposClient: ClientProxy,
    @Inject(SERVICES.AI_AGENT) private readonly agentClient: ClientProxy,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@CurrentUser() user: IUser) {
    this.logger.log(`getMe userId=${user.id}`);
    return user;
  }

  @Post('social')
  @ApiOperation({
    summary:
      'Exchange a Google ID token or GitHub access token for a platform JWT',
    description:
      'Frontend: after Firebase popup, pass `GoogleAuthProvider.credentialFromResult(result).idToken` (Google) or `GithubAuthProvider.credentialFromResult(result).accessToken` (GitHub).',
  })
  async socialLogin(
    @Body() dto: SocialLoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    this.logger.log(`socialLogin provider=${dto.provider}`);
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_FIREBASE_LOGIN, {
          provider: dto.provider,
          token: dto.token,
          ip,
          userAgent,
        }),
      );
      this.logger.log(`socialLogin success provider=${dto.provider}`);
      return result;
    } catch (err) {
      this.logger.error(`socialLogin failed provider=${dto.provider}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @Post('otp/send')
  @ApiOperation({ summary: 'Send a 6-digit OTP code to the provided email' })
  async sendOtp(@Body() dto: SendOtpDto) {
    this.logger.log(`sendOtp email=${dto.email}`);
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_SEND_OTP, {
          email: dto.email,
        }),
      );
      this.logger.log(`sendOtp success email=${dto.email}`);
      return result;
    } catch (err) {
      this.logger.error(`sendOtp failed email=${dto.email}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP code and authenticate user' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    this.logger.log(`verifyOtp email=${dto.email}`);
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_VERIFY_OTP, {
          email: dto.email,
          code: dto.code,
          ip,
          userAgent,
        }),
      );
      this.logger.log(`verifyOtp success email=${dto.email}`);
      return result;
    } catch (err) {
      this.logger.error(`verifyOtp failed email=${dto.email}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @Post('github/exchange')
  @ApiOperation({
    summary: 'Exchange a GitHub OAuth code for a GitHub access token',
  })
  async exchangeGithubCode(@Body() dto: GithubExchangeDto) {
    this.logger.log('exchangeGithubCode');
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_GITHUB_EXCHANGE, {
          code: dto.code,
          redirectUri: dto.redirectUri,
        }),
      );
      this.logger.log('exchangeGithubCode success');
      return result;
    } catch (err) {
      this.logger.error('exchangeGithubCode failed', err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body() dto: RefreshDto) {
    this.logger.log('refresh token request');
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_REFRESH_TOKEN, {
          refreshToken: dto.refreshToken,
        }),
      );
      this.logger.log('refresh token success');
      return result;
    } catch (err) {
      this.logger.error('refresh token failed', err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout(@CurrentUser() user: IUser) {
    this.logger.log(`logout userId=${user.id}`);
    try {
      await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_LOGOUT, { userId: user.id }),
      );
      this.logger.log(`logout success userId=${user.id}`);
    } catch (err) {
      this.logger.error(`logout failed userId=${user.id}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @Post('onboarding/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark onboarding as completed' })
  async completeOnboarding(@CurrentUser() user: IUser) {
    this.logger.log(`completeOnboarding userId=${user.id}`);
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_COMPLETE_ONBOARDING, {
          userId: user.id,
        }),
      );
      this.logger.log(`completeOnboarding success userId=${user.id}`);
      return result;
    } catch (err) {
      this.logger.error(`completeOnboarding failed userId=${user.id}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @Post('vcs/link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Link a VCS provider (GitLab or Bitbucket) using a personal access token',
  })
  async linkVcs(@CurrentUser() user: IUser, @Body() dto: LinkVcsDto) {
    this.logger.log(`linkVcs userId=${user.id} provider=${dto.provider}`);
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_LINK_VCS, {
          userId: user.id,
          provider: dto.provider,
          token: dto.token,
        }),
      );
      this.logger.log(`linkVcs success userId=${user.id} provider=${dto.provider}`);
      return result;
    } catch (err) {
      this.logger.error(`linkVcs failed userId=${user.id} provider=${dto.provider}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @Patch('plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update the current user plan (onboarding plan selection)',
  })
  async updatePlan(@CurrentUser() user: IUser, @Body() dto: UpdatePlanDto) {
    this.logger.log(`updatePlan userId=${user.id} plan=${dto.plan}`);
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_UPDATE_PLAN, {
          userId: user.id,
          plan: dto.plan,
        }),
      );
      this.logger.log(`updatePlan success userId=${user.id} plan=${dto.plan}`);
      return result;
    } catch (err) {
      this.logger.error(`updatePlan failed userId=${user.id} plan=${dto.plan}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active user sessions' })
  async getSessions(@CurrentUser() user: IUser) {
    this.logger.log(`getSessions userId=${user.id}`);
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_GET_SESSIONS, {
          userId: user.id,
        }),
      );
      return result;
    } catch (err) {
      this.logger.error(`getSessions failed userId=${user.id}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a user session' })
  async revokeSession(@CurrentUser() user: IUser, @Param('id') sessionId: string) {
    this.logger.log(`revokeSession userId=${user.id} sessionId=${sessionId}`);
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_REVOKE_SESSION, {
          userId: user.id,
          sessionId,
        }),
      );
      return result;
    } catch (err) {
      this.logger.error(`revokeSession failed userId=${user.id}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@CurrentUser() user: IUser, @Body() dto: UpdateProfileDto) {
    this.logger.log(`updateProfile userId=${user.id}`);
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_UPDATE_PROFILE, {
          userId: user.id,
          ...dto,
        }),
      );
      return result;
    } catch (err) {
      this.logger.error(`updateProfile failed userId=${user.id}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @Post('account/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate the authenticated user account' })
  async archiveAccount(@CurrentUser() user: IUser) {
    this.logger.log(`archiveAccount userId=${user.id}`);
    await firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_ARCHIVE_ACCOUNT, { userId: user.id }),
    );
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete the authenticated user account and all data' })
  async deleteAccount(@CurrentUser() user: IUser) {
    this.logger.log(`deleteAccount userId=${user.id}`);
    // Run repos + AI agent cleanup in parallel, then delete the auth record last
    await Promise.all([
      firstValueFrom(
        this.reposClient.send(MESSAGE_PATTERNS.REPOS_DELETE_USER_DATA, { userId: user.id }),
      ),
      firstValueFrom(
        this.agentClient.send(MESSAGE_PATTERNS.AGENT_DELETE_USER_DATA, { userId: user.id }),
      ),
    ]);
    await firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_DELETE_ACCOUNT, { userId: user.id }),
    );
  }
}
