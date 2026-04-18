import { env } from '../env';
import { logger } from '../../utils/logger';
import { AIResponse } from './index';

// ─── Running totals (in-memory, resets on restart) ──────────────────────────

let totalCost = 0;
let totalCalls = 0;

// ─── Track a completed AI call ───────────────────────────────────────────────

export function trackCost(response: AIResponse): void {
  totalCost += response.cost;
  totalCalls += 1;

  if (response.cost > env.WARN_COST_THRESHOLD) {
    logger.warn('High cost AI call', {
      provider: response.provider,
      model: response.model,
      cost: response.cost.toFixed(6),
      tokens: response.tokensUsed,
    });
  }

  logger.debug('AI cost tracked', {
    callCost: response.cost.toFixed(6),
    sessionTotal: totalCost.toFixed(6),
    totalCalls,
  });
}

// ─── Guard: throw if this fix would exceed the per-fix budget ────────────────

export function assertBudget(currentFixCost: number): void {
  if (currentFixCost > env.MAX_COST_PER_FIX) {
    throw new Error(
      `Cost limit exceeded: $${currentFixCost.toFixed(4)} > $${env.MAX_COST_PER_FIX} per fix`,
    );
  }
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export function getCostStats() {
  return {
    totalCostUsd: totalCost,
    totalCalls,
    averageCostPerCall: totalCalls > 0 ? totalCost / totalCalls : 0,
    maxCostPerFix: env.MAX_COST_PER_FIX,
    warnThreshold: env.WARN_COST_THRESHOLD,
  };
}

export function resetCostStats(): void {
  totalCost = 0;
  totalCalls = 0;
}
