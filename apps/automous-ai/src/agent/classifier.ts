import { ai } from '../config/ai/index';
import { logger } from '../utils/logger';
import type { ClassificationResult } from '../types/agent';

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM = `You are a GitHub issue classifier for an autonomous code-fixing agent.

Analyse the issue and return a JSON object (no markdown, no extra text) with:
{
  "category": "bug" | "ui-bug" | "feature" | "documentation" | "performance" | "security" | "test" | "refactor" | "unknown",
  "strategy":  "code_change" | "test_fix" | "config_change" | "documentation" | "cannot_fix",
  "confidence": <number 0.0-1.0>,
  "reasoning":  "<one sentence>",
  "isActionable": <boolean>,
  "estimatedComplexity": "low" | "medium" | "high",
  "responseType": "fix" | "guide" | "discuss" | "clarify",
  "needsEnvironment": <boolean>
}

responseType rules — pick exactly one:
  "fix"     — AI will write and propose the code change. Use when: clear bug with a deterministic fix,
              test failure, typo, missing null-check, wrong variable, simple config error.
  "guide"   — AI cannot safely apply the change itself but can explain exactly how a contributor
              should fix it. Use when: complex architectural change, requires domain knowledge the AI
              lacks, high-risk refactor, version-compatibility issue requiring manual testing,
              feature that needs design decisions, or fix needs maintainer approval before changing.
  "discuss" — The issue requires a human decision before any code is written. Use when: new major
              feature request, API design discussion, breaking-change proposal, roadmap question,
              "what about version 2" style issues.
  "clarify" — The issue is too vague to act on. Use when: no reproduction steps, missing error
              message, unclear expected vs actual behaviour, duplicate that needs triaging.

isActionable = true when responseType is "fix".

needsEnvironment = true when the fix REQUIRES installing dependencies and running the code to verify.
Set needsEnvironment = true for: runtime crashes, test failures, performance issues, security issues,
  medium/high complexity bugs, UI bugs.
Set needsEnvironment = false for: typos, docs, simple config changes, low-complexity single-line fixes.`;

// ─── Classifier ───────────────────────────────────────────────────────────────

export async function classifyIssue(
  title: string,
  body: string,
  labels: string[],
): Promise<ClassificationResult> {
  const userMessage =
    `Issue Title: ${title}\n\n` +
    `Issue Body:\n${body}\n\n` +
    `Labels: ${labels.join(', ') || 'none'}`;

  try {
    const response = await ai.classify(
      [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userMessage },
      ],
      { maxTokens: 400, temperature: 0.1 },
    );

    // Strip markdown code fences if the model wrapped the JSON despite instructions
    const raw = response.content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    const json = JSON.parse(raw) as ClassificationResult;
    logger.info('Issue classified', {
      title,
      category: json.category,
      isActionable: json.isActionable,
      confidence: json.confidence,
    });

    return json;
  } catch (err: unknown) {
    const e = err as { message: string };
    logger.warn('Classification failed, defaulting to not-actionable', {
      error: e.message,
    });
    return {
      category: 'unknown',
      strategy: 'cannot_fix',
      confidence: 0,
      reasoning: 'Classification failed — requires manual triage',
      isActionable: false,
      estimatedComplexity: 'high',
      responseType: 'guide',
      needsEnvironment: true,
    };
  }
}
