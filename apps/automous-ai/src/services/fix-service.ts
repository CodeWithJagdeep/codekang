import { db } from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
  setupRepo,
  startDockerContainer,
  installDependenciesOnHost,
  installDependencies,
  runTests,
  stopAndRemoveContainer,
  cleanupRepo,
} from '../repo/manager';
import { analyzeRepository } from '../parser/analyzer';
import { indexRepository } from '../vector/indexer';
import { classifyIssue } from '../agent/classifier';
import { runAgent } from '../agent/index';
import { createPullRequestForFix } from './pr-service';
import { postFixComment } from './comment-service';
import { postGuidanceResponse } from './guidance-service';
import {
  extractStructuredProposal,
  loadPendingProposal,
  markProposalStatus,
} from './proposal-service';
import {
  recordSuccessfulFix,
  findSimilarFixes,
  buildLearningContext,
} from './learning-service';
import { getInstallationToken, createIssueComment } from '../github/api';
import { generateBranchName } from '../utils/helper';
import { checkAutonomousFix, consumeFixCredits } from '../guards/plan-check';
import type { FixJobData, ExecuteFixJobData, JobResult } from '../types/queue';
import type { FixContext } from '../types/agent';
import type { ToolContext } from '../agent/tools';

// ─── Phase 1: Propose ─────────────────────────────────────────────────────────
// Triggered by issues.opened — analyze the issue and post a structured proposal
// asking the contributor to confirm before the agent touches any code.

