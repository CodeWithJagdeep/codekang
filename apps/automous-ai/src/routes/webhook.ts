import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import {
  parseWebhookPayload,
  isActionableIssueEvent,
  extractIssueContext,
  isApprovalComment,
  isPRApprovalComment,
  extractCommentContext,
} from '../github/webhook';
import { indexQueue, fixQueue, executeFixQueue, fixPRQueue } from '../queue/index';
import { reviewPullRequest } from '../services/review-service';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const webhookLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const router = Router();

router.post('/', webhookLimiter, async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['x-hub-signature-256'] as string | undefined;
  const event = req.headers['x-github-event'] as string | undefined;

  if (!signature) {
    res.status(401).json({ error: 'Missing x-hub-signature-256 header' });
    return;
  }

  const reqWithRaw = req as Request & { rawBody?: string };
  const rawBody: string = reqWithRaw.rawBody ?? JSON.stringify(req.body);

  if (!reqWithRaw.rawBody) {
    logger.warn(
      'Webhook: rawBody not captured by middleware, falling back to JSON.stringify',
    );
  } else {
    logger.debug('Webhook: using captured rawBody for verification');
  }

  let payload;
  try {
    payload = parseWebhookPayload(rawBody, signature);
  } catch (err: unknown) {
    const e = err as { message: string };
    logger.warn('Webhook rejected', { error: e.message });
    res.status(400).json({ error: e.message });
    return;
  }

  logger.info('Webhook received', {
    event,
    action: payload.action,
    repo: payload.repository.full_name,
  });

  // ── Issue opened/labeled → analyze + post proposal ───────────────────────
  if (event === 'issues' && isActionableIssueEvent(payload)) {
    const ctx = extractIssueContext(payload);

    await indexQueue.add(
      'index-repo',
      {
        owner: ctx.owner,
        repo: ctx.repo,
        installationId: ctx.installationId ?? 0,
        triggeredBy: 'webhook',
      },
      { jobId: `index-${ctx.owner}-${ctx.repo}` },
    );

    await fixQueue.add('fix-issue', {
      owner: ctx.owner,
      repo: ctx.repo,
      issueNumber: ctx.issueNumber,
      issueTitle: ctx.issueTitle,
      issueBody: ctx.issueBody,
      installationId: ctx.installationId ?? 0,
      triggeredAt: new Date().toISOString(),
    });

    logger.info('Jobs queued', {
      owner: ctx.owner,
      repo: ctx.repo,
      issue: ctx.issueNumber,
    });
  }

  // ── Contributor posts @codekang fix → execute the approved proposal ──────
  if (event === 'issue_comment' && isApprovalComment(payload)) {
    const ctx = extractCommentContext(payload);

    logger.info('Approval comment detected — queuing execute-fix job', {
      owner: ctx.owner,
      repo: ctx.repo,
      issueNumber: ctx.issueNumber,
      approvedBy: ctx.commenterLogin,
    });

    await executeFixQueue.add('execute-fix', {
      owner: ctx.owner,
      repo: ctx.repo,
      issueNumber: ctx.issueNumber,
      approvedBy: ctx.commenterLogin,
      installationId: ctx.installationId,
      triggeredAt: new Date().toISOString(),
    });
  }

  // ── PR comment with approval → fix the review issues ────────────────────
  if (event === 'issue_comment' && isPRApprovalComment(payload)) {
    const ctx = extractCommentContext(payload);

    logger.info('PR approval comment — queuing fix-PR job', {
      owner: ctx.owner,
      repo: ctx.repo,
      prNumber: ctx.issueNumber,
      approvedBy: ctx.commenterLogin,
    });

    await fixPRQueue.add('fix-pr', {
      owner: ctx.owner,
      repo: ctx.repo,
      prNumber: ctx.issueNumber,
      approvedBy: ctx.commenterLogin,
      installationId: ctx.installationId,
      triggeredAt: new Date().toISOString(),
    });
  }

  // ── PR opened/reopened/synchronized → review with inline comments ─────────
  if (
    event === 'pull_request' &&
    (payload.action === 'opened' ||
      payload.action === 'synchronize' ||
      payload.action === 'reopened') &&
    payload.pull_request &&
    !payload.pull_request.draft
  ) {
    const pr = payload.pull_request;
    const installationId = payload.installation?.id;
    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;
    const prNumber = pr.number;

    logger.info('PR event — queuing review', {
      owner,
      repo,
      prNumber,
      action: payload.action,
      draft: pr.draft,
      base: pr.base.ref,
    });

    // Fire-and-forget; don't block the webhook response
    reviewPullRequest(owner, repo, prNumber, installationId, {
      webhookAction: payload.action as 'opened' | 'synchronize' | 'reopened',
      isDraft: pr.draft,
      targetBranch: pr.base.ref,
    }).catch(
      (err: unknown) => {
        const e = err as { message: string };
        logger.error('PR review failed', {
          owner,
          repo,
          prNumber,
          error: e.message,
        });
      },
    );
  }

  // ── PR merged → re-index so vector store reflects the new codebase ──────────
  if (
    event === 'pull_request' &&
    payload.action === 'closed' &&
    payload.pull_request?.merged
  ) {
    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;
    const installationId = payload.installation?.id;

    logger.info('PR merged — queuing re-index', { owner, repo });

    await indexQueue.add(
      'index-repo',
      {
        owner,
        repo,
        installationId: installationId ?? 0,
        triggeredBy: 'pr-merged',
      },
      { jobId: `index-${owner}-${repo}` },
    );
  }

  res.status(200).json({ received: true });
});

export default router;
