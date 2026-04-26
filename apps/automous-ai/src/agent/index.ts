import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { getActiveTools, executeTool, closeBrowserSession } from './tools';
import type { ToolContext } from './tools';
import type { AgentResult, AgentStep, FixContext } from '../types/agent';
import { getCostStats, resetFixCost } from '../config/ai/index';
import { createAgentTrace } from '../config/observability';
import { notifyGateway } from '../utils/notify';

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystem(
  mode: 'analyze' | 'fix' | 'autonomous',
  ctx: FixContext,
  attempt: number = 1,
): string {
  const issue = `
Repository : ${ctx.repoOwner}/${ctx.repoName}
Issue #${ctx.issueNumber}: ${ctx.issueTitle}

${ctx.issueBody}
`.trim();

  const toolGuide = `
TOOLS AVAILABLE — use whatever makes sense for this issue:

CODE EXPLORATION
  get_file_tree   — understand repo structure before diving in
  read_file       — read any file (with line numbers)
  search_files    — grep-like search across the codebase
  vector_search   — semantic search when you know what something does but not its name
  get_package_info — check scripts, dependencies, entry points
  list_directory  — quick peek at a folder

EXECUTION
  run_command     — run any shell command in the Docker sandbox
                    (npm test, npm run lint, cat logs, etc.)
  run_file        — run a single file (auto-detects runtime)
  write_and_run   — write a throwaway script and immediately run it
                    → use this to test a function with sample data,
                      reproduce a bug, or validate a hypothesis

BROWSER (for UI / frontend issues)
  browser_open       — open a URL; get page text + console errors + screenshot
  browser_click      — click an element
  browser_type       — type into an input
  browser_navigate   — go to a different URL in the same session
  browser_get_content — get current page state
  browser_screenshot — capture the current view
  browser_close      — close the session when done

WRITING CODE
  write_file      — write or modify any file
                    (source fixes AND test files)

THINKING & CONTROL
  think           — reason out loud about your plan before acting
  finish          — call when done; provide a full summary
`.trim();

  if (mode === 'analyze') {
    return `You are CodeKang, an elite software engineer tasked with investigating a GitHub issue.

${issue}

YOUR GOAL: Fully understand this issue — reproduce it if possible, find the exact root cause,
and write a clear diagnosis.

${toolGuide}

HOW TO APPROACH THIS (think like a senior dev, not a script):

1. Start by understanding the codebase structure (get_file_tree, get_package_info).
2. Find relevant code — use search_files or read_file to locate the root cause.
3. REPRODUCE the issue ONCE:
   - If it's a bug: write_and_run a small script to confirm the broken behaviour.
   - If it's a UI bug: browser_open the relevant page.
   - If it's a test failure: run_command to run just that test.
4. Once you have confirmed the root cause, call finish() immediately.
   Do NOT keep reproducing or verifying after the first confirmation.
   Do NOT investigate secondary bugs unless they are the direct cause of the reported issue.

EFFICIENCY RULES — CRITICAL:
- Stop as soon as the root cause is confirmed. One reproduction is enough.
- Call finish() within 5 steps for simple/medium bugs, 8 for complex ones.
- Do NOT run more than ONE reproduction script per bug.
- Do NOT explore unrelated issues or improvements in analyze mode.

Call finish() with:
  - Exact file:line of the root cause
  - What is wrong and why (one paragraph)
  - Suggested fix (the minimal code change)

Do NOT modify source files in this mode.`;
  }

  if (mode === 'autonomous') {
    const priorPart =
      ctx.priorAttempts && ctx.priorAttempts.length > 0
        ? ctx.priorAttempts
            .map(
              (a, i) =>
                `\n--- ATTEMPT ${i + 1} FAILED ---\nWhat was tried:\n${a.summary}\n\nTest output:\n\`\`\`\n${a.testOutput.slice(0, 1000)}\n\`\`\``,
            )
            .join('\n') +
          `\n\n⚠️  You must try a COMPLETELY DIFFERENT strategy. Do not repeat what was already tried above.\n`
        : '';

    const attemptNote =
      attempt > 1
        ? `\nThis is attempt ${attempt}. Previous strategies failed. Think creatively — question your assumptions about where the bug is.\n`
        : '';

    return `You are CodeKang, a fully autonomous software engineer. You own this issue end-to-end.

Repository: ${ctx.repoOwner}/${ctx.repoName}
Issue #${ctx.issueNumber}: ${ctx.issueTitle}

${ctx.issueBody}
${priorPart}${attemptNote}
YOUR MISSION: Fix this issue and open a PR. Every decision is yours to make.

━━━ PROGRESSIVE TOOLING — START LIGHTWEIGHT, ESCALATE ONLY WHEN NEEDED ━━━

You start with lightweight GitHub API tools. Use them first.
Only escalate if you genuinely need it.

TIER 0 — Always available (no clone, instant):
  gh_tree             — get full repo file tree via API (start here)
  gh_read_file        — read any file via API (path, optional ref)
  gh_list_dir         — list a directory via API
  gh_search           — search code across the repo via GitHub search API
  gh_commit_files     — commit file changes directly via API (no clone needed!)
  gh_open_pr          — open a pull request via API

  → For simple fixes (typo, config, single-file logic): use ONLY tier 0.
    gh_read_file → gh_commit_files → gh_open_pr → finish()  (done in ~5 steps, no clone)

TIER 1 — After request_clone (local clone + vector index, ~30-60s):
  read_file, write_file, list_directory, get_file_tree
  search_files, vector_search, search_by_symbol, search_by_file
  get_package_info, open_pr

  → Escalate with: request_clone(reason="...")
  → Use when: issue spans many files, need semantic search, need to write multiple files

TIER 2 — After request_sandbox (Docker, ~60-90s):
  run_command, run_file, write_and_run, run_tests

  → Escalate with: request_sandbox(reason="...")
  → Use when: runtime bug needs reproduction, tests must pass before merge

━━━ DECISION GUIDE ━━━

Ask yourself BEFORE cloning:
  "Can I find and fix this by reading 1-2 files via API?"
  → YES → use gh_read_file + gh_commit_files + gh_open_pr (no clone)
  → NO  → request_clone, then use local tools

Ask yourself BEFORE starting sandbox:
  "Do I need to run code to confirm the fix works?"
  → YES → request_sandbox, run_tests
  → NO  → skip it, open_pr with a clear description

━━━ ALWAYS-AVAILABLE ━━━
  post_comment  — update the issue if taking > 3 steps
  think         — reason before a big decision (escalation, change in strategy)
  finish        — call last, always

RULES:
- Do NOT clone just to explore. gh_tree + gh_read_file is enough for most issues.
- Do NOT start Docker unless you need to run code.
- Do NOT ask for permission. Decide and act.
- Do NOT open a PR if your fix is incomplete.
- If after ${Math.ceil(env.AGENT_MAX_STEPS * 0.7)} steps you haven't fixed it, think() and change strategy.`;
  }

  const analysisPart = ctx.analysisSummary
    ? `\nROOT CAUSE (from analysis pass):\n${ctx.analysisSummary}\n\nYou MUST use this diagnosis as your starting point. Go straight to the fix — do not re-investigate from scratch.\n`
    : '';

  const retryPart = ctx.priorTestFailure
    ? `\nPREVIOUS ATTEMPT FAILED — Test output from last try:\n\`\`\`\n${ctx.priorTestFailure}\n\`\`\`\nStudy what broke and choose a DIFFERENT fix strategy this time.\n`
    : '';

  const learningPart = ctx.learningContext ? `\n${ctx.learningContext}\n` : '';

  return `You are CodeKang, an elite software engineer tasked with fixing a GitHub issue.

${issue}
${analysisPart}${retryPart}${learningPart}
YOUR GOAL: Fix this issue completely. Write the minimal correct change, verify it works,
and leave the codebase better than you found it.

${toolGuide}

HOW TO APPROACH THIS (think like a senior dev, not a script):

1. Read the relevant file(s) — use the analysis summary above as your starting point.
2. Apply the minimal correct fix with write_file.
3. VERIFY your fix ONCE:
   - run_command to run the existing test suite, OR
   - write_and_run a single targeted test script
4. Call finish() immediately after the first passing verification.

EFFICIENCY RULES — CRITICAL:
- Use the analysis summary — do NOT re-investigate from scratch.
- Run the test suite at most TWICE (once to see failure, once after fix).
- Call finish() within 6 steps for simple/medium bugs, 10 for complex ones.
- Do NOT write multiple verification scripts — one is enough.
- Do NOT fix secondary issues unless they block the primary fix from passing.

Call finish() with:
  - What you changed and why
  - How you verified it works
  - Files modified

Principles:
- Fix the root cause, not the symptom
- Minimal change — don't refactor surrounding code
- Use think() only when genuinely stuck, not as a planning ritual`;
}

