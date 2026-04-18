/**
 * DeepSeek provider (OpenAI-compatible API).
 * Set DEEPSEEK_API_KEY and DEEPSEEK_MODEL in .env to enable.
 */
import { env } from '../env';
import { logger } from '../../utils/logger';
import { AIClient, AIMessage, AIResponse, CompletionOptions } from './index';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? '';
const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? 'deepseek-coder';

export class DeepSeekClient implements AIClient {
  async complete(
    messages: AIMessage[],
    options: CompletionOptions = {},
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const model = (options as any).model ?? DEEPSEEK_MODEL;

    const body: Record<string, unknown> = {
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: options.maxTokens ?? env.AGENT_MAX_TOKENS,
      temperature: options.temperature ?? env.AGENT_TEMPERATURE,
    };
    if (options.tools?.length) body.tools = options.tools;

    const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`DeepSeek error ${res.status}: ${text}`);
    }

    const data: any = await res.json();
    const latency = Date.now() - startTime;
    const inputTokens = data.usage?.prompt_tokens ?? 0;
    const outputTokens = data.usage?.completion_tokens ?? 0;
    const content = data.choices?.[0]?.message?.content ?? '';

    logger.debug('DeepSeek completion', {
      model,
      inputTokens,
      outputTokens,
      latency,
    });

    return {
      content,
      provider: 'anthropic', // reusing "anthropic" slot; extend AIProvider if needed
      model: data.model ?? model,
      tokensUsed: { input: inputTokens, output: outputTokens },
      cost: calculateDeepSeekCost(model, inputTokens, outputTokens),
      latency,
    };
  }
}

// DeepSeek pricing (USD per 1M tokens)
const DEEPSEEK_PRICING: Record<string, { input: number; output: number }> = {
  'deepseek-coder': { input: 0.14, output: 0.28 },
  'deepseek-chat': { input: 0.14, output: 0.28 },
  'deepseek-reasoner': { input: 0.55, output: 2.19 },
};

function calculateDeepSeekCost(
  model: string,
  input: number,
  output: number,
): number {
  const p = DEEPSEEK_PRICING[model] ?? { input: 0.14, output: 0.28 };
  return (input / 1_000_000) * p.input + (output / 1_000_000) * p.output;
}

export const deepSeekClient = new DeepSeekClient();
