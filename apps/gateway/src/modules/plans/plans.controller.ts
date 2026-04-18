import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import {
  SERVICES,
  MESSAGE_PATTERNS,
  CurrentUser,
  JwtAuthGuard,
  PLANS,
} from '../../common';
import type { IUser } from '../../common';

@ApiTags('plans')
@Controller('plans')
export class PlansProxyController {
  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
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
}
