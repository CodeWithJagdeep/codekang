import { db } from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
  setupRepo,
  startDockerContainer,
  installDependenciesOnHost,
  installDependencies,
  runTests,
  runInContainer,
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
  savePendingProposal,
  postProposalComment,
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

// Issues with confidence ≥ this threshold AND simple complexity skip the human gate.
const AUTO_APPROVE_CONFIDENCE = 0.9;

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

      const fixResult = await runAutonomousFixJob(data, classification);
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
    const toolContext: ToolContext = { repoPath, repoId, containerId };

    const analysis = await runAgent(fixContext, toolContext, 'analyze');
    logger.info('🤖 Analysis agent done', {
      success: analysis.success,
      steps: analysis.steps.length,
      filesModified: analysis.filesModified.length,
      costUsd: analysis.totalCost?.toFixed(5),
    });

    // ── 5. Extract structured proposal ────────────────────────────────────
    logger.info('📝 Extracting structured proposal...');
    const proposal = await extractStructuredProposal(
      analysis.summary,
      issueTitle,
      issueBody,
    );

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

  try {
    // ── 1. Load pending proposal ───────────────────────────────────────────
    const pending = await loadPendingProposal(owner, repo, issueNumber);
    if (!pending) {
      return {
        success: false,
        message: 'No pending proposal found — nothing to execute',
      };
    }
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
      repoPath,
      repoId,
      containerId,
      installationId,
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

// ─── Autonomous Fix: single-agent full pipeline with retry ────────────────────
// The agent decides its own plan: explore → fix → run_tests → open_pr.
// Auto-triggered for high-confidence simple fixes; also available for manual /fix.

export async function runAutonomousFixJob(
  data: FixJobData,
  existingClassification?: Awaited<ReturnType<typeof classifyIssue>>,
): Promise<JobResult> {
  const { owner, repo, issueNumber, issueTitle, issueBody, installationId } =
    data;

  logger.info('Autonomous fix job started', { owner, repo, issueNumber });

  let repoPath: string | undefined;
  let containerId: string | undefined;

  try {
    const classification =
      existingClassification ??
      (await classifyIssue(issueTitle, issueBody, []));

    const token = installationId
      ? await getInstallationToken(installationId)
      : env.GITHUB_TOKEN;

    // Clone repo
    const cloneUrl = `https://github.com/${owner}/${repo}.git`;
    const ctx = await setupRepo(owner, repo, cloneUrl, token);
    repoPath = ctx.repoPath;

    // Start Docker sandbox only if the classifier says execution is needed.
    // The agent can still read files, search, and write fixes without it.
    if (classification.needsEnvironment) {
      logger.info(
        '🐳 Starting Docker sandbox (agent requested execution environment)',
      );
      await installDependenciesOnHost(repoPath);
      containerId = await startDockerContainer(ctx);
      await installDependencies(containerId, repoPath);
    } else {
      logger.info('⚡ Skipping Docker — agent will use file tools only');
    }

    // Index codebase
    const { rows } = await db.query<{ id: number }>(
      `INSERT INTO repos (owner, name, full_name, default_branch)
       VALUES ($1, $2, $3, 'main')
       ON CONFLICT (full_name) DO UPDATE SET indexed_at = NOW()
       RETURNING id`,
      [owner, repo, `${owner}/${repo}`],
    );
    if (!rows[0]) throw new Error('DB upsert returned no rows');
    const repoId = rows[0].id;

    const files = await analyzeRepository(repoPath);
    await indexRepository(repoId, files);

    const branchName = generateBranchName(issueNumber, issueTitle);
    const learningContext = buildLearningContext(
      await findSimilarFixes(classification.category, classification.strategy),
    );

    const MAX_ATTEMPTS = 3;
    const priorAttempts: Array<{ summary: string; testOutput: string }> = [];

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      logger.info(`🤖 Autonomous agent — attempt ${attempt}/${MAX_ATTEMPTS}`, {
        issueNumber,
      });

      const fixContext: FixContext = {
        issueNumber,
        issueTitle,
        issueBody,
        repoOwner: owner,
        repoName: repo,
        repoPath,
        branchName,
        classification,
        learningContext: learningContext || undefined,
        priorAttempts:
          priorAttempts.length > 0 ? [...priorAttempts] : undefined,
      };

      const toolContext: ToolContext = {
        repoPath,
        repoId,
        containerId,
        owner,
        repo,
        issueNumber,
        issueTitle,
        branchName,
        token,
        installationId,
      };

      const result = await runAgent(
        fixContext,
        toolContext,
        'autonomous',
        attempt,
      );

      logger.info(`🤖 Autonomous agent done (attempt ${attempt})`, {
        prUrl: result.prUrl,
        filesModified: result.filesModified.length,
        costUsd: result.totalCost?.toFixed(5),
      });

      if (result.prUrl) {
        await postFixComment(
          owner,
          repo,
          issueNumber,
          {
            success: true,
            message: result.summary,
            prUrl: result.prUrl,
          },
          installationId,
        );
        await recordSuccessfulFix(
          owner,
          repo,
          issueNumber,
          classification,
          result.filesModified,
          result.summary,
          '',
          result.prUrl,
        );
        return {
          success: true,
          message: `PR created: ${result.prUrl}`,
          data: { prUrl: result.prUrl },
        };
      }

      // Attempt did not produce a PR — collect what was tried and retry
      if (attempt < MAX_ATTEMPTS) {
        logger.warn(
          `Attempt ${attempt} produced no PR — retrying with different strategy`,
          { issueNumber },
        );
        priorAttempts.push({
          summary: result.summary,
          testOutput: result.lastTestOutput ?? 'No test output captured',
        });
        // Reset repo to clean state for next attempt
        if (containerId) {
          try {
            await runInContainer(
              containerId,
              'cd /workspace && git checkout -- . && git clean -fd 2>&1',
            );
          } catch {
            /* non-fatal */
          }
        }
      }
    }

    // All attempts exhausted
    await postFixComment(
      owner,
      repo,
      issueNumber,
      {
        success: false,
        message: `Autonomous fix tried ${MAX_ATTEMPTS} different strategies and none produced passing tests. Manual review needed.`,
      },
      installationId,
    );
    return {
      success: false,
      message: `All ${MAX_ATTEMPTS} autonomous attempts failed`,
    };
  } catch (err: unknown) {
    const e = err as { message: string };
    logger.error('Autonomous fix error', {
      owner,
      repo,
      issueNumber,
      error: e.message,
    });
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
