import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { createHmac } from 'crypto';

export interface RazorpaySubscriptionResult {
  subscriptionId: string;
  razorpayKeyId: string;
  shortUrl: string;
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly client: Razorpay;
  private readonly planIds: Record<string, Record<string, string>>;

  constructor(private readonly config: ConfigService) {
    const keyId = this.config.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      this.logger.error(
        'Razorpay credentials are missing! Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.',
      );
    }

    this.client = new Razorpay({
      key_id: keyId || 'MISSING',
      key_secret: keySecret || 'MISSING',
    });

    this.planIds = {
      starter: {
        monthly: this.config.get('RAZORPAY_PLAN_STARTER_MONTHLY_ID', ''),
        annual: this.config.get('RAZORPAY_PLAN_STARTER_ANNUAL_ID', ''),
      },
      team: {
        monthly: this.config.get('RAZORPAY_PLAN_TEAM_MONTHLY_ID', ''),
        annual: this.config.get('RAZORPAY_PLAN_TEAM_ANNUAL_ID', ''),
      },
    };
  }

  async createSubscription(
    userId: string,
    planTier: 'starter' | 'team',
    billingPeriod: 'monthly' | 'annual' = 'monthly',
  ): Promise<RazorpaySubscriptionResult> {
    const planId = this.planIds[planTier]?.[billingPeriod];
    if (!planId) {
      throw new Error(
        `RAZORPAY_PLAN_${planTier.toUpperCase()}_${billingPeriod.toUpperCase()}_ID is not configured`,
      );
    }

    this.logger.log(
      `Creating Razorpay subscription userId=${userId} planTier=${planTier} billingPeriod=${billingPeriod}`,
    );

    const sub = await (this.client.subscriptions.create as any)({
      plan_id: planId,
      quantity: 1,
      total_count: 12,
      notes: { userId, planTier, billingPeriod },
    });

    this.logger.log(`Razorpay subscription created id=${sub.id}`);

    return {
      subscriptionId: sub.id as string,
      razorpayKeyId: this.config.get('RAZORPAY_KEY_ID', ''),
      shortUrl: (sub.short_url as string) ?? '',
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    this.logger.log(`Cancelling Razorpay subscription id=${subscriptionId}`);
    await (this.client.subscriptions.cancel as any)(subscriptionId, false);
    this.logger.log(`Razorpay subscription cancelled id=${subscriptionId}`);
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = this.config.get('RAZORPAY_WEBHOOK_SECRET', '');
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    return expected === signature;
  }
}
