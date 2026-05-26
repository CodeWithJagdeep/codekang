import Langfuse from 'langfuse';
import { env } from './env';
import { logger } from '../utils/logger';

// ─── Langfuse singleton ───────────────────────────────────────────────────────
// If LANGFUSE keys are not configured, all calls become no-ops via the mock.

let _langfuse: Langfuse | null = null;

function getLangfuse(): Langfuse | null {
  if (!env.LANGFUSE_PUBLIC_KEY || !env.LANGFUSE_SECRET_KEY) return null;
  if (!_langfuse) {
    _langfuse = new Langfuse({
      publicKey: env.LANGFUSE_PUBLIC_KEY,
      secretKey: env.LANGFUSE_SECRET_KEY,
      baseUrl: env.LANGFUSE_BASE_URL ?? 'https://cloud.langfuse.com',
      flushAt: 20, // batch size before auto-flush
      flushInterval: 10_000, // auto-flush every 10s
    });
    logger.info('🔭 Langfuse observability connected', {
      baseUrl: env.LANGFUSE_BASE_URL ?? 'https://cloud.langfuse.com',
    });
  }
  return _langfuse;
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export interface TraceHandle {
  traceId: string;
  startGeneration: (params: {
    name: string;
    model: string;
    input: unknown;
    modelParameters?: Record<string, unknown>;
  }) => GenerationHandle;
  startSpan: (name: string, input?: unknown) => SpanHandle;
  setOutput: (output: unknown) => void;
  setMetadata: (metadata: Record<string, unknown>) => void;
  flush: () => Promise<void>;
}

export interface GenerationHandle {
  end: (params: {
    output: unknown;
    inputTokens?: number;
    outputTokens?: number;
    totalCostUsd?: number;
  }) => void;
}

export interface SpanHandle {
  end: (output?: unknown, error?: string) => void;
}

/**
 * Create a Langfuse trace for one agent run.
 * If Langfuse is not configured, returns a no-op handle so calling code
 * never needs to null-check.
 */
export function createAgentTrace(params: {
  mode: string;
  issueNumber?: number;
  issueTitle?: string;
  repo: string;
  attempt?: number;
  userId?: string;
}): TraceHandle {
  const lf = getLangfuse();

  if (!lf) {
    // No-op implementation — safe to call all methods, nothing happens
    const noopHandle: TraceHandle = {
      traceId: `noop-${Date.now()}`,
      startGeneration: () => ({ end: () => {} }),
      startSpan: () => ({ end: () => {} }),
      setOutput: () => {},
      setMetadata: () => {},
      flush: async () => {},
    };
    return noopHandle;
  }

  const trace = lf.trace({
    name: `agent-run:${params.mode}`,
    userId: params.userId,
    metadata: {
      mode: params.mode,
      repo: params.repo,
      issueNumber: params.issueNumber,
      issueTitle: params.issueTitle,
      attempt: params.attempt ?? 1,
    },
    tags: [params.mode, params.repo.split('/')[0]],
  });

  return {
    traceId: trace.id,

    startGeneration: ({ name, model, input, modelParameters }) => {
      const gen = trace.generation({
        name,
        model,
        input,
        modelParameters: modelParameters as any,
        startTime: new Date(),
      });
      return {
        end: ({ output, inputTokens, outputTokens, totalCostUsd }) => {
          gen.end({
            output,
            usage:
              inputTokens != null
                ? {
                    input: inputTokens,
                    output: outputTokens ?? 0,
                    totalCost: totalCostUsd,
                  }
                : undefined,
          });
        },
      };
    },

    startSpan: (name, input) => {
      const span = trace.span({ name, input, startTime: new Date() });
      return {
        end: (output, error) => {
          span.end({ output, statusMessage: error });
        },
      };
    },

    setOutput: (output) => {
      trace.update({ output });
    },

    setMetadata: (metadata) => {
      trace.update({ metadata });
    },

    flush: async () => {
      await lf.flushAsync();
    },
  };
}