export async function proposeFixJob(data: FixJobData): Promise<JobResult> {
  const { owner, repo, issueNumber, issueTitle, issueBody, installationId } =
    data;

  logger.info('Fix job started', { owner, repo, issueNumber });

  // ── 0. Plan / credit gate ─────────────────────────────────────────────────
  const planCheck = await checkAutonomousFix(
    owner,
    repo,
    issueNumber,
    installationId,
  );
  if (!planCheck.allowed) {
    logger.info('Fix job blocked by plan check', {
      owner,
      repo,
      issueNumber,
      reason: planCheck.reason,
    });
    return {
      success: false,
      message: `Plan check failed: ${planCheck.reason}`,
    };
  }

  let repoPath: string | undefined;
  let containerId: string | undefined;

  try {
    // ── 1. Classify ────────────────────────────────────────────────────────
    const classification = await classifyIssue(issueTitle, issueBody, []);

    logger.info('✅ Issue classified', {
      category: classification.category,
      strategy: classification.strategy,
      complexity: classification.estimatedComplexity,
      confidence: classification.confidence,
      responseType: classification.responseType,
    });

    // ── 1b. Route all fixable issues directly to autonomous agent ─────────
    if (classification.responseType === 'fix') {
      logger.info('🚀 Routing to autonomous agent', {
        issueNumber,
        confidence: classification.confidence,
        complexity: classification.estimatedComplexity,
      });

      await createIssueComment(
        owner,
        repo,
        issueNumber,
        `On it — analyzing and fixing issue #${issueNumber}. I'll open a PR when done.`,
        installationId,
      );

      const fixResult = await runAutonomousFixJob(data, classification, planCheck.userId ?? undefined, data.jobId);
      if (fixResult.success && planCheck.userId) {
        await consumeFixCredits(planCheck.userId);
      }
      return fixResult;
    }

    // ── 1c. Route: clarify / discuss — post immediately, no code analysis needed
    if (
      classification.responseType === 'clarify' ||
      classification.responseType === 'discuss'
    ) {
      logger.info('Posting response without code analysis', {
        issueNumber,
        responseType: classification.responseType,
      });
      await postGuidanceResponse(
        owner,
        repo,
        issueNumber,
        issueTitle,
        issueBody,
        classification,
        undefined,
        installationId,
      );
      return {
        success: true,
        message: `Responded with ${classification.responseType}`,
      };
    }

    // ── 2. Clone + environment ─────────────────────────────────────────────
    const token = installationId
      ? await getInstallationToken(installationId)
      : env.GITHUB_TOKEN;

    const cloneUrl = `https://github.com/${owner}/${repo}.git`;
    logger.info('📦 Cloning repository...', { owner, repo, cloneUrl });
    const ctx = await setupRepo(owner, repo, cloneUrl, token);
    repoPath = ctx.repoPath;
    logger.info('📦 Repository ready', { repoPath });

    if (classification.needsEnvironment) {
      logger.info('🐳 Issue requires execution — starting Docker sandbox...', {
        reason: classification.reasoning,
        complexity: classification.estimatedComplexity,
      });

      logger.info('📥 Installing dependencies on host...', { repoPath });
      const hostDepOutput = await installDependenciesOnHost(repoPath);
      if (
        hostDepOutput.toLowerCase().includes('npm err') ||
        /error: /i.test(hostDepOutput)
      ) {
        logger.warn('Host dependency installation had errors', {
          owner,
          repo,
          preview: hostDepOutput.slice(0, 300),
        });
      }

      containerId = await startDockerContainer(ctx);
      logger.info('🐳 Docker sandbox running', { containerId });

      logger.info('📥 Verifying dependencies inside container...', {
        repoPath,
      });
      const depOutput = await installDependencies(containerId, repoPath);
      if (
        depOutput.toLowerCase().includes('error') ||
        depOutput.toLowerCase().includes('npm err')
      ) {
        logger.warn('Dependency installation had errors', {
          owner,
          repo,
          preview: depOutput.slice(0, 300),
        });
      } else {
        logger.info('📥 Dependencies installed successfully');
      }
    } else {
      logger.info(
        '⚡ Simple fix — skipping Docker sandbox (no execution needed)',
        {
          reason: classification.reasoning,
          complexity: classification.estimatedComplexity,
        },
      );
    }

    // ── 3. Index codebase ──────────────────────────────────────────────────
    const { rows } = await db.query<{ id: number }>(
      `INSERT INTO repos (owner, name, full_name, default_branch)
       VALUES ($1, $2, $3, 'main')
       ON CONFLICT (full_name)
       DO UPDATE SET indexed_at = NOW()
       RETURNING id`,
      [owner, repo, `${owner}/${repo}`],
    );
    if (!rows[0]) throw new Error('DB upsert for repo returned no rows');
    const repoId = rows[0].id;

    logger.info('🔍 Analyzing and indexing codebase...', { repoId });
    const files = await analyzeRepository(repoPath);
    await indexRepository(repoId, files);
    logger.info('🔍 Codebase indexed', { files: files.length, repoId });

    // ── 4. Analysis pass ───────────────────────────────────────────────────
    logger.info('🤖 Starting analysis agent...', { issueNumber, issueTitle });
    const branchName = generateBranchName(issueNumber, issueTitle);
    const fixContext: FixContext = {
      issueNumber,
      issueTitle,
      issueBody,
      repoOwner: owner,
      repoName: repo,
      repoPath,
      branchName,
      classification,
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
      issueNumber,
      issueTitle,
      branchName,
      cloneReady: true,
      sandboxReady: !!containerId,
    };

    const analysis = await runAgent(fixContext, toolContext, 'analyze');
    logger.info('🤖 Analysis agent done', {
      success: analysis.success,
      steps: analysis.steps.length,
      filesModified: analysis.filesModified.length,
      costUsd: analysis.totalCost?.toFixed(5),
    });

    // ── 5. Extract structured proposal ────────────────────────────────────
    logger.info('📝 Extracting structured proposal...');
    await extractStructuredProposal(analysis.summary, issueTitle, issueBody);

    // ── 6. Post guidance (only guide responses reach here — fix/clarify/discuss route earlier)
    {
      await postGuidanceResponse(
        owner,
        repo,
        issueNumber,
        issueTitle,
        issueBody,
        classification,
        analysis.summary,
        installationId,
      );

      return {
        success: true,
        message: `Indexed & analyzed — posted technical ${classification.responseType} response`,
      };
    }
  } catch (err: unknown) {
    const e = err as { message: string };
    logger.error('Propose job error', {
      owner,
      repo,
      issueNumber,
      error: e.message,
    });
    return { success: false, message: e.message };
  } finally {
    if (containerId) await stopAndRemoveContainer(containerId);
    if (repoPath) cleanupRepo(repoPath);
  }
}

