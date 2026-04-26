export type PlanTier = 'free' | 'starter' | 'pro' | 'team' | 'enterprise';

export interface IPlanFeatures {
  // Repos & reviews
  maxPrivateRepos: number; // -1 = unlimited
  unlimitedPublicRepos: boolean;
  prReviews: boolean;
  prSummarization: boolean;
  inlineComments: boolean;
  linterSastSupport: boolean;

  // AI chat & issue work
  creditsPerMonth: number; // -1 = unlimited
  chatCreditCost: number;
  fixCreditCost: number;
  reviewCreditCost: number;
  utGCreditCost: number;

  // Autonomous features
  autonomousFixEnabled: boolean; // AI creates PRs automatically
  prReviewEnabled: boolean;
  unitTestGeneration: boolean; // UTG
  mergeConflictResolution: boolean;
  issuePlanner: boolean;
  docstringGeneration: boolean;
  autofixSuggestions: boolean;

  // Integrations & limits
  jiraLinearIntegration: boolean;
  linkedRepoAnalyses: number; // -1 = unlimited
  mcpConnections: number; // -1 = unlimited
  customPreMergeChecks: number; // -1 = unlimited
  reviewsPerHour: number; // -1 = unlimited
  apiAccess: boolean;

  // Team & enterprise
  teamRbac: boolean;
  analyticsReports: boolean;
  customReports: boolean;
  ssoSaml: boolean;
  selfHosting: boolean;
  auditLogging: boolean;
  multiOrgSupport: boolean;
  slaSupport: boolean;
  dedicatedCsm: boolean;
}

export interface IPlan {
  tier: PlanTier;
  name: string;
  tagline: string;
  billingModel: 'per_seat' | 'per_org' | 'free' | 'custom';
  priceMonthly: number; // per seat or per org; -1 = custom
  priceAnnual: number; // same; -1 = custom
  orgSeatIncluded?: number; // for team: seats included in flat rate
  extraSeatPrice?: number; // per additional seat beyond included
  trialDays: number;
  features: IPlanFeatures;
}

