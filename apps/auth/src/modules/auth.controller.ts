import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { BillingService } from './billing/billing.service';
import { MESSAGE_PATTERNS } from '../common';
import type { BillingInterval } from './billing/billing.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly billingService: BillingService,
  ) {}

  @MessagePattern(MESSAGE_PATTERNS.AUTH_VALIDATE_TOKEN)
  validateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_GET_USER)
  getUser(@Payload() data: { userId: string }) {
    return this.authService.getUser(data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_LOGOUT)
  async logout(@Payload() data: { userId: string }) {
    await this.authService.logout(data.userId);
    return { success: true };
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_REFRESH_TOKEN)
  refreshToken(@Payload() data: { refreshToken: string }) {
    return this.authService.refreshTokens(data.refreshToken);
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_GET_SUBSCRIPTION)
  getSubscription(@Payload() data: { userId: string }) {
    return this.authService.getSubscription(data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_CHECK_CREDITS)
  checkCredits(@Payload() data: { userId: string; cost: number }) {
    return this.authService.checkCredits(data.userId, data.cost);
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_CONSUME_CREDITS)
  async consumeCredits(@Payload() data: { userId: string; cost: number }) {
    await this.authService.consumeCredits(data.userId, data.cost);
    return { success: true };
  }

  @MessagePattern('auth.get_github_token')
  getGithubToken(@Payload() data: { userId: string }) {
    return this.authService.getGithubToken(data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_FIREBASE_LOGIN)
  socialLogin(
    @Payload() data: { provider: 'google' | 'github'; token: string },
  ) {
    return this.authService.socialLogin(data.provider, data.token);
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_COMPLETE_ONBOARDING)
  completeOnboarding(@Payload() data: { userId: string }) {
    return this.authService.completeOnboarding(data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_LINK_VCS)
  linkVcs(
    @Payload()
    data: {
      userId: string;
      provider: 'gitlab' | 'bitbucket';
      token: string;
    },
  ) {
    return this.authService.linkVcs(data.userId, data.provider, data.token);
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_UPDATE_PLAN)
  updatePlan(@Payload() data: { userId: string; plan: string }) {
    return this.authService.updatePlan(data.userId, data.plan as any);
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_SEND_OTP)
  async sendOtp(@Payload() data: { email: string }) {
    await this.authService.sendOtp(data.email);
    return { success: true };
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTH_VERIFY_OTP)
  verifyOtp(@Payload() data: { email: string; code: string }) {
    return this.authService.verifyOtp(data.email, data.code);
  }

  // ─── Billing ─────────────────────────────────────────────────────────────

  @MessagePattern(MESSAGE_PATTERNS.BILLING_CREATE_CHECKOUT)
  createCheckoutSession(
    @Payload()
    data: {
      userId: string;
      planTier: string;
      interval: BillingInterval;
      successUrl: string;
      cancelUrl: string;
    },
  ) {
    return this.billingService.createCheckoutSession(
      data.userId,
      data.planTier as any,
      data.interval,
      data.successUrl,
      data.cancelUrl,
    );
  }

  @MessagePattern(MESSAGE_PATTERNS.BILLING_CREATE_PORTAL)
  createPortalSession(@Payload() data: { userId: string; returnUrl: string }) {
    return this.billingService.createPortalSession(data.userId, data.returnUrl);
  }

  @MessagePattern(MESSAGE_PATTERNS.BILLING_HANDLE_WEBHOOK)
  handleWebhook(@Payload() data: { payload: number[]; signature: string }) {
    return this.billingService.handleWebhook(
      Buffer.from(data.payload),
      data.signature,
    );
  }

  @MessagePattern(MESSAGE_PATTERNS.BILLING_GET_SUBSCRIPTION)
  getBillingSubscription(@Payload() data: { userId: string }) {
    return this.billingService.getSubscriptionInfo(data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.BILLING_GET_INVOICES)
  getInvoices(@Payload() data: { userId: string }) {
    return this.billingService.getInvoices(data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.BILLING_CANCEL_SUBSCRIPTION)
  cancelSubscription(@Payload() data: { userId: string }) {
    return this.billingService.cancelSubscription(data.userId);
  }
}
