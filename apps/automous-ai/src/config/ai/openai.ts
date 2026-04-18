/**
 * OpenAI / OpenAI-compatible provider (e.g. GPT-4o, etc.)
 * Uses the low-level fetch API so we don't need to install the openai package.
 * Set OPENAI_API_KEY, OPENAI_BASE_URL and OPENAI_MODEL in .env to enable.
 */
import { env } from '../env';
import { logger } from '../../utils/logger';
import { AIClient, AIMessage, AIResponse, CompletionOptions } from './index';

// Optional env vars (not in the Zod schema — default safely)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o';

export class OpenAIClient implements AIClient {
  async complete(
    messages: AIMessage[],
    options: CompletionOptions = {},
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const model = (options as any).model ?? OPENAI_MODEL;

    const body: Record<string, unknown> = {
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: options.maxTokens ?? env.AGENT_MAX_TOKENS,
      temperature: options.temperature ?? env.AGENT_TEMPERATURE,
    };
    if (options.tools?.length) body.tools = options.tools;

    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${text}`);
    }

    const data: any = await res.json();
    const latency = Date.now() - startTime;
    const inputTokens = data.usage?.prompt_tokens ?? 0;
    const outputTokens = data.usage?.completion_tokens ?? 0;
    const content = data.choices?.[0]?.message?.content ?? '';

    logger.debug('OpenAI completion', {
      model,
      inputTokens,
      outputTokens,
      latency,
    });

    return {
      content,
      provider: 'openai',
      model: data.model ?? model,
      tokensUsed: { input: inputTokens, output: outputTokens },
      cost: calculateOpenAICost(data.model ?? model, inputTokens, outputTokens),
      latency,
    };
  }
}

const OPENAI_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 5, output: 15 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10, output: 30 },
};

function calculateOpenAICost(
  model: string,
  input: number,
  output: number,
): number {
  const p = OPENAI_PRICING[model] ?? { input: 5, output: 15 };
  return (input / 1_000_000) * p.input + (output / 1_000_000) * p.output;
}

export const openAIClient = new OpenAIClient();