// ─── Phase 2: Execute ─────────────────────────────────────────────────────────
// Triggered when a contributor replies "@codekang fix" on the proposal comment.
// Loads the saved proposal, re-clones, applies the fix, runs tests, opens PR.

export async function executeApprovedFix(
  data: ExecuteFixJobData,
): Promise<JobResult> {
  const { owner, repo, issueNumber } = data;

  logger.info('Execute fix job started', { owner, repo, issueNumber });

  // ── 0. Plan / credit gate ─────────────────────────────────────────────────
  const planCheck = await checkAutonomousFix(
    owner,
    repo,
    issueNumber,
    data.installationId,
  );
  if (!planCheck.allowed) {
    logger.info('Execute fix blocked by plan check', {
      owner,
      repo,
      issueNumber,
      reason: planCheck.reason,
    });
    return {
      success: false,
      message: `Plan check failed: ${planCheck.reason}`,
    };
  }

  let repoPath: string | undefined;
  let containerId: string | undefined;
  let installationId: number | undefined;
  let pendingId: number | undefined;

  try {
    // ── 1. Load pending proposal ───────────────────────────────────────────
    const pending = await loadPendingProposal(owner, repo, issueNumber);
    if (!pending) {
      return {
        success: false,
        message: 'No pending proposal found — nothing to execute',
      };
    }
    pendingId = pending.id;
    await markProposalStatus(pending.id, 'executing');

    installationId = pending.installationId;

    // ── 2. Clone + environment ─────────────────────────────────────────────
    const token = installationId
      ? await getInstallationToken(installationId)
      : env.GITHUB_TOKEN;

    const cloneUrl = `https://github.com/${owner}/${repo}.git`;
    logger.info('📦 Cloning repository...', { owner, repo });
    const ctx = await setupRepo(owner, repo, cloneUrl, token);
    repoPath = ctx.repoPath;
    logger.info('📦 Repository ready', { repoPath });

    logger.info('📥 Installing dependencies on host...', { repoPath });
    const hostDepOutput = await installDependenciesOnHost(repoPath);
    if (
      hostDepOutput.toLowerCase().includes('npm err') ||
      /error: /i.test(hostDepOutput)
    ) {
      logger.warn('Host dependency installation had errors', {
        owner,
        repo,
        preview: hostDepOutput.slice(0, 300),
      });
    }

    logger.info('🐳 Starting Docker sandbox...', { owner, repo });
    containerId = await startDockerContainer(ctx);
    logger.info('🐳 Docker sandbox running', { containerId });

    logger.info('📥 Verifying dependencies inside container...', { repoPath });
    const depOutput = await installDependencies(containerId, repoPath);
    if (
      depOutput.toLowerCase().includes('npm err') ||
      /error: /i.test(depOutput)
    ) {
      logger.error('Dependency installation failed', {
        owner,
        repo,
        output: depOutput.slice(0, 500),
      });
      await postFixComment(
        owner,
        repo,
        issueNumber,
        {
          success: false,
          message: `Dependency installation failed before fix could run:\n\`\`\`\n${depOutput.slice(0, 800)}\n\`\`\``,
        },
        installationId,
      );
      return { success: false, message: 'Dependency installation failed' };
    } else {
      logger.info('📥 Dependencies installed successfully');
    }

    // ── 3. Re-index ────────────────────────────────────────────────────────
    const { rows } = await db.query<{ id: number }>(
      `INSERT INTO repos (owner, name, full_name, default_branch)
       VALUES ($1, $2, $3, 'main')
       ON CONFLICT (full_name)
       DO UPDATE SET indexed_at = NOW()
       RETURNING id`,
      [owner, repo, `${owner}/${repo}`],
    );
    if (!rows[0]) throw new Error('DB upsert returned no rows');
    const repoId = rows[0].id;

    logger.info('🔍 Re-indexing codebase...', { repoId });
    const files = await analyzeRepository(repoPath);
    await indexRepository(repoId, files);
    logger.info('🔍 Codebase indexed', { files: files.length, repoId });

    // ── 4. Load cross-issue learning patterns ──────────────────────────────
    const similarFixes = await findSimilarFixes(
      pending.category,
      pending.strategy,
    );
    const learningContext = buildLearningContext(similarFixes);

    // ── 5. Fix pass (up to 2 attempts) ────────────────────────────────────
    logger.info('🤖 Starting fix agent...', {
      issueNumber,
      issueTitle: pending.issueTitle,
    });
    const branchName = generateBranchName(issueNumber, pending.issueTitle);
    const toolContext: ToolContext = {
      owner,
      repo,
      token,
      installationId,
      defaultBranch: 'main',
      repoPath,
      repoId,
      containerId,
      issueNumber,
      issueTitle: pending.issueTitle,
      branchName,
      cloneReady: true,
      sandboxReady: !!containerId,
    };

    let fixContext: FixContext = {
      issueNumber,
      issueTitle: pending.issueTitle,
      issueBody: pending.issueBody,
      repoOwner: owner,
      repoName: repo,
      repoPath,
      branchName,
      classification: {
        category: pending.category as any,
        strategy: pending.strategy as any,
        confidence: pending.confidence,
        reasoning: '',
        isActionable: true,
        estimatedComplexity: pending.complexity as any,
        needsEnvironment: pending.needsEnvironment ?? true,
        responseType: 'fix' as const,
      },
      analysisSummary: pending.analysis,
      learningContext: learningContext || undefined,
      userId: planCheck.userId ?? undefined,
      jobId: data.jobId,
    };

    const MAX_FIX_ATTEMPTS = 2;
    let fixResult = await runAgent(fixContext, toolContext, 'fix');
    logger.info('🤖 Fix agent done (attempt 1)', {
      success: fixResult.success,
      steps: fixResult.steps.length,
      filesModified: fixResult.filesModified,
      costUsd: fixResult.totalCost?.toFixed(5),
    });
    let passed = false;
    let testOutput = '';

    for (let attempt = 1; attempt <= MAX_FIX_ATTEMPTS; attempt++) {
      if (fixResult.filesModified.length === 0) {
        await postFixComment(
          owner,
          repo,
          issueNumber,
          {
            success: false,
            message: 'Agent completed without modifying any files.',
          },
          installationId,
        );
        await markProposalStatus(pending.id, 'rejected');
        return { success: false, message: 'No files modified' };
      }

      logger.info(`🧪 Running test suite (attempt ${attempt})...`, {
        containerId,
      });
      ({ output: testOutput, passed } = await runTests(containerId, repoPath));
      logger.info(
        `🧪 Tests ${passed ? 'PASSED ✅' : 'FAILED ❌'} (attempt ${attempt})`,
        {
          preview: testOutput.slice(0, 400),
        },
      );

      if (passed) break;

      if (attempt < MAX_FIX_ATTEMPTS) {
        logger.warn('Tests failed — retrying fix with test output as context', {
          attempt,
          owner,
          repo,
          issueNumber,
        });
        fixContext = { ...fixContext, priorTestFailure: testOutput };
        fixResult = await runAgent(fixContext, toolContext, 'fix');
        logger.info(`🤖 Fix agent done (attempt ${attempt + 1})`, {
          success: fixResult.success,
          steps: fixResult.steps.length,
          filesModified: fixResult.filesModified,
          costUsd: fixResult.totalCost?.toFixed(5),
        });
      }
    }

    if (!passed) {
      await postFixComment(
        owner,
        repo,
        issueNumber,
        {
          success: false,
          message:
            'Fix applied but the test suite did not pass after 2 attempts. Manual review needed.',
          testOutput,
        },
        installationId,
      );
      await markProposalStatus(pending.id, 'rejected');
      return { success: false, message: 'Tests failed after fix' };
    }

    // ── 6. Push branch & open PR ───────────────────────────────────────────
    const pr = await createPullRequestForFix(
      owner,
      repo,
      repoPath,
      branchName,
      'main',
      issueNumber,
      pending.issueTitle,
      fixResult.summary,
      installationId,
    );

    await postFixComment(
      owner,
      repo,
      issueNumber,
      {
        success: true,
        message: fixResult.summary,
        prUrl: pr.html_url,
      },
      installationId,
    );

    await markProposalStatus(pending.id, 'done');

    // ── 7. Record for cross-issue learning ────────────────────────────────
    await recordSuccessfulFix(
      owner,
      repo,
      issueNumber,
      {
        category: pending.category as any,
        strategy: pending.strategy as any,
        confidence: pending.confidence,
        reasoning: '',
        isActionable: true,
        estimatedComplexity: pending.complexity as any,
        needsEnvironment: pending.needsEnvironment ?? true,
        responseType: 'fix' as const,
      },
      fixResult.filesModified,
      fixResult.summary,
      pending.analysis,
      pr.html_url,
    );

    logger.info('Fix job complete', {
      owner,
      repo,
      issueNumber,
      pr: pr.html_url,
    });
    if (planCheck.userId) await consumeFixCredits(planCheck.userId);
    return {
      success: true,
      message: `PR created: ${pr.html_url}`,
      data: { prUrl: pr.html_url },
    };
  } catch (err: unknown) {
    const e = err as { message: string };
    logger.error('Execute fix error', {
      owner,
      repo,
      issueNumber,
      error: e.message,
    });

    if (pendingId) {
      await markProposalStatus(pendingId, 'rejected').catch(() => {});
    }

    try {
      await postFixComment(
        owner,
        repo,
        issueNumber,
        {
          success: false,
          message: e.message,
        },
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

// ─── Autonomous Fix: progressive escalation, retry up to 3 attempts ──────────
// Agent starts with lightweight GitHub API tools.
// It decides when to clone (request_clone) and when to spin up Docker (request_sandbox).
// Simple fixes: API read → API commit → PR (~5 steps, no clone, ~10s)
// Complex fixes: clone → search → fix → sandbox → tests → PR (~20 steps, ~5min)

export async function runAutonomousFixJob(
  data: FixJobData,
  existingClassification?: Awaited<ReturnType<typeof classifyIssue>>,
  userId?: string,
  jobId?: string,
): Promise<JobResult> {
  const { owner, repo, issueNumber, issueTitle, issueBody, installationId } = data;

  logger.info('Autonomous fix job started (progressive mode)', { owner, repo, issueNumber });

  const classification =
    existingClassification ?? (await classifyIssue(issueTitle, issueBody, []));

  const token = installationId
    ? await getInstallationToken(installationId)
    : env.GITHUB_TOKEN;

  const branchName = generateBranchName(issueNumber, issueTitle);
  const cloneUrl = `https://github.com/${owner}/${repo}.git`;

  const learningContext = buildLearningContext(
    await findSimilarFixes(classification.category, classification.strategy),
  );

  const MAX_ATTEMPTS = 3;
  const priorAttempts: Array<{ summary: string; testOutput: string }> = [];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    logger.info(`🤖 Autonomous agent — attempt ${attempt}/${MAX_ATTEMPTS}`, { issueNumber });

    // Per-attempt cleanup tracking
    let currentRepoPath: string | undefined;
    let currentContainerId: string | undefined;

    const toolContext: ToolContext = {
      // GitHub API context — always available
      owner,
      repo,
      token,
      installationId,
      defaultBranch: 'main',
      issueNumber,
      issueTitle,
      branchName,
      // Start with no clone, no sandbox
      cloneReady: false,
      sandboxReady: false,
      // On-demand clone: agent calls request_clone when it decides it needs it
      onRequestClone: async () => {
        logger.info('🔀 Agent-requested clone starting', { owner, repo });
        const ctx = await setupRepo(owner, repo, cloneUrl, token);
        currentRepoPath = ctx.repoPath;
        await installDependenciesOnHost(currentRepoPath);
        const { rows } = await db.query<{ id: number }>(
          `INSERT INTO repos (owner, name, full_name, default_branch)
           VALUES ($1, $2, $3, 'main')
           ON CONFLICT (full_name) DO UPDATE SET indexed_at = NOW()
           RETURNING id`,
          [owner, repo, `${owner}/${repo}`],
        );
        if (!rows[0]) throw new Error('DB upsert returned no rows');
        const repoId = rows[0].id;
        const files = await analyzeRepository(currentRepoPath);
        await indexRepository(repoId, files);
        logger.info('✅ Clone + index complete', { owner, repo, repoPath: currentRepoPath });
        return { repoPath: currentRepoPath, repoId };
      },
      // On-demand sandbox: agent calls request_sandbox when it needs to run code
      onRequestSandbox: async () => {
        if (!toolContext.repoPath) throw new Error('Must clone before requesting sandbox');
        logger.info('🐳 Agent-requested Docker sandbox starting', { owner, repo });
        const repoCtx = { repoPath: toolContext.repoPath, owner, repo };
        const cid = await startDockerContainer(repoCtx);
        currentContainerId = cid;
        await installDependencies(cid, toolContext.repoPath);
        logger.info('✅ Docker sandbox ready', { containerId: cid });
        return { containerId: cid };
      },
    };

    const fixContext: FixContext = {
      issueNumber,
      issueTitle,
      issueBody,
      repoOwner: owner,
      repoName: repo,
      // repoPath intentionally omitted — agent gets it via request_clone if needed
      branchName,
      classification,
      learningContext: learningContext || undefined,
      priorAttempts: priorAttempts.length > 0 ? [...priorAttempts] : undefined,
      userId,
      jobId,
    };

    let result;
    try {
      result = await runAgent(fixContext, toolContext, 'autonomous', attempt);
    } finally {
      // Clean up resources this attempt allocated
      if (currentContainerId) await stopAndRemoveContainer(currentContainerId).catch(() => {});
      if (currentRepoPath) cleanupRepo(currentRepoPath);
    }

    logger.info(`🤖 Autonomous agent done (attempt ${attempt})`, {
      prUrl: result.prUrl,
      filesModified: result.filesModified.length,
      cloneUsed: toolContext.cloneReady,
      sandboxUsed: toolContext.sandboxReady,
      costUsd: result.totalCost?.toFixed(5),
    });

    if (result.prUrl) {
      await postFixComment(owner, repo, issueNumber, {
        success: true,
        message: result.summary,
        prUrl: result.prUrl,
      }, installationId);
      await recordSuccessfulFix(
        owner, repo, issueNumber, classification,
        result.filesModified, result.summary, '', result.prUrl,
      );
      return { success: true, message: `PR created: ${result.prUrl}`, data: { prUrl: result.prUrl } };
    }

    if (attempt < MAX_ATTEMPTS) {
      logger.warn(`Attempt ${attempt} produced no PR — retrying`, { issueNumber });
      priorAttempts.push({
        summary: result.summary,
        testOutput: result.lastTestOutput ?? 'No test output captured',
      });
    }
  }

  await postFixComment(owner, repo, issueNumber, {
    success: false,
    message: `Tried ${MAX_ATTEMPTS} different strategies — none produced a passing fix. Manual review needed.`,
  }, installationId);

  return { success: false, message: `All ${MAX_ATTEMPTS} autonomous attempts failed` };
}