export const PLANS: Record<PlanTier, IPlan> = {
  // ── Free ──────────────────────────────────────────────────────────────────
  free: {
    tier: 'free',
    name: 'Free',
    tagline: 'Real value, no credit card needed',
    billingModel: 'free',
    priceMonthly: 0,
    priceAnnual: 0,
    trialDays: 14, // upgrades to Pro trial automatically
    features: {
      maxPrivateRepos: 5,
      unlimitedPublicRepos: true,
      prReviews: false,
      prSummarization: true,
      inlineComments: false,
      linterSastSupport: false,
      creditsPerMonth: 50,
      chatCreditCost: 1,
      fixCreditCost: 10,
      reviewCreditCost: 5,
      utGCreditCost: 8,
      autonomousFixEnabled: false,
      prReviewEnabled: false,
      unitTestGeneration: false,
      mergeConflictResolution: false,
      issuePlanner: false,
      docstringGeneration: false,
      autofixSuggestions: false,
      jiraLinearIntegration: false,
      linkedRepoAnalyses: 0,
      mcpConnections: 0,
      customPreMergeChecks: 0,
      reviewsPerHour: -1,
      apiAccess: false,
      teamRbac: false,
      analyticsReports: false,
      customReports: false,
      ssoSaml: false,
      selfHosting: false,
      auditLogging: false,
      multiOrgSupport: false,
      slaSupport: false,
      dedicatedCsm: false,
    },
  },

  // ── Starter ───────────────────────────────────────────────────────────────
  // $12/seat — half of CodeRabbit's entry price with real reviews included
  starter: {
    tier: 'starter',
    name: 'Starter',
    tagline: 'Full code reviews at half the industry price',
    billingModel: 'per_seat',
    priceMonthly: 25,
    priceAnnual: 19,
    trialDays: 14,
    features: {
      maxPrivateRepos: 20,
      unlimitedPublicRepos: true,
      prReviews: true,
      prSummarization: true,
      inlineComments: true,
      linterSastSupport: true,
      creditsPerMonth: 400,
      chatCreditCost: 1,
      fixCreditCost: 10,
      reviewCreditCost: 5,
      utGCreditCost: 8,
      autonomousFixEnabled: false,
      prReviewEnabled: true,
      unitTestGeneration: false,
      mergeConflictResolution: false,
      issuePlanner: false,
      docstringGeneration: true,
      autofixSuggestions: false,
      jiraLinearIntegration: true,
      linkedRepoAnalyses: 3,
      mcpConnections: 3,
      customPreMergeChecks: 0,
      reviewsPerHour: -1,
      apiAccess: false,
      teamRbac: false,
      analyticsReports: true,
      customReports: false,
      ssoSaml: false,
      selfHosting: false,
      auditLogging: false,
      multiOrgSupport: false,
      slaSupport: false,
      dedicatedCsm: false,
    },
  },

  // ── Pro ───────────────────────────────────────────────────────────────────
  // $24/seat — same price as CodeRabbit Pro but includes autonomous fixing,
  // UTG, merge conflict resolution, and issue planner that CodeRabbit locks
  // behind their $48/seat Pro Plus tier.
  pro: {
    tier: 'pro',
    name: 'Pro',
    tagline: 'Everything CodeRabbit Pro Plus offers — at Pro price',
    billingModel: 'per_seat',
    priceMonthly: 29,
    priceAnnual: 24,
    trialDays: 14,
    features: {
      maxPrivateRepos: 100,
      unlimitedPublicRepos: true,
      prReviews: true,
      prSummarization: true,
      inlineComments: true,
      linterSastSupport: true,
      creditsPerMonth: 1500,
      chatCreditCost: 1,
      fixCreditCost: 10,
      reviewCreditCost: 5,
      utGCreditCost: 8,
      autonomousFixEnabled: true, // ← Not in CodeRabbit at ANY price
      prReviewEnabled: true,
      unitTestGeneration: true, // ← CodeRabbit $48/seat
      mergeConflictResolution: true, // ← CodeRabbit $48/seat
      issuePlanner: true, // ← CodeRabbit $48/seat
      docstringGeneration: true,
      autofixSuggestions: true,
      jiraLinearIntegration: true,
      linkedRepoAnalyses: 10,
      mcpConnections: 15,
      customPreMergeChecks: 20,
      reviewsPerHour: -1, // ← No artificial rate limits
      apiAccess: false,
      teamRbac: false,
      analyticsReports: true,
      customReports: true,
      ssoSaml: false,
      selfHosting: false,
      auditLogging: false,
      multiOrgSupport: false,
      slaSupport: false,
      dedicatedCsm: false,
    },
  },

  // ── Team ─────────────────────────────────────────────────────────────────
  // $199/org/mo (includes 20 seats) — flat org pricing destroys per-seat math.
  // A 20-person team on CodeRabbit Pro Plus = $48×20 = $960/mo.
  // On CodeKang Team = $199/mo. That's 5× cheaper.
  team: {
    tier: 'team',
    name: 'Team',
    tagline: 'Flat org pricing — not per-seat. 5× cheaper for teams of 10+',
    billingModel: 'per_org',
    priceMonthly: 99,
    priceAnnual: 79,
    orgSeatIncluded: 20,
    extraSeatPrice: 8,
    trialDays: 14,
    features: {
      maxPrivateRepos: -1,
      unlimitedPublicRepos: true,
      prReviews: true,
      prSummarization: true,
      inlineComments: true,
      linterSastSupport: true,
      creditsPerMonth: -1, // Unlimited credits
      chatCreditCost: 1,
      fixCreditCost: 10,
      reviewCreditCost: 5,
      utGCreditCost: 8,
      autonomousFixEnabled: true,
      prReviewEnabled: true,
      unitTestGeneration: true,
      mergeConflictResolution: true,
      issuePlanner: true,
      docstringGeneration: true,
      autofixSuggestions: true,
      jiraLinearIntegration: true,
      linkedRepoAnalyses: -1,
      mcpConnections: -1,
      customPreMergeChecks: -1,
      reviewsPerHour: -1,
      apiAccess: true,
      teamRbac: true,
      analyticsReports: true,
      customReports: true,
      ssoSaml: false,
      selfHosting: false,
      auditLogging: true,
      multiOrgSupport: false,
      slaSupport: false,
      dedicatedCsm: false,
    },
  },

  // ── Enterprise ────────────────────────────────────────────────────────────
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    tagline:
      'Team plan for large organizations — with SSO, self-hosting, and SLA',
    billingModel: 'custom',
    priceMonthly: -1,
    priceAnnual: -1,
    trialDays: 30,
    features: {
      maxPrivateRepos: -1,
      unlimitedPublicRepos: true,
      prReviews: true,
      prSummarization: true,
      inlineComments: true,
      linterSastSupport: true,
      creditsPerMonth: -1,
      chatCreditCost: 1,
      fixCreditCost: 10,
      reviewCreditCost: 5,
      utGCreditCost: 8,
      autonomousFixEnabled: true,
      prReviewEnabled: true,
      unitTestGeneration: true,
      mergeConflictResolution: true,
      issuePlanner: true,
      docstringGeneration: true,
      autofixSuggestions: true,
      jiraLinearIntegration: true,
      linkedRepoAnalyses: -1,
      mcpConnections: -1,
      customPreMergeChecks: -1,
      reviewsPerHour: -1,
      apiAccess: true,
      teamRbac: true,
      analyticsReports: true,
      customReports: true,
      ssoSaml: true,
      selfHosting: true,
      auditLogging: true,
      multiOrgSupport: true,
      slaSupport: true,
      dedicatedCsm: true,
    },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function canAutonomousFix(tier: PlanTier): boolean {
  return PLANS[tier].features.autonomousFixEnabled;
}

export function canPRReview(tier: PlanTier): boolean {
  return PLANS[tier].features.prReviewEnabled;
}

export function getCreditsPerMonth(tier: PlanTier): number {
  return PLANS[tier].features.creditsPerMonth;
}

export function getMaxRepos(tier: PlanTier): number {
  return PLANS[tier].features.maxPrivateRepos;
}

export interface ISubscription {
  id: string;
  userId: string;
  tier: PlanTier;
  creditsUsed: number;
  creditsReset: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUsageCheck {
  allowed: boolean;
  creditsRemaining: number;
  reason?: string;
}
