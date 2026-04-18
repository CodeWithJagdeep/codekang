import Anthropic from '@anthropic-ai/sdk';
import { env } from '../env';
import { logger } from '../../utils/logger';
import { AIClient, AIMessage, AIResponse, CompletionOptions } from './index';

export class AnthropicClient implements AIClient {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }

  async complete(
    messages: AIMessage[],
    options: CompletionOptions = {},
  ): Promise<AIResponse> {
    const startTime = Date.now();

    const system = messages.find((m) => m.role === 'system')?.content;
    const conversation = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
    if (conversation.length === 0) {
      logger.warn(
        'Anthropic request had no conversation messages; injecting fallback user message',
      );
      conversation.push({ role: 'user', content: 'Continue.' });
    }

    const model = (options as any).model ?? env.ANTHROPIC_MODEL_AGENT;

    const response = await this.client.messages.create({
      model,
      max_tokens: options.maxTokens ?? env.AGENT_MAX_TOKENS,
      temperature: options.temperature ?? env.AGENT_TEMPERATURE,
      ...(system ? { system } : {}),
      messages: conversation,
      ...(options.tools ? { tools: options.tools } : {}),
    });

    const latency = Date.now() - startTime;
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const content =
      response.content[0]?.type === 'text' ? response.content[0].text : '';

    logger.debug('Anthropic completion', {
      model,
      inputTokens,
      outputTokens,
      latency,
    });

    return {
      content,
      provider: 'anthropic',
      model: response.model,
      tokensUsed: { input: inputTokens, output: outputTokens },
      cost: calculateCost('anthropic', model, inputTokens, outputTokens),
      latency,
    };
  }

  async *stream(
    messages: AIMessage[],
    options: CompletionOptions = {},
  ): AsyncGenerator<string> {
    const system = messages.find((m) => m.role === 'system')?.content;
    const conversation = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
    if (conversation.length === 0) {
      logger.warn(
        'Anthropic stream request had no conversation messages; injecting fallback user message',
      );
      conversation.push({ role: 'user', content: 'Continue.' });
    }

    const model = (options as any).model ?? env.ANTHROPIC_MODEL_AGENT;

    const stream = this.client.messages.stream({
      model,
      max_tokens: options.maxTokens ?? env.AGENT_MAX_TOKENS,
      temperature: options.temperature ?? env.AGENT_TEMPERATURE,
      ...(system ? { system } : {}),
      messages: conversation,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  }
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
// Cost per 1M tokens in USD (input / output)
const ANTHROPIC_PRICING: Record<string, { input: number; output: number }> = {
  'claude-opus-4-7': { input: 15, output: 75 },
  'claude-opus-4-5': { input: 15, output: 75 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-sonnet-4-5': { input: 3, output: 15 },
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4 },
  'claude-3-5-haiku-latest': { input: 0.8, output: 4 },
};

export function calculateCost(
  _provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = ANTHROPIC_PRICING[model] ?? { input: 3, output: 15 };
  return (
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output
  );
}

export const anthropicClient = new AnthropicClient();
