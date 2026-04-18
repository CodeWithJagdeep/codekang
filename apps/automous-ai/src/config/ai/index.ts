export type AIProvider = 'anthropic' | 'openai' | 'gemini' | 'ollama' | 'groq';

export type AITask =
  | 'classifier' // Classify issue type
  | 'agent' // Main agent reasoning
  | 'reviewer' // Code review
  | 'complex'; // Hard multi-step reasoning

export type AIRoutingStrategy =
  | 'primary_only'
  | 'cost_optimized'
  | 'speed_optimized'
  | 'fallback'
  | 'load_balanced';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  cost: number;
  latency: number; // ms
}

export interface AIClientConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIClient {
  complete(
    messages: AIMessage[],
    options?: CompletionOptions,
  ): Promise<AIResponse>;
  stream?(
    messages: AIMessage[],
    options?: CompletionOptions,
  ): AsyncGenerator<string>;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  tools?: any[];
}

export interface ProviderPricing {
  [model: string]: {
    input: number; // USD per 1M tokens
    output: number; // USD per 1M tokens
  };
}

// ─── Re-export convenience singleton from router ──────────────────────────────
export { ai, routeCompletion, resetFixCost } from './router';
export { getCostStats, resetCostStats } from './cost-tracker';
