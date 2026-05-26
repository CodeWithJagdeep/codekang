import { db } from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
  setupRepo,
  installDependenciesOnHost,
  startDockerContainer,
  installDependencies,
  stopAndRemoveContainer,
  cleanupRepo,
} from '../repo/manager';
import { analyzeRepository } from '../parser/analyzer';
import { indexRepository } from '../vector/indexer';
import { runAgent } from '../agent/index';
import {
  getInstallationToken,
  createIssueComment,
  getPRFiles,
} from '../github/api';
import { checkAutonomousFix, consumeFixCredits } from '../guards/plan-check';
import { loadPRReview, updatePRReviewFixStatus } from './review-service';
import type { FixPRJobData, JobResult } from '../types/queue';
import type { FixContext } from '../types/agent';
import type { ToolContext } from '../agent/tools';

// ─── Main entry point ─────────────────────────────────────────────────────────
// Triggered when the user posts "@codekang fix" on a PR review comment.
// Loads the stored review findings, runs the agent to apply fixes, and opens
// a new PR (kangbot/fix-pr-N) targeting the PR's base branch.

export async function fixPRIssues(data: FixPRJobData): Promise<JobResult> {
  const { owner, repo, prNumber, approvedBy, installationId } = data;

  logger.info('Fix-PR job started', { owner, repo, prNumber, approvedBy });

  // ── 0. Load review from DB ────────────────────────────────────────────────
  const review = await loadPRReview(owner, repo, prNumber);
  if (!review) {
    return { success: false, message: `No review found for PR #${prNumber}` };
  }
  if (review.verdict === 'APPROVE') {
    return { success: false, message: 'PR already approved — nothing to fix' };
  }
  if (review.fix_status === 'running') {
    return { success: false, message: 'Fix is already in progress' };
  }
  if (review.fix_status === 'done') {
    return {
      success: true,
      message: `Already fixed: ${review.fix_pr_url}`,
      data: { prUrl: review.fix_pr_url },
    };
  }

  // ── 1. Plan / credit gate ─────────────────────────────────────────────────
  const planCheck = await checkAutonomousFix(
    owner,
    repo,
    prNumber,
    installationId,
  );
  if (!planCheck.allowed) {
    logger.info('Fix-PR blocked by plan check', { reason: planCheck.reason });
    return {
      success: false,
      message: `Plan check failed: ${planCheck.reason}`,
    };
  }

  await updatePRReviewFixStatus(owner, repo, prNumber, 'running');

  let repoPath: string | undefined;
  let containerId: string | undefined;

  try {
    // ── 2. Clone repo ────────────────────────────────────────────────────────
    const token = installationId
      ? await getInstallationToken(installationId)
      : env.GITHUB_TOKEN;

    const cloneUrl = `https://github.com/${owner}/${repo}.git`;
    logger.info('Cloning repository for PR fix', { owner, repo });
    const ctx = await setupRepo(owner, repo, cloneUrl, token);
    repoPath = ctx.repoPath;

    // Install deps without Docker for code-quality/security fixes
    logger.info('Installing dependencies on host');
    await installDependenciesOnHost(repoPath);

    const needsDocker = review.comments.length > 0;
    if (needsDocker) {
      try {
        containerId = await startDockerContainer(ctx);
        await installDependencies(containerId, repoPath);
      } catch (err) {
        logger.warn('Docker not available — proceeding file-only', {
          error: (err as Error).message,
        });
        containerId = undefined;
      }
    }

    // ── 3. Index codebase ────────────────────────────────────────────────────
    const { rows } = await db.query<{ id: number }>(
      `INSERT INTO repos (owner, name, full_name, default_branch)
       VALUES ($1,$2,$3,'main')
       ON CONFLICT (full_name) DO UPDATE SET indexed_at=NOW()
       RETURNING id`,
      [owner, repo, `${owner}/${repo}`],
    );
    if (!rows[0]) throw new Error('DB upsert returned no rows');
    const repoId = rows[0].id;

    const files = await analyzeRepository(repoPath);
    await indexRepository(repoId, files);

    // ── 4. Build agent context from review findings ──────────────────────────
    const branchName = `kangbot/fix-pr-${prNumber}`;
    const issueTitle = `Fix code review issues from PR #${prNumber}${review.pr_title ? `: ${review.pr_title}` : ''}`;

    const issueBody = buildIssueBodyFromReview(review.summary, review.comments);

    // Fetch changed files so the agent can run only related tests
    let changedFiles: string[] = [];
    try {
      const prFiles = await getPRFiles(owner, repo, prNumber, installationId);
      changedFiles = prFiles
        .filter((f) => f.status !== 'removed')
        .map((f) => f.filename);
    } catch (err) {
      logger.warn('Failed to fetch PR files — agent will run full test suite', {
        owner,
        repo,
        prNumber,
        error: (err as Error).message,
      });
    }

    const fixContext: FixContext = {
      issueNumber: prNumber,
      issueTitle,
      issueBody,
      repoOwner: owner,
      repoName: repo,
      repoPath,
      branchName,
      classification: {
        category: 'bug',
        strategy: 'code_change',
        confidence: 0.9,
        reasoning:
          'AI review identified specific issues with file/line context',
        isActionable: true,
        estimatedComplexity: 'medium',
        needsEnvironment: !!containerId,
        responseType: 'fix',
      },
      changedFiles,
    };

    const toolContext: ToolContext = {
      owner,
      repo,
      token,
      installationId,
      defaultBranch: 'main',
      repoPath,
      repoId,
      containerId,
      issueNumber: prNumber,
      issueTitle,
      branchName,
      cloneReady: true,
      sandboxReady: !!containerId,
      changedFiles,
    };

    // ── 5. Run autonomous agent (analyze → fix → open_pr) ──────────────────
    logger.info('Starting fix agent for PR review', { prNumber, branchName });
    const result = await runAgent(fixContext, toolContext, 'autonomous');

    logger.info('Fix agent done', {
      prUrl: result.prUrl,
      filesModified: result.filesModified.length,
      costUsd: result.totalCost?.toFixed(5),
    });

    if (result.prUrl) {
      await createIssueComment(
        owner,
        repo,
        prNumber,
        buildFixComment(result.prUrl, result.summary, approvedBy),
        installationId,
      ).catch(() => {});

      await updatePRReviewFixStatus(
        owner,
        repo,
        prNumber,
        'done',
        result.prUrl,
        branchName,
      );

      if (planCheck.userId) await consumeFixCredits(planCheck.userId);

      return {
        success: true,
        message: `Fix PR created: ${result.prUrl}`,
        data: { prUrl: result.prUrl },
      };
    }

    await updatePRReviewFixStatus(owner, repo, prNumber, 'failed');
    await createIssueComment(
      owner,
      repo,
      prNumber,
      '❌ CodeKang could not automatically apply fixes. Please review the findings and fix manually.',
      installationId,
    ).catch(() => {});

    return { success: false, message: 'Agent did not produce a PR' };
  } catch (err: unknown) {
    const e = err as { message: string };
    logger.error('Fix-PR error', { owner, repo, prNumber, error: e.message });
    await updatePRReviewFixStatus(owner, repo, prNumber, 'failed');
    try {
      await createIssueComment(
        owner,
        repo,
        prNumber,
        `❌ CodeKang encountered an error while applying fixes: ${e.message}`,
        installationId,
      );
    } catch {
      /* best-effort */
    }
    return { success: false, message: e.message };
  } finally {
    if (containerId) await stopAndRemoveContainer(containerId);
    if (repoPath) cleanupRepo(repoPath);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildIssueBodyFromReview(
  summary: string,
  comments: Array<{ path: string; line: number; body: string }>,
): string {
  const lines = [
    `## Code Review Findings`,
    ``,
    `**Summary:** ${summary}`,
    ``,
    `## Issues to Fix`,
    ``,
  ];

  if (comments.length === 0) {
    lines.push(summary);
  } else {
    comments.forEach((c, i) => {
      lines.push(`### Issue ${i + 1}: \`${c.path}\` (line ${c.line})`);
      lines.push(c.body);
      lines.push('');
    });
  }

  lines.push(
    '## Instructions',
    '',
    'Fix ALL of the issues listed above. For each issue:',
    '1. Open the file at the specified path',
    '2. Fix the problem described at the given line',
    '3. Ensure no regressions are introduced',
    '4. Commit the changes and open a pull request',
  );

  return lines.join('\n');
}

function buildFixComment(
  prUrl: string,
  summary: string,
  approvedBy: string,
): string {
  return [
    `## ✅ Fixes Applied`,
    ``,
    `@${approvedBy} — CodeKang has automatically fixed the review findings.`,
    ``,
    `**Summary:** ${summary}`,
    ``,
    `**Fix PR:** ${prUrl}`,
    ``,
    `---`,
    `*Automatically generated by [CodeKang](https://codekang.com)*`,
  ].join('\n');
}
