import { db } from '../config/database';
import { logger } from '../utils/logger';
import { createIssueComment } from '../github/api';

// Mirrors PLANS in @app/common — kept local to avoid cross-service dependency
const PLAN_LIMITS: Record<
  string,
  {
    autonomousFixEnabled: boolean;
    prReviewEnabled: boolean;
    creditsPerMonth: number;
    upgradeTo: string;
  }
> = {
  free: {
    autonomousFixEnabled: false,
    prReviewEnabled: false,
    creditsPerMonth: 50,
    upgradeTo: 'Starter ($12/mo)',
  },
  starter: {
    autonomousFixEnabled: false,
    prReviewEnabled: true,
    creditsPerMonth: 400,
    upgradeTo: 'Pro ($24/mo)',
  },
  pro: {
    autonomousFixEnabled: true,
    prReviewEnabled: true,
    creditsPerMonth: 1500,
    upgradeTo: 'Team ($199/mo)',
  },
  team: {
    autonomousFixEnabled: true,
    prReviewEnabled: true,
    creditsPerMonth: -1,
    upgradeTo: 'Enterprise',
  },
  enterprise: {
    autonomousFixEnabled: true,
    prReviewEnabled: true,
    creditsPerMonth: -1,
    upgradeTo: '',
  },
};

const FIX_CREDIT_COST = 10;
const REVIEW_CREDIT_COST = 5;

interface UserPlanInfo {
  userId: string;
  plan: string;
  creditsUsed: number;
  creditsReset: Date | null;
  isActive: boolean;
  isConnected: boolean;
}

// ─── Lookup ───────────────────────────────────────────────────────────────────

async function getUserPlanForRepo(
  owner: string,
  repo: string,
): Promise<UserPlanInfo | null> {
  const { rows } = await db.query<{
    user_id: string;
    is_installed: boolean;
    plan: string;
    credits_used: number;
    credits_reset: Date | null;
    is_active: boolean;
  }>(
    `SELECT r.user_id, r.is_installed,
            u.plan, u.credits_used, u.credits_reset, u.is_active
     FROM repositories r
     JOIN users u ON u.id = r.user_id
     WHERE r.owner = $1 AND r.name = $2
     LIMIT 1`,
    [owner, repo],
  );

  if (!rows[0]) return null;

  const row = rows[0];
  return {
    userId: row.user_id,
    plan: row.plan ?? 'free',
    creditsUsed: row.credits_used ?? 0,
    creditsReset: row.credits_reset,
    isActive: row.is_active ?? true,
    isConnected: row.is_installed,
  };
}

// ─── Credit helpers ───────────────────────────────────────────────────────────

async function resetCreditsIfNeeded(info: UserPlanInfo): Promise<number> {
  const now = new Date();
  if (!info.creditsReset || info.creditsReset < now) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await db.query(
      `UPDATE users SET credits_used = 0, credits_reset = $1 WHERE id = $2`,
      [nextMonth, info.userId],
    );
    return 0;
  }
  return info.creditsUsed;
}

