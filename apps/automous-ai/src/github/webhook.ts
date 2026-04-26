import crypto from 'crypto';
import { env } from '../config/env';
import type { GitHubWebhookPayload } from '../types/github';
import { WebhookError } from '../utils/errors';
import { logger } from '../utils/logger';

// ─── Signature Verification ───────────────────────────────────────────────────

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  if (!env.GITHUB_WEBHOOK_SECRET) {
    logger.error('GITHUB_WEBHOOK_SECRET is not set');
    return false;
  }

  const hmac = crypto.createHmac('sha256', env.GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(rawBody).digest('hex');

  try {
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(digest, 'utf8'),
      Buffer.from(signature, 'utf8'),
    );
    if (!isMatch) {
      logger.warn('Webhook signature mismatch', {
        digestPrefix: digest.slice(0, 15) + '...',
        signaturePrefix: signature.slice(0, 15) + '...',
      });
    }
    return isMatch;
  } catch (err: unknown) {
    logger.error('Error during signature verification', {
      error: (err as Error).message,
      digestLen: digest.length,
      signatureLen: signature.length,
    });
    return false;
  }
}

// ─── Payload Parsing ──────────────────────────────────────────────────────────

export function parseWebhookPayload(
  rawBody: string,
  signature: string,
): GitHubWebhookPayload {
  if (!verifyWebhookSignature(rawBody, signature)) {
    throw new WebhookError('Invalid webhook signature');
  }
  try {
    return JSON.parse(rawBody) as GitHubWebhookPayload;
  } catch {
    throw new WebhookError('Invalid JSON payload');
  }
}

// ─── Event Filtering ──────────────────────────────────────────────────────────

export function isActionableIssueEvent(payload: GitHubWebhookPayload): boolean {
  return payload.action === 'opened' || payload.action === 'labeled';
}

// Detects contributor approval comments like:
//   /fix   @codekangai fix   @codekang fix   lgtm fix
const APPROVAL_PATTERNS = [
  /^\/fix\s*$/i,
  /@codekangai\s+(fix|go|proceed|apply)/i,
  /@codekang\s+(fix|go|proceed|apply)/i,
  /^lgtm[\s,!]*(fix|go|proceed)?/i,
  /^approve\s*$/i,
];

export function isApprovalComment(payload: GitHubWebhookPayload): boolean {
  if (payload.action !== 'created') return false;
  if (!payload.comment || !payload.issue) return false;
  // Exclude comments on PRs — those are handled by isPRApprovalComment
  if (payload.issue.pull_request) return false;
  // Ignore the bot's own comments to prevent self-triggering
  const commenter = payload.comment.user.login;
  if (
    commenter.endsWith('[bot]') ||
    commenter.toLowerCase().includes('codekang')
  )
    return false;
  const body = payload.comment.body.trim();
  return APPROVAL_PATTERNS.some((p) => p.test(body));
}

// Detects "@codekang fix" comments posted on a pull request (not a plain issue).
export function isPRApprovalComment(payload: GitHubWebhookPayload): boolean {
  if (payload.action !== 'created') return false;
  if (!payload.comment || !payload.issue) return false;
  // Must be a comment on a PR
  if (!payload.issue.pull_request) return false;
  // Ignore bot's own comments
  const commenter = payload.comment.user.login;
  if (
    commenter.endsWith('[bot]') ||
    commenter.toLowerCase().includes('codekang')
  )
    return false;
  const body = payload.comment.body.trim();
  return APPROVAL_PATTERNS.some((p) => p.test(body));
}

export function extractCommentContext(payload: GitHubWebhookPayload): {
  owner: string;
  repo: string;
  issueNumber: number;
  commenterLogin: string;
  installationId: number | undefined;
} {
  const { repository, comment, issue, installation } = payload;
  if (!comment || !issue)
    throw new WebhookError('Missing comment or issue in payload');
  return {
    owner: repository.owner.login,
    repo: repository.name,
    issueNumber: issue.number,
    commenterLogin: comment.user.login,
    installationId: installation?.id,
  };
}

export function extractIssueContext(payload: GitHubWebhookPayload): {
  owner: string;
  repo: string;
  issueNumber: number;
  issueTitle: string;
  issueBody: string;
  cloneUrl: string;
  defaultBranch: string;
  installationId: number | undefined;
} {
  const { issue, repository, installation } = payload;
  if (!issue) {
    throw new WebhookError('Webhook payload does not contain an issue');
  }
  return {
    owner: repository.owner.login,
    repo: repository.name,
    issueNumber: issue.number,
    issueTitle: issue.title,
    issueBody: issue.body ?? '',
    cloneUrl: repository.clone_url,
    defaultBranch: repository.default_branch,
    installationId: installation?.id,
  };
}
