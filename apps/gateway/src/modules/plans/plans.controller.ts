import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
  Inject,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { firstValueFrom } from 'rxjs';
import { createHmac } from 'crypto';
import type { Request } from 'express';
import {
  SERVICES,
  MESSAGE_PATTERNS,
  CurrentUser,
  JwtAuthGuard,
  PLANS,
} from '../../common';
import type { IUser } from '../../common';

class CreateSubscriptionDto {
  @IsEnum(['starter', 'team'])
  planTier: 'starter' | 'team';

  @IsOptional()
  @IsEnum(['monthly', 'annual'])
  billingPeriod?: 'monthly' | 'annual';
}

@ApiTags('plans')
@Controller('plans')
export class PlansProxyController {
  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all available plans with full feature comparison',
  })
  listPlans() {
    return Object.values(PLANS).map((p) => ({
      tier: p.tier,
      name: p.name,
      tagline: p.tagline,
      billingModel: p.billingModel,
      pricing: {
        monthly: p.priceMonthly === -1 ? 'custom' : p.priceMonthly,
        annual: p.priceAnnual === -1 ? 'custom' : p.priceAnnual,
        ...(p.orgSeatIncluded ? { orgSeatsIncluded: p.orgSeatIncluded } : {}),
        ...(p.extraSeatPrice ? { extraSeatPrice: p.extraSeatPrice } : {}),
      },
      trialDays: p.trialDays,
      features: {
        repos: {
          privateRepos:
            p.features.maxPrivateRepos === -1
              ? 'unlimited'
              : p.features.maxPrivateRepos,
          publicRepos: 'unlimited',
        },
        reviews: {
          prReviews: p.features.prReviews,
          prSummarization: p.features.prSummarization,
          inlineComments: p.features.inlineComments,
          linterSast: p.features.linterSastSupport,
          reviewsPerHour:
            p.features.reviewsPerHour === -1
              ? 'unlimited'
              : p.features.reviewsPerHour,
        },
        ai: {
          creditsPerMonth:
            p.features.creditsPerMonth === -1
              ? 'unlimited'
              : p.features.creditsPerMonth,
          autonomousFix: p.features.autonomousFixEnabled,
          unitTestGeneration: p.features.unitTestGeneration,
          mergeConflictResolution: p.features.mergeConflictResolution,
          issuePlanner: p.features.issuePlanner,
          docstringGeneration: p.features.docstringGeneration,
          autofixSuggestions: p.features.autofixSuggestions,
        },
        integrations: {
          jiraLinear: p.features.jiraLinearIntegration,
          linkedRepoAnalyses:
            p.features.linkedRepoAnalyses === -1
              ? 'unlimited'
              : p.features.linkedRepoAnalyses,
          mcpConnections:
            p.features.mcpConnections === -1
              ? 'unlimited'
              : p.features.mcpConnections,
          customPreMergeChecks:
            p.features.customPreMergeChecks === -1
              ? 'unlimited'
              : p.features.customPreMergeChecks,
          apiAccess: p.features.apiAccess,
        },
        team: {
          rbac: p.features.teamRbac,
          analytics: p.features.analyticsReports,
          customReports: p.features.customReports,
          auditLogging: p.features.auditLogging,
          sso: p.features.ssoSaml,
          selfHosting: p.features.selfHosting,
          multiOrg: p.features.multiOrgSupport,
          sla: p.features.slaSupport,
          dedicatedCsm: p.features.dedicatedCsm,
        },
      },
    }));
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user subscription, usage, and plan details',
  })
  async getSubscription(@CurrentUser() user: IUser) {
    const subscription = await firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_GET_SUBSCRIPTION, {
        userId: user.id,
      }),
    );
    const plan = PLANS[user.plan];
    return {
      ...subscription,
      plan: {
        tier: plan.tier,
        name: plan.name,
        tagline: plan.tagline,
        creditsPerMonth:
          plan.features.creditsPerMonth === -1
            ? 'unlimited'
            : plan.features.creditsPerMonth,
        autonomousFixEnabled: plan.features.autonomousFixEnabled,
        prReviewEnabled: plan.features.prReviewEnabled,
      },
    };
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current month AI usage statistics' })
  getUsage(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_GET_SUBSCRIPTION, {
        userId: user.id,
      }),
    );
  }

  // ── Razorpay subscription management ─────────────────────────────────────

  @Post('subscription/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Razorpay subscription for plan upgrade' })
  async createSubscription(
    @CurrentUser() user: IUser,
    @Body() body: CreateSubscriptionDto,
  ) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_CREATE_SUBSCRIPTION, {
        userId: user.id,
        planTier: body.planTier,
        billingPeriod: body.billingPeriod ?? 'monthly',
      }),
    );
  }

  @Post('subscription/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel active Razorpay subscription' })
  async cancelSubscription(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_CANCEL_SUBSCRIPTION, {
        userId: user.id,
      }),
    );
  }

  // ── Razorpay webhook (public — no JWT) ───────────────────────────────────

  @Post('webhook/razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook receiver (do not call directly)' })
  async razorpayWebhook(
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody: string =
      (req as any).rawBody instanceof Buffer
        ? (req as any).rawBody.toString('utf-8')
        : JSON.stringify(req.body);

    const secret = this.config.get('RAZORPAY_WEBHOOK_SECRET', '');
    if (secret) {
      const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
      if (expected !== signature) {
        throw new UnauthorizedException('Invalid Razorpay webhook signature');
      }
    }

    const payload = req.body as {
      event?: string;
      payload?: {
        subscription?: {
          entity?: {
            id?: string;
            plan_id?: string;
            status?: string;
            notes?: { userId?: string; planTier?: string };
          };
        };
      };
    };

    const event = payload.event;
    const sub = payload.payload?.subscription?.entity;
    const userId = sub?.notes?.userId;
    const planTier = (sub?.notes?.planTier ?? 'starter') as
      | 'starter'
      | 'pro'
      | 'team';

    if (
      event === 'subscription.activated' ||
      event === 'subscription.charged'
    ) {
      if (!userId) {
        throw new BadRequestException('userId missing from subscription notes');
      }
      await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_UPDATE_PLAN, {
          userId,
          plan: planTier,
        }),
      );
    }

    if (event === 'subscription.cancelled' || event === 'subscription.halted') {
      if (userId) {
        await firstValueFrom(
          this.authClient.send(MESSAGE_PATTERNS.AUTH_CANCEL_SUBSCRIPTION, {
            userId,
          }),
        );
      }
    }

    return { received: true };
  }
}
