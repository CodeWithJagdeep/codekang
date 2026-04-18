/**
 * AI Router — picks the right provider + model for a given task,
 * respects ANTHROPIC_MODEL_CLASSIFIER / ANTHROPIC_MODEL_AGENT from env.
 */
import { env } from '../env';
import { logger } from '../../utils/logger';
import {
  AIClient,
  AIMessage,
  AIResponse,
  AITask,
  CompletionOptions,
} from './index';
import { anthropicClient } from './anthropic';
import { openAIClient } from './openai';
import { deepSeekClient } from './deepseek';
import { groqClient } from './groq';
import { trackCost, assertBudget } from './cost-tracker';

// ─── Routing table ────────────────────────────────────────────────────────────
// All tasks use Claude only. No fallbacks.

interface Route {
  client: AIClient;
  model: string;
}

function buildRoutes(): Record<AITask, Route> {
  return {
    classifier: {
      client: anthropicClient,
      model: env.ANTHROPIC_MODEL_CLASSIFIER,
    },
    agent: {
      client: anthropicClient,
      model: env.ANTHROPIC_MODEL_AGENT,
    },
    reviewer: {
      client: anthropicClient,
      model: env.ANTHROPIC_MODEL_CLASSIFIER, // haiku — fast + cheap for review
    },
    complex: {
      client: anthropicClient,
      model: env.ANTHROPIC_MODEL_AGENT,
    },
  };
}

// ─── Accumulated fix cost (per-job tracking) ──────────────────────────────────
let fixCost = 0;

export function resetFixCost(): void {
  fixCost = 0;
}

// ─── Main router ─────────────────────────────────────────────────────────────

export async function routeCompletion(
  task: AITask,
  messages: AIMessage[],
  options: CompletionOptions = {},
): Promise<AIResponse> {
  const routes = buildRoutes();
  const route = routes[task];

  logger.info('🤖 AI Router Decision', {
    task,
    model: route.model,
  });

  const mergedOptions = { ...options, model: route.model } as any;
  let response: AIResponse;

  try {
    response = await route.client.complete(messages, mergedOptions);
  } catch (err) {
    logger.error('Claude API call failed', {
      task,
      model: route.model,
      error: (err as Error).message,
    });
    throw err;
  }

  // Track cost and enforce per-fix budget
  trackCost(response);
  fixCost += response.cost;
  assertBudget(fixCost);

  return response;
}

// ─── Convenience named helpers ────────────────────────────────────────────────

export const ai = {
  classify: (messages: AIMessage[], options?: CompletionOptions) =>
    routeCompletion('classifier', messages, options),

  fix: (messages: AIMessage[], options?: CompletionOptions) =>
    routeCompletion('agent', messages, options),

  review: (messages: AIMessage[], options?: CompletionOptions) =>
    routeCompletion('reviewer', messages, options),

  reason: (messages: AIMessage[], options?: CompletionOptions) =>
    routeCompletion('complex', messages, options),
};

export { openAIClient, deepSeekClient, groqClient, anthropicClient };
