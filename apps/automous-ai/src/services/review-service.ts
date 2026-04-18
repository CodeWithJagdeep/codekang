import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
  getPRFiles,
  getPR,
  createPRReview,
  type PRReviewComment,
} from '../github/api';
import { checkPRReview, consumeReviewCredits } from '../guards/plan-check';

const ai = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

interface ReviewResult {
  summary: string;
  comments: PRReviewComment[];
  verdict: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number,
  installationId?: number,
): Promise<void> {
  logger.info('Starting PR review', { owner, repo, prNumber });

  // Plan / credit gate — silently skip if not allowed
  const planCheck = await checkPRReview(owner, repo);
  if (!planCheck.allowed) {
    logger.info('PR review skipped by plan check', {
      owner,
      repo,
      prNumber,
      reason: planCheck.reason,
    });
    return;
  }

  const [pr, files] = await Promise.all([
    getPR(owner, repo, prNumber, installationId),
    getPRFiles(owner, repo, prNumber, installationId),
  ]);

  if ((pr as any).draft) {
    logger.info('Skipping draft PR', { prNumber });
    return;
  }

  // Build the diff context for Claude
  const diffContext = files
    .filter((f) => f.patch)
    .map(
      (f) =>
        `### ${f.filename} (+${f.additions} -${f.deletions})\n\`\`\`diff\n${f.patch}\n\`\`\``,
    )
    .join('\n\n');

  if (!diffContext) {
    logger.info('No diff to review', { prNumber });
    return;
  }

  const review = await generateReview(
    pr.title,
    pr.body ?? '',
    diffContext,
    files,
  );

  await createPRReview(
    owner,
    repo,
    prNumber,
    pr.head.sha,
    review.summary,
    review.comments,
    review.verdict,
    installationId,
  );

  logger.info('PR review complete', {
    owner,
    repo,
    prNumber,
    verdict: review.verdict,
    inlineComments: review.comments.length,
  });

  if (planCheck.userId) await consumeReviewCredits(planCheck.userId);
}

// ─── Claude-powered review ────────────────────────────────────────────────────

async function generateReview(
  title: string,
  body: string,
  diffContext: string,
  files: { filename: string; patch?: string }[],
): Promise<ReviewResult> {
  const systemPrompt = `You are CodeKang, an expert code reviewer. Review pull requests for:
- Bugs, logic errors, off-by-one errors
- Security issues (injection, auth bypass, exposed secrets)
- Performance problems (N+1 queries, missing indexes, unnecessary loops)
- Code quality (unclear names, missing error handling, dead code)

For each issue, identify the exact file and line number from the diff.

Respond as JSON:
{
  "summary": "Overall review summary (2-3 sentences)",
  "verdict": "APPROVE" | "COMMENT" | "REQUEST_CHANGES",
  "comments": [
    {
      "path": "relative/file/path.ts",
      "line": <line number in the diff>,
      "body": "Specific issue description with suggested fix"
    }
  ]
}

Rules:
- verdict APPROVE if no significant issues
- verdict REQUEST_CHANGES only for bugs or security issues
- verdict COMMENT for style/improvement suggestions
- Limit to at most 10 inline comments — focus on the most important issues
- Only comment on lines that appear in the diff (with + prefix)`;

  const userMessage = `PR: ${title}

${body ? `Description:\n${body}\n\n` : ''}Diff:\n${diffContext}`;

  const response = await ai.messages.create({
    model: env.ANTHROPIC_MODEL_AGENT,
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content.find((b) => b.type === 'text')?.text ?? '{}';

  try {
    // Extract JSON from the response (Claude sometimes wraps in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    const parsed = JSON.parse(jsonMatch[0]) as ReviewResult;

    // Validate files exist in the diff
    const validPaths = new Set(files.map((f) => f.filename));
    const validComments = (parsed.comments ?? []).filter((c) =>
      validPaths.has(c.path),
    );

    return {
      summary: parsed.summary ?? 'Reviewed by CodeKang.',
      verdict: parsed.verdict ?? 'COMMENT',
      comments: validComments.slice(0, 10),
    };
  } catch (err) {
    logger.warn('Failed to parse review JSON, posting summary only', { err });
    return {
      summary: text.slice(0, 500),
      verdict: 'COMMENT',
      comments: [],
    };
  }
}
