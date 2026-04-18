/**
 * Groq provider — ultra-fast inference via their OpenAI-compatible API.
 * Set GROQ_API_KEY and GROQ_MODEL in .env to enable.
 */
import { env } from '../env';
import { logger } from '../../utils/logger';
import { AIClient, AIMessage, AIResponse, CompletionOptions } from './index';

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

export class GroqClient implements AIClient {
  async complete(
    messages: AIMessage[],
    options: CompletionOptions = {},
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const model = (options as any).model ?? GROQ_MODEL;

    const body: Record<string, unknown> = {
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: options.maxTokens ?? env.AGENT_MAX_TOKENS,
      temperature: options.temperature ?? env.AGENT_TEMPERATURE,
    };

    const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Groq error ${res.status}: ${text}`);
    }

    const data: any = await res.json();
    const latency = Date.now() - startTime;
    const inputTokens = data.usage?.prompt_tokens ?? 0;
    const outputTokens = data.usage?.completion_tokens ?? 0;
    const content = data.choices?.[0]?.message?.content ?? '';

    logger.debug('Groq completion', {
      model,
      inputTokens,
      outputTokens,
      latency,
    });

    return {
      content,
      provider: 'groq',
      model: data.model ?? model,
      tokensUsed: { input: inputTokens, output: outputTokens },
      cost: calculateGroqCost(model, inputTokens, outputTokens),
      latency,
    };
  }
}

// Groq pricing (USD per 1M tokens) — as of 2025
const GROQ_PRICING: Record<string, { input: number; output: number }> = {
  'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
  'mixtral-8x7b-32768': { input: 0.24, output: 0.24 },
  'gemma2-9b-it': { input: 0.2, output: 0.2 },
};

function calculateGroqCost(
  model: string,
  input: number,
  output: number,
): number {
  const p = GROQ_PRICING[model] ?? { input: 0.59, output: 0.79 };
  return (input / 1_000_000) * p.input + (output / 1_000_000) * p.output;
}

export const groqClient = new GroqClient();
