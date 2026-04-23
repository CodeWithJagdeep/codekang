import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { MESSAGE_PATTERNS } from '../common';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern(MESSAGE_PATTERNS.AUTH_VALIDATE_TOKEN)
  async validateToken(@Payload() data: { token: string }) {
    this.logger.log('validateToken');
    try {
      const result = await this.authService.validateToken(data.token);
      this.logger.log(`validateToken success userId=${result.id}`);
      return result;
    } catch (err) {
      this.logger.error('validateToken failed', err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_GET_USER)
  async getUser(@Payload() data: { userId: string }) {
    this.logger.log(`getUser userId=${data.userId}`);
    try {
      const result = await this.authService.getUser(data.userId);
      this.logger.log(`getUser success userId=${data.userId}`);
      return result;
    } catch (err) {
      this.logger.error(`getUser failed userId=${data.userId}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_LOGOUT)
  async logout(@Payload() data: { userId: string }) {
    this.logger.log(`logout userId=${data.userId}`);
    try {
      await this.authService.logout(data.userId);
      this.logger.log(`logout success userId=${data.userId}`);
      return { success: true };
    } catch (err) {
      this.logger.error(`logout failed userId=${data.userId}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_REFRESH_TOKEN)
  async refreshToken(@Payload() data: { refreshToken: string }) {
    this.logger.log('refreshToken');
    try {
      const result = await this.authService.refreshTokens(data.refreshToken);
      this.logger.log('refreshToken success');
      return result;
    } catch (err) {
      this.logger.error('refreshToken failed', err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_GET_SUBSCRIPTION)
  async getSubscription(@Payload() data: { userId: string }) {
    this.logger.log(`getSubscription userId=${data.userId}`);
    try {
      const result = await this.authService.getSubscription(data.userId);
      this.logger.log(`getSubscription success userId=${data.userId}`);
      return result;
    } catch (err) {
      this.logger.error(`getSubscription failed userId=${data.userId}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_CHECK_CREDITS)
  async checkCredits(@Payload() data: { userId: string; cost: number }) {
    this.logger.log(`checkCredits userId=${data.userId} cost=${data.cost}`);
    try {
      const result = await this.authService.checkCredits(data.userId, data.cost);
      this.logger.log(`checkCredits result userId=${data.userId} allowed=${result.allowed}`);
      return result;
    } catch (err) {
      this.logger.error(`checkCredits failed userId=${data.userId}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_CONSUME_CREDITS)
  async consumeCredits(@Payload() data: { userId: string; cost: number }) {
    this.logger.log(`consumeCredits userId=${data.userId} cost=${data.cost}`);
    try {
      await this.authService.consumeCredits(data.userId, data.cost);
      this.logger.log(`consumeCredits success userId=${data.userId}`);
      return { success: true };
    } catch (err) {
      this.logger.error(`consumeCredits failed userId=${data.userId}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern('auth.get_github_token')
  async getGithubToken(@Payload() data: { userId: string }) {
    this.logger.log(`getGithubToken userId=${data.userId}`);
    try {
      const result = await this.authService.getGithubToken(data.userId);
      this.logger.log(`getGithubToken success userId=${data.userId} hasToken=${result !== null}`);
      return result;
    } catch (err) {
      this.logger.error(`getGithubToken failed userId=${data.userId}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_FIREBASE_LOGIN)
  async socialLogin(
    @Payload() data: { provider: 'google' | 'github'; token: string },
  ) {
    this.logger.log(`socialLogin provider=${data.provider}`);
    try {
      const result = await this.authService.socialLogin(data.provider, data.token);
      this.logger.log(`socialLogin success provider=${data.provider} userId=${result.user.id} isNewUser=${result.isNewUser}`);
      return result;
    } catch (err) {
      this.logger.error(`socialLogin failed provider=${data.provider}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_GITHUB_EXCHANGE)
  async exchangeGithubCode(@Payload() data: { code: string; redirectUri?: string }) {
    this.logger.log('exchangeGithubCode');
    try {
      const accessToken = await this.authService.exchangeGithubCode(data.code, data.redirectUri);
      this.logger.log('exchangeGithubCode success');
      return { accessToken };
    } catch (err) {
      this.logger.error('exchangeGithubCode failed', err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_COMPLETE_ONBOARDING)
  async completeOnboarding(@Payload() data: { userId: string }) {
    this.logger.log(`completeOnboarding userId=${data.userId}`);
    try {
      const result = await this.authService.completeOnboarding(data.userId);
      this.logger.log(`completeOnboarding success userId=${data.userId}`);
      return result;
    } catch (err) {
      this.logger.error(`completeOnboarding failed userId=${data.userId}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_LINK_VCS)
  async linkVcs(
    @Payload()
    data: {
      userId: string;
      provider: 'gitlab' | 'bitbucket';
      token: string;
    },
  ) {
    this.logger.log(`linkVcs userId=${data.userId} provider=${data.provider}`);
    try {
      const result = await this.authService.linkVcs(data.userId, data.provider, data.token);
      this.logger.log(`linkVcs success userId=${data.userId} provider=${data.provider}`);
      return result;
    } catch (err) {
      this.logger.error(`linkVcs failed userId=${data.userId} provider=${data.provider}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_UPDATE_PLAN)
  async updatePlan(@Payload() data: { userId: string; plan: string }) {
    this.logger.log(`updatePlan userId=${data.userId} plan=${data.plan}`);
    try {
      const result = await this.authService.updatePlan(data.userId, data.plan as any);
      this.logger.log(`updatePlan success userId=${data.userId} plan=${data.plan}`);
      return result;
    } catch (err) {
      this.logger.error(`updatePlan failed userId=${data.userId} plan=${data.plan}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_SEND_OTP)
  async sendOtp(@Payload() data: { email: string }) {
    this.logger.log(`sendOtp email=${data.email}`);
    try {
      await this.authService.sendOtp(data.email);
      this.logger.log(`sendOtp success email=${data.email}`);
      return { success: true };
    } catch (err) {
      this.logger.error(`sendOtp failed email=${data.email}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_VERIFY_OTP)
  async verifyOtp(@Payload() data: { email: string; code: string }) {
    this.logger.log(`verifyOtp email=${data.email}`);
    try {
      const result = await this.authService.verifyOtp(data.email, data.code);
      this.logger.log(`verifyOtp success email=${data.email} isNewUser=${result.isNewUser}`);
      return result;
    } catch (err) {
      this.logger.error(`verifyOtp failed email=${data.email}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }
}