// ─── Agent loop ───────────────────────────────────────────────────────────────

// Temperature scales up with each retry attempt to encourage divergent thinking.
const ATTEMPT_TEMPERATURES: Record<number, number> = { 1: 0.3, 2: 0.6, 3: 0.9 };

const STEP_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes per Claude API call

export async function runAgent(
  fixContext: FixContext,
  toolContext: ToolContext,
  mode: 'analyze' | 'fix' | 'autonomous' = 'fix',
  attempt: number = 1,
): Promise<AgentResult> {
  const t0 = Date.now();
  const steps: AgentStep[] = [];
  const filesModified: string[] = [];
  let summary = '';

  resetFixCost();

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content:
        mode === 'analyze'
          ? 'Investigate the issue. Reproduce it once to confirm the root cause, then call finish() immediately with your diagnosis. Do not keep exploring after the first confirmation — 3–5 steps is ideal.'
          : mode === 'autonomous'
            ? `You have full authority. Understand the issue, fix it, run tests, then call open_pr. Plan your own steps — no one is watching. Make it work.${attempt > 1 ? ` This is attempt ${attempt} — previous approach failed. Try something completely different.` : ''}`
            : 'Apply the fix. Use the analysis summary as your starting point, write the change, run tests once, then call finish(). Aim for 4–6 steps.',
    },
  ];
  const system = buildSystem(mode, fixContext, attempt);

  let finished = false;
  let stepCount = 0;

  logger.info('🚀 Agent loop started', {
    mode,
    issue: fixContext.issueNumber,
    maxSteps: env.AGENT_MAX_STEPS,
  });

  if (fixContext.userId) {
    notifyGateway(fixContext.userId, 'agent:job', {
      jobId: fixContext.jobId ?? 'unknown',
      phase: mode === 'autonomous' ? 'execute' : mode === 'analyze' ? 'propose' : 'execute',
      status: 'started',
      repo: `${fixContext.repoOwner}/${fixContext.repoName}`,
      issueNumber: fixContext.issueNumber,
      issueTitle: fixContext.issueTitle,
      ts: Date.now(),
    }).catch(() => {});
  }

  // ── Langfuse trace ──────────────────────────────────────────────────────
  const trace = createAgentTrace({
    mode,
    issueNumber: fixContext.issueNumber,
    issueTitle: fixContext.issueTitle,
    repo: `${fixContext.repoOwner}/${fixContext.repoName}`,
    attempt,
  });
  // ────────────────────────────────────────────────────────────────────────

  const modelBeingUsed = env.ANTHROPIC_MODEL_AGENT;
  const temperature =
    mode === 'autonomous'
      ? (ATTEMPT_TEMPERATURES[attempt] ?? 0.9)
      : env.AGENT_TEMPERATURE;

  // Autonomous mode gets extra steps — it's doing the full pipeline in one shot
  const maxSteps =
    mode === 'autonomous'
      ? Math.max(env.AGENT_MAX_STEPS, 20)
      : env.AGENT_MAX_STEPS;

  logger.info('💻 Using LLM Model:', {
    model: modelBeingUsed,
    mode,
    attempt,
    temperature,
  });

  while (!finished && stepCount < maxSteps) {
    stepCount++;
    logger.info(
      `🔄 Agent Step [${stepCount}/${env.AGENT_MAX_STEPS}] - Thinking...`,
    );

    let response: Anthropic.Message;
    try {
      // ── Langfuse generation span ──────────────────────────────────────────
      const generation = trace.startGeneration({
        name: `step-${stepCount}`,
        model: modelBeingUsed,
        input: messages,
        modelParameters: { temperature, max_tokens: env.AGENT_MAX_TOKENS },
      });

      const stepTimeout = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Claude API step timed out after ${STEP_TIMEOUT_MS / 1000}s`)),
          STEP_TIMEOUT_MS,
        ),
      );
      response = (await Promise.race([
        client.messages.create({
          model: env.ANTHROPIC_MODEL_AGENT,
          max_tokens: env.AGENT_MAX_TOKENS,
          temperature,
          system: [
            {
              type: 'text',
              text: system,
              cache_control: { type: 'ephemeral' },
            },
          ],
          tools: getActiveTools(toolContext) as unknown as Anthropic.Tool[],
          messages,
        } as Parameters<typeof client.messages.create>[0]),
        stepTimeout,
      ])) as Anthropic.Message;

      generation.end({
        output: response.content,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalCostUsd: getCostStats().totalCostUsd,
      });
    } catch (err: unknown) {
      const e = err as { message: string };
      logger.error('Claude API error', { step: stepCount, error: e.message });

      await closeBrowserSession(toolContext);
      await trace.flush();
      return {
        success: false,
        steps,
        filesModified,
        summary: '',
        error: e.message,
        totalCost: getCostStats().totalCostUsd,
        totalTokens: 0,
        durationMs: Date.now() - t0,
      };
    }

    logger.info('📊 Agent response metrics', {
      step: stepCount,
      stopReason: response.stop_reason,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });

    messages.push({ role: 'assistant', content: response.content });

    // Log any reasoning text the model produced before tools
    const textBlock = response.content.find((b) => b.type === 'text');
    if (textBlock?.type === 'text' && textBlock.text.trim()) {
      logger.info('🧠 Agent Thinking Process:', {
        step: stepCount,
        thought: textBlock.text, // Logging the FULL thought, un-truncated
      });
    }

    if (response.stop_reason === 'end_turn') {
      summary =
        textBlock?.type === 'text'
          ? textBlock.text
          : 'Agent finished without an explicit summary.';
      finished = true;
      break;
    }

    if (response.stop_reason !== 'tool_use') break;

    // Execute every tool call in this turn
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;

      const input = block.input as Record<string, unknown>;
      logger.info(`🛠️ Tool Call Request: ${block.name}`, {
        step: stepCount,
        arguments: input, // Logging full JSON un-truncated
      });

      logger.info(`⏳ Executing ${block.name}...`);

      // ── Langfuse tool span ────────────────────────────────────────────────
      const toolSpan = trace.startSpan(`tool:${block.name}`, input);

      const { result, step } = await executeTool(
        block.name,
        input,
        toolContext,
      );
      steps.push(step);

      toolSpan.end(result.output, step.error);
      // ──────────────────────────────────────────────────────────────────────

      // Track modified files
      if (block.name === 'write_file' && !step.error) {
        const p = input['path'] as string;
        if (!filesModified.includes(p)) filesModified.push(p);
      }

      if (block.name === 'finish') {
        summary = result.output;
        finished = true;
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: result.output,
      });

      logger.info(`✅ Tool execution completed: ${block.name}`, {
        durationMs: step.durationMs,
        outputPreview:
          result.output.length > 500
            ? result.output.slice(0, 500) + '... (truncated)'
            : result.output,
        hasError: !!step.error,
      });

      if (fixContext.userId) {
        notifyGateway(fixContext.userId, 'agent:step', {
          jobId: fixContext.jobId ?? 'unknown',
          repo: `${fixContext.repoOwner}/${fixContext.repoName}`,
          issueNumber: fixContext.issueNumber,
          step: stepCount,
          toolName: block.name,
          status: step.error ? 'error' : 'done',
          outputPreview: result.output.slice(0, 200),
          durationMs: step.durationMs,
          ts: Date.now(),
        }).catch(() => {});
      }
    }

    if (toolResults.length > 0) {
      messages.push({ role: 'user', content: toolResults });
    }
  }

  if (!finished) {
    summary = `Agent stopped after ${stepCount} steps without calling finish().`;
    logger.warn('Agent did not finish cleanly', { stepCount, maxSteps });
  }

  // Always clean up browser
  await closeBrowserSession(toolContext);

  const agentSucceeded = !steps.some((s) => s.error && s.type !== 'think');
  if (fixContext.userId) {
    notifyGateway(fixContext.userId, 'agent:job', {
      jobId: fixContext.jobId ?? 'unknown',
      phase: mode === 'autonomous' ? 'execute' : mode === 'analyze' ? 'propose' : 'execute',
      status: agentSucceeded ? 'completed' : 'failed',
      repo: `${fixContext.repoOwner}/${fixContext.repoName}`,
      issueNumber: fixContext.issueNumber,
      issueTitle: fixContext.issueTitle,
      prUrl: toolContext.createdPrUrl,
      message: summary.slice(0, 300),
      ts: Date.now(),
    }).catch(() => {});
  }

  const cost = getCostStats();
  logger.info('Agent loop done', {
    mode,
    steps: stepCount,
    filesModified: filesModified.length,
    costUsd: cost.totalCostUsd.toFixed(5),
    durationMs: Date.now() - t0,
  });

  // Finalise Langfuse trace with summary + cost
  trace.setOutput(summary);
  trace.setMetadata({
    steps: stepCount,
    filesModified: filesModified.length,
    costUsd: cost.totalCostUsd,
    durationMs: Date.now() - t0,
  });
  await trace.flush();

  return {
    success: !steps.some((s) => s.error && s.type !== 'think'),
    steps,
    filesModified,
    summary,
    prUrl: toolContext.createdPrUrl,
    lastTestOutput: toolContext.lastTestOutput,
    totalCost: cost.totalCostUsd,
    totalTokens: 0,
    durationMs: Date.now() - t0,
  };
}
