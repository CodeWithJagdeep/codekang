import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User } from '../../entities/user.entity';
import { PLANS } from '../../common';
import type { PlanTier } from '../../common';

export type BillingInterval = 'monthly' | 'annual';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete';

const TRIAL_DAYS = 7;

// Maps plan tier + interval to Stripe price env var names
const PRICE_ENV_KEYS: Partial<Record<PlanTier, Record<BillingInterval, string>>> = {
  starter: {
    monthly: 'STRIPE_PRICE_STARTER_MONTHLY',
    annual: 'STRIPE_PRICE_STARTER_ANNUAL',
  },
  pro: {
    monthly: 'STRIPE_PRICE_PRO_MONTHLY',
    annual: 'STRIPE_PRICE_PRO_ANNUAL',
  },
  team: {
    monthly: 'STRIPE_PRICE_TEAM_MONTHLY',
    annual: 'STRIPE_PRICE_TEAM_ANNUAL',
  },
};

@Injectable()
export class BillingService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.getOrThrow('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-03-31.basil',
    });
  }

  // ─── Customer ─────────────────────────────────────────────────────────────

  private async getOrCreateCustomer(user: User): Promise<string> {
    if (user.stripeCustomerId) return user.stripeCustomerId;

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });

    await this.userRepo.update(user.id, { stripeCustomerId: customer.id });
    return customer.id;
  }

  // ─── Checkout session (initiates subscription with trial) ─────────────────

  async createCheckoutSession(
    userId: string,
    planTier: PlanTier,
    interval: BillingInterval,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    if (planTier === 'free' || planTier === 'enterprise') {
      throw new BadRequestException(
        'Use the free plan by default; contact sales for enterprise.',
      );
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const priceEnvKey = PRICE_ENV_KEYS[planTier]?.[interval];
    if (!priceEnvKey) {
      throw new BadRequestException(`Unsupported plan/interval: ${planTier}/${interval}`);
    }

    const priceId = this.config.get<string>(priceEnvKey);
    if (!priceId) {
      throw new BadRequestException(
        `Stripe price not configured for ${planTier}/${interval}. Set ${priceEnvKey} in environment.`,
      );
    }

    const customerId = await this.getOrCreateCustomer(user);

    // Block if user already has an active/trialing subscription
    if (
      user.stripeSubscriptionId &&
      (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing')
    ) {
      throw new BadRequestException(
        'You already have an active subscription. Use the billing portal to manage it.',
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { userId, planTier },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, planTier, interval },
    });

    return { url: session.url! };
  }

  // ─── Billing portal (manage existing subscription) ────────────────────────

  async createPortalSession(
    userId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.stripeCustomerId) {
      throw new BadRequestException('No billing account found. Subscribe to a plan first.');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  // ─── Subscription info ────────────────────────────────────────────────────

  async getSubscriptionInfo(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = PLANS[user.plan];
    return {
      plan: user.plan,
      planName: plan.name,
      subscriptionStatus: user.subscriptionStatus ?? null,
      trialEndsAt: user.trialEndsAt ?? null,
      currentPeriodEnd: user.currentPeriodEnd ?? null,
      stripeCustomerId: user.stripeCustomerId ?? null,
      hasActiveSubscription:
        user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing',
      creditsUsed: user.creditsUsed,
      creditsPerMonth:
        plan.features.creditsPerMonth === -1 ? 'unlimited' : plan.features.creditsPerMonth,
      creditsReset: user.creditsReset,
    };
  }

  // ─── Invoice list ─────────────────────────────────────────────────────────

  async getInvoices(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.stripeCustomerId) return { invoices: [] };

    const invoices = await this.stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 24,
    });

    return {
      invoices: invoices.data.map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        amountPaid: inv.amount_paid / 100,
        amountDue: inv.amount_due / 100,
        currency: inv.currency.toUpperCase(),
        periodStart: new Date(inv.period_start * 1000),
        periodEnd: new Date(inv.period_end * 1000),
        invoicePdf: inv.invoice_pdf,
        hostedInvoiceUrl: inv.hosted_invoice_url,
        createdAt: new Date(inv.created * 1000),
      })),
    };
  }

  // ─── Cancel subscription ──────────────────────────────────────────────────

  async cancelSubscription(userId: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.stripeSubscriptionId) {
      throw new BadRequestException('No active subscription to cancel.');
    }

    // Cancel at period end (not immediately) to honor paid time
    await this.stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return {
      message: `Subscription will be canceled at the end of the current billing period (${user.currentPeriodEnd?.toDateString() ?? 'N/A'}).`,
    };
  }

  // ─── Stripe webhook ───────────────────────────────────────────────────────

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.config.getOrThrow('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${(err as Error).message}`);
    }

    this.logger.log(`Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        this.logger.debug(`Unhandled webhook event: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const planTier = session.metadata?.planTier as PlanTier | undefined;
    if (!userId || !planTier) return;

    const subscriptionId = session.subscription as string | null;
    if (!subscriptionId) return;

    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    await this.syncSubscription(userId, subscription, planTier);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    const planTier = subscription.metadata?.planTier as PlanTier | undefined;
    if (!userId) return;

    await this.syncSubscription(userId, subscription, planTier);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    await this.userRepo.update(userId, {
      plan: 'free',
      subscriptionStatus: 'canceled',
      stripeSubscriptionId: null as any,
      currentPeriodEnd: null as any,
      trialEndsAt: null as any,
    });
    this.logger.log(`Subscription canceled for user ${userId}, downgraded to free`);
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const user = await this.userRepo.findOne({ where: { stripeCustomerId: customerId } });
    if (!user) return;

    if (invoice.subscription) {
      const subscription = await this.stripe.subscriptions.retrieve(
        invoice.subscription as string,
      );
      await this.syncSubscription(user.id, subscription);
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const user = await this.userRepo.findOne({ where: { stripeCustomerId: customerId } });
    if (!user) return;

    await this.userRepo.update(user.id, { subscriptionStatus: 'past_due' });
    this.logger.warn(`Payment failed for user ${user.id} (${user.email})`);
  }

  // ─── Sync helper ─────────────────────────────────────────────────────────

  private async syncSubscription(
    userId: string,
    subscription: Stripe.Subscription,
    planTier?: PlanTier,
  ): Promise<void> {
    const status = subscription.status as SubscriptionStatus;

    // Resolve plan from metadata or existing user plan
    let resolvedPlan: PlanTier = planTier ?? 'free';
    if (!planTier) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      resolvedPlan = user?.plan ?? 'free';
    }

    // Only keep on paid plan when subscription is actually paying
    const activePlan: PlanTier =
      status === 'active' || status === 'trialing' ? resolvedPlan : 'free';

    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;
    const periodEnd = new Date(subscription.current_period_end * 1000);

    await this.userRepo.update(userId, {
      plan: activePlan,
      subscriptionStatus: status,
      stripeSubscriptionId: subscription.id,
      trialEndsAt: trialEnd as any,
      currentPeriodEnd: periodEnd,
      // Reset credits on plan change to active
      ...(status === 'active' || status === 'trialing'
        ? {
            creditsUsed: 0,
            creditsReset: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
          }
        : {}),
    });

    this.logger.log(`Synced subscription for user ${userId}: plan=${activePlan}, status=${status}`);
  }
}