async function consumeCredits(userId: string, cost: number): Promise<void> {
  await db.query(
    `UPDATE users SET credits_used = credits_used + $1 WHERE id = $2`,
    [cost, userId],
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface PlanCheckResult {
  allowed: boolean;
  reason?: string;
  userId?: string;
}

export async function checkAutonomousFix(
  owner: string,
  repo: string,
  issueNumber: number,
  installationId?: number,
): Promise<PlanCheckResult> {
  try {
    const info = await getUserPlanForRepo(owner, repo);

    if (!info) {
      logger.info('Repo not connected to CodeKang — skipping autonomous fix', {
        owner,
        repo,
      });
      return { allowed: false, reason: 'repo_not_connected' };
    }

    if (!info.isActive) {
      return { allowed: false, reason: 'user_inactive' };
    }

    if (!info.isConnected) {
      logger.info('Repo not installed — skipping', { owner, repo });
      return { allowed: false, reason: 'repo_not_installed' };
    }

    const limits = PLAN_LIMITS[info.plan] ?? PLAN_LIMITS.free;

    if (!limits.autonomousFixEnabled) {
      logger.info('Plan does not allow autonomous fixes', {
        owner,
        repo,
        plan: info.plan,
      });
      const upgradeTo = limits.upgradeTo || 'a higher plan';
      await createIssueComment(
        owner,
        repo,
        issueNumber,
        `👋 **CodeKang** detected this issue but your current plan (**${info.plan}**) doesn't include autonomous fixes.\n\n` +
          `Upgrade to **${upgradeTo}** to unlock:\n` +
          `- 🤖 Autonomous issue fixing with automatic PR creation\n` +
          `- 🧪 Unit test generation\n` +
          `- 🔀 Merge conflict resolution\n` +
          `- 📋 Issue planner\n\n` +
          `In the meantime, you can chat with the AI agent on your [CodeKang dashboard](${process.env.FRONTEND_URL}) to get a fix suggestion.`,
        installationId,
      ).catch(() => {});
      return { allowed: false, reason: 'plan_limit', userId: info.userId };
    }

    if (limits.creditsPerMonth !== -1) {
      const currentCredits = await resetCreditsIfNeeded(info);
      const remaining = limits.creditsPerMonth - currentCredits;
      if (remaining < FIX_CREDIT_COST) {
        logger.info('Insufficient credits for autonomous fix', {
          owner,
          repo,
          plan: info.plan,
          remaining,
          needed: FIX_CREDIT_COST,
        });
        const upgradeTo = limits.upgradeTo || 'a higher plan';
        const nextPlanCredits =
          info.plan === 'free'
            ? '400 credits (Starter)'
            : info.plan === 'starter'
              ? '1,500 credits (Pro)'
              : info.plan === 'pro'
                ? 'unlimited credits (Team)'
                : 'more credits';
        await createIssueComment(
          owner,
          repo,
          issueNumber,
          `👋 **CodeKang** would fix this issue but you've used all your credits this month (**${currentCredits}/${limits.creditsPerMonth} used**).\n\n` +
            `Credits reset on the 1st of next month. Upgrade to **${upgradeTo}** for ${nextPlanCredits}/month.\n\n` +
            `You can still get a fix suggestion by chatting with the AI on your [CodeKang dashboard](${process.env.FRONTEND_URL}).`,
          installationId,
        ).catch(() => {});
        return { allowed: false, reason: 'no_credits', userId: info.userId };
      }
    }

    return { allowed: true, userId: info.userId };
  } catch (err) {
    logger.error('Plan check failed — defaulting to deny', {
      owner,
      repo,
      error: (err as Error).message,
    });
    return { allowed: false, reason: 'check_error' };
  }
}

export async function checkPRReview(
  owner: string,
  repo: string,
): Promise<PlanCheckResult> {
  try {
    const info = await getUserPlanForRepo(owner, repo);

    if (!info || !info.isConnected || !info.isActive) {
      return { allowed: false, reason: 'repo_not_connected' };
    }

    const limits = PLAN_LIMITS[info.plan] ?? PLAN_LIMITS.free;

    if (!limits.prReviewEnabled) {
      logger.info('Plan does not allow PR reviews', {
        owner,
        repo,
        plan: info.plan,
      });
      return { allowed: false, reason: 'plan_limit', userId: info.userId };
    }

    if (limits.creditsPerMonth !== -1) {
      const currentCredits = await resetCreditsIfNeeded(info);
      const remaining = limits.creditsPerMonth - currentCredits;
      if (remaining < REVIEW_CREDIT_COST) {
        logger.info('Insufficient credits for PR review', {
          owner,
          repo,
          plan: info.plan,
          remaining,
        });
        return { allowed: false, reason: 'no_credits', userId: info.userId };
      }
    }

    return { allowed: true, userId: info.userId };
  } catch (err) {
    logger.error('PR review plan check failed', {
      owner,
      repo,
      error: (err as Error).message,
    });
    return { allowed: false, reason: 'check_error' };
  }
}

export async function consumeFixCredits(userId: string): Promise<void> {
  await consumeCredits(userId, FIX_CREDIT_COST).catch((err) =>
    logger.error('Failed to consume fix credits', {
      userId,
      error: (err as Error).message,
    }),
  );
}

export async function consumeReviewCredits(userId: string): Promise<void> {
  await consumeCredits(userId, REVIEW_CREDIT_COST).catch((err) =>
    logger.error('Failed to consume review credits', {
      userId,
      error: (err as Error).message,
    }),
  );
}
