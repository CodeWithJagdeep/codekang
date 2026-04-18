import { Test, TestingModule } from '@nestjs/testing';
import { PlansProxyController } from './plans.controller';
import { SERVICES, PLANS } from '../../common';
import type { IUser } from '../../common';

jest.mock('rxjs', () => {
  const actual = jest.requireActual('rxjs');
  return {
    ...actual,
    firstValueFrom: jest.fn().mockImplementation((obs) => obs.toPromise()),
  };
});

const mockUser = (plan: IUser['plan'] = 'pro'): IUser => ({
  id: 'user-uuid-1',
  email: 'dev@test.com',
  name: 'Dev',
  provider: 'github',
  providerId: 'gh-1',
  plan,
  onboardingCompleted: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('PlansProxyController', () => {
  let controller: PlansProxyController;
  let authClient: { send: jest.Mock };

  beforeEach(async () => {
    authClient = {
      send: jest.fn().mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({
          tier: 'pro',
          creditsUsed: 100,
          creditsReset: new Date(),
          isActive: true,
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlansProxyController],
      providers: [{ provide: SERVICES.AUTH, useValue: authClient }],
    }).compile();

    controller = module.get(PlansProxyController);
  });

  describe('listPlans', () => {
    it('returns all 5 plan tiers', () => {
      const plans = controller.listPlans();
      const tiers = plans.map((p: any) => p.tier);

      expect(tiers).toContain('free');
      expect(tiers).toContain('starter');
      expect(tiers).toContain('pro');
      expect(tiers).toContain('team');
      expect(tiers).toContain('enterprise');
      expect(plans).toHaveLength(5);
    });

    it('free plan has 0 monthly price', () => {
      const plans = controller.listPlans();
      const free = plans.find((p: any) => p.tier === 'free');
      expect(free.pricing.monthly).toBe(0);
    });

    it('team plan shows unlimited repos', () => {
      const plans = controller.listPlans();
      const team = plans.find((p: any) => p.tier === 'team');
      expect(team.features.repos.privateRepos).toBe('unlimited');
    });

    it('team plan shows unlimited credits', () => {
      const plans = controller.listPlans();
      const team = plans.find((p: any) => p.tier === 'team');
      expect(team.features.ai.creditsPerMonth).toBe('unlimited');
    });

    it('pro plan has autonomous fix enabled', () => {
      const plans = controller.listPlans();
      const pro = plans.find((p: any) => p.tier === 'pro');
      expect(pro.features.ai.autonomousFix).toBe(true);
    });

    it('free plan does not have autonomous fix', () => {
      const plans = controller.listPlans();
      const free = plans.find((p: any) => p.tier === 'free');
      expect(free.features.ai.autonomousFix).toBe(false);
    });

    it('starter plan does not have autonomous fix', () => {
      const plans = controller.listPlans();
      const starter = plans.find((p: any) => p.tier === 'starter');
      expect(starter.features.ai.autonomousFix).toBe(false);
    });

    it('pro plan has unlimited reviews per hour', () => {
      const plans = controller.listPlans();
      const pro = plans.find((p: any) => p.tier === 'pro');
      expect(pro.features.reviews.reviewsPerHour).toBe('unlimited');
    });

    it('enterprise plan shows custom pricing', () => {
      const plans = controller.listPlans();
      const enterprise = plans.find((p: any) => p.tier === 'enterprise');
      expect(enterprise.pricing.monthly).toBe('custom');
    });
  });

  describe('getSubscription', () => {
    it('returns subscription enriched with plan details', async () => {
      const result = await controller.getSubscription(mockUser('pro'));

      expect(authClient.send).toHaveBeenCalledWith('auth.get_subscription', {
        userId: 'user-uuid-1',
      });
      expect(result).toHaveProperty('plan');
      expect(result.plan.tier).toBe('pro');
      expect(result.plan.autonomousFixEnabled).toBe(true);
    });
  });
});

// ─── PLANS constant integrity tests ───────────────────────────────────────────

describe('PLANS constant', () => {
  it('free plan has 50 credits per month', () => {
    expect(PLANS.free.features.creditsPerMonth).toBe(50);
  });

  it('starter plan has 400 credits per month', () => {
    expect(PLANS.starter.features.creditsPerMonth).toBe(400);
  });

  it('pro plan has 1500 credits per month', () => {
    expect(PLANS.pro.features.creditsPerMonth).toBe(1500);
  });

  it('team plan has unlimited credits (-1)', () => {
    expect(PLANS.team.features.creditsPerMonth).toBe(-1);
  });

  it('enterprise plan has unlimited repos (-1)', () => {
    expect(PLANS.enterprise.features.maxPrivateRepos).toBe(-1);
  });

  it('pro is cheaper than starter for annual billing', () => {
    expect(PLANS.pro.priceAnnual).toBeGreaterThan(PLANS.starter.priceAnnual);
  });

  it('pro plan includes UTG, merge conflict, and issue planner', () => {
    expect(PLANS.pro.features.unitTestGeneration).toBe(true);
    expect(PLANS.pro.features.mergeConflictResolution).toBe(true);
    expect(PLANS.pro.features.issuePlanner).toBe(true);
  });

  it('starter plan does NOT include UTG or autonomous fix', () => {
    expect(PLANS.starter.features.unitTestGeneration).toBe(false);
    expect(PLANS.starter.features.autonomousFixEnabled).toBe(false);
  });

  it('enterprise has SSO and self-hosting', () => {
    expect(PLANS.enterprise.features.ssoSaml).toBe(true);
    expect(PLANS.enterprise.features.selfHosting).toBe(true);
  });

  it('team plan billing model is per_org', () => {
    expect(PLANS.team.billingModel).toBe('per_org');
  });

  it('team plan includes org seat information', () => {
    expect(PLANS.team.orgSeatIncluded).toBeGreaterThan(0);
    expect(PLANS.team.extraSeatPrice).toBeGreaterThan(0);
  });
});
