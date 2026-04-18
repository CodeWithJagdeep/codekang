import fs from 'fs';
import path from 'path';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import type { Page, BrowserContext } from 'playwright';
import { logger } from '../utils/logger';
import {
  searchSimilarCode,
  searchByFilePath,
  searchBySymbol,
} from '../vector/search';
import { runInContainer } from '../repo/manager';
import { createPage } from '../browser/playwright';
import { createIssueComment } from '../github/api';
import { createPullRequestForFix } from '../services/pr-service';
import type { AgentStep, AgentStepType } from '../types/agent';

const execAsync = promisify(execCallback);

// ─── Browser session (lazy, persisted across tool calls) ─────────────────────

export interface BrowserSession {
  page: Page;
  context: BrowserContext;
}

// ─── Tool execution context ───────────────────────────────────────────────────

export interface ToolContext {
  repoPath: string;
  repoId: number;
  containerId?: string;
  browser?: BrowserSession;
  // Autonomous mode — needed for run_tests / open_pr / post_comment
  owner?: string;
  repo?: string;
  issueNumber?: number;
  issueTitle?: string;
  branchName?: string;
  token?: string;
  installationId?: number;
  // Set by open_pr on success so the caller can detect completion
  createdPrUrl?: string;
  // Set by run_tests so retry logic can read the last failure output
  lastTestOutput?: string;
}

export interface ToolResult {
  output: string;
  error?: string;
}

// ─── Tool definitions for Claude API ─────────────────────────────────────────

export const AGENT_TOOLS = [
  // ── Code reading ──────────────────────────────────────────────────────────
  {
    name: 'read_file' as const,
    description:
      'Read the full content of a file from the repo. Always read before modifying.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative path from repo root' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file' as const,
    description:
      'Write or overwrite a file. Use for source fixes AND writing test/reproduction scripts.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative path from repo root' },
        content: { type: 'string', description: 'Complete file content' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'list_directory' as const,
    description: 'List immediate contents of a directory.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'Relative path (defaults to repo root)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_file_tree' as const,
    description:
      'Get a nested tree view of the repo structure up to N levels deep. Good for understanding project layout.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'Root path for tree (defaults to repo root)',
        },
        depth: {
          type: 'number',
          description: 'Max depth (default 3, max 6)',
        },
      },
      required: [],
    },
  },
  {
    name: 'search_files' as const,
    description:
      'Search file contents for a pattern (like grep). Returns file paths and matching lines. ' +
      'Use this to find where a function is called, where an error is thrown, etc.',
    input_schema: {
      type: 'object' as const,
      properties: {
        pattern: {
          type: 'string',
          description: 'Text or regex pattern to search for',
        },
        glob: {
          type: 'string',
          description:
            "Optional glob to filter files, e.g. '**/*.ts', 'src/**/*.js'",
        },
        caseSensitive: {
          type: 'boolean',
          description: 'Whether search is case-sensitive (default false)',
        },
      },
      required: ['pattern'],
    },
  },
  {
    name: 'vector_search' as const,
    description:
      'Semantic similarity search over the indexed codebase. Best for finding code by meaning, not exact text.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Natural language description of what to find',
        },
        limit: {
          type: 'number',
          description: 'Max results (default 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_by_symbol' as const,
    description:
      'Find code chunks that define or reference a specific symbol (function, class, variable). ' +
      'Exact or partial name match. Faster and more precise than vector_search for known names.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Symbol name (full or partial)' },
        limit: { type: 'number', description: 'Max results (default 8)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'search_by_file' as const,
    description:
      'Find code chunks by file path substring. Useful when you know the file name but not its location.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: "File path fragment, e.g. 'auth', 'login.ts'",
        },
        limit: { type: 'number', description: 'Max results (default 8)' },
      },
      required: ['path'],
    },
  },
  {
    name: 'get_package_info' as const,
    description:
      'Read package.json (or pyproject.toml / go.mod / Cargo.toml). Shows scripts, dependencies, entry points.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  // ── Execution ─────────────────────────────────────────────────────────────
  {
    name: 'run_command' as const,
    description:
      'Run any shell command inside the Docker sandbox. ' +
      'Use this to: run the existing test suite, build the project, lint code, check logs, ' +
      'or run any npm/yarn/pnpm/python/go script.',
    input_schema: {
      type: 'object' as const,
      properties: {
        command: { type: 'string', description: 'Shell command to run' },
        workdir: {
          type: 'string',
          description:
            'Working directory inside /workspace (defaults to /workspace)',
        },
      },
      required: ['command'],
    },
  },
  {
    name: 'run_file' as const,
    description:
      'Run a specific file in the Docker sandbox with an appropriate runtime. ' +
      'Detects runtime from extension (.ts → ts-node, .js → node, .py → python3, etc.). ' +
      'Great for running a reproduction script or a single test file.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'Relative path to the file to run',
        },
        args: {
          type: 'string',
          description: 'Optional CLI arguments',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_and_run' as const,
    description:
      'Write a temporary script and immediately run it. Perfect for: ' +
      'testing a function with sample data, reproducing a bug, validating a hypothesis. ' +
      'The script is written to a temp directory so it does not pollute source files.',
    input_schema: {
      type: 'object' as const,
      properties: {
        filename: {
          type: 'string',
          description:
            "Filename with extension, e.g. 'repro.js', 'test-auth.ts', 'check.py'",
        },
        content: {
          type: 'string',
          description: 'Script content to run',
        },
      },
      required: ['filename', 'content'],
    },
  },

  // ── Browser ───────────────────────────────────────────────────────────────
  {
    name: 'browser_open' as const,
    description:
      'Open a URL in a real browser. Returns page title, visible text, console errors, and a screenshot path. ' +
      'Call this first to establish a browser session; then use browser_click / browser_type to interact.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'Full URL to open' },
        waitForSelector: {
          type: 'string',
          description: 'CSS selector to wait for before returning',
        },
        waitMs: {
          type: 'number',
          description: 'Extra wait time in ms after page load (default 500)',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'browser_click' as const,
    description:
      'Click an element on the current browser page. ' +
      'Returns updated page content and any new console errors.',
    input_schema: {
      type: 'object' as const,
      properties: {
        selector: {
          type: 'string',
          description:
            'CSS selector or text content (e.g. \'button:has-text("Submit")\')',
        },
        waitForSelector: {
          type: 'string',
          description: 'Optional selector to wait for after clicking',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'browser_type' as const,
    description: 'Type text into an input field on the current browser page.',
    input_schema: {
      type: 'object' as const,
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector for the input element',
        },
        text: {
          type: 'string',
          description: 'Text to type',
        },
        pressEnter: {
          type: 'boolean',
          description: 'Press Enter after typing (default false)',
        },
      },
      required: ['selector', 'text'],
    },
  },
  {
    name: 'browser_get_content' as const,
    description:
      "Get the current page's visible text, URL, title, and any console errors/warnings. " +
      'Use after interactions to see what changed.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'browser_screenshot' as const,
    description:
      'Take a screenshot of the current browser page. Returns the file path.',
    input_schema: {
      type: 'object' as const,
      properties: {
        fullPage: {
          type: 'boolean',
          description: 'Capture full scrollable page (default true)',
        },
      },
      required: [],
    },
  },
  {
    name: 'browser_navigate' as const,
    description: 'Navigate the current browser session to a new URL.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'URL to navigate to' },
      },
      required: ['url'],
    },
  },
  {
    name: 'browser_close' as const,
    description:
      'Close the browser session when you are done investigating UI issues.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },

  // ── Autonomous actions ────────────────────────────────────────────────────
  {
    name: 'run_tests' as const,
    description:
      'Run the full test suite. Auto-detects the test command from package.json, pytest, go test, etc. ' +
      'Call this after applying a fix to verify correctness. Returns full test output.',
    input_schema: {
      type: 'object' as const,
      properties: {
        command: {
          type: 'string',
          description:
            'Override test command (optional — auto-detected if omitted)',
        },
      },
      required: [],
    },
  },
  {
    name: 'open_pr' as const,
    description:
      'Commit all changes, push the branch, and open a GitHub pull request. ' +
      'ONLY call this when tests pass. Do NOT call if tests are failing.',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary: {
          type: 'string',
          description: 'Summary of what was changed and why (used as PR body)',
        },
        base_branch: {
          type: 'string',
          description: 'Target branch for the PR (default: main)',
        },
      },
      required: ['summary'],
    },
  },
  {
    name: 'post_comment' as const,
    description:
      'Post a comment on the GitHub issue. Use this to give progress updates, ' +
      'ask clarifying questions, or report what you found.',
    input_schema: {
      type: 'object' as const,
      properties: {
        body: {
          type: 'string',
          description: 'Markdown comment body',
        },
      },
      required: ['body'],
    },
  },

  // ── Control ───────────────────────────────────────────────────────────────
  {
    name: 'think' as const,
    description:
      'Use this to reason out loud about your next steps without taking action. ' +
      'Write your current understanding, what you have learned, and what you plan to do next. ' +
      'This helps you avoid going in circles.',
    input_schema: {
      type: 'object' as const,
      properties: {
        thought: {
          type: 'string',
          description: 'Your reasoning / plan',
        },
      },
      required: ['thought'],
    },
  },
  {
    name: 'finish' as const,
    description:
      'Call this when fully done. Provide a complete summary of findings and/or changes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary: {
          type: 'string',
          description: 'Full summary of what was found / changed',
        },
        filesModified: {
          type: 'array',
          items: { type: 'string' },
          description: 'Relative paths of files changed (if any)',
        },
      },
      required: ['summary'],
    },
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safePath(repoPath: string, rel: string): string {
  const abs = path.resolve(repoPath, rel);
  if (!abs.startsWith(repoPath)) throw new Error('Path traversal denied');
  return abs;
}

function buildFileTree(
  dir: string,
  root: string,
  depth: number,
  maxDepth: number,
  ignore: Set<string>,
): string {
  if (depth > maxDepth) return '';
  const indent = '  '.repeat(depth);
  let out = '';
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return '';
  }
  for (const e of entries) {
    if (ignore.has(e.name)) continue;
    if (e.isDirectory()) {
      out += `${indent}📁 ${e.name}/\n`;
      out += buildFileTree(
        path.join(dir, e.name),
        root,
        depth + 1,
        maxDepth,
        ignore,
      );
    } else {
      out += `${indent}📄 ${e.name}\n`;
    }
  }
  return out;
}

const TREE_IGNORE = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '__pycache__',
  '.venv',
  'vendor',
  'target',
  '.cache',
  'coverage',
]);

function detectRuntime(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.ts':
    case '.mts':
      return 'npx ts-node --skip-project';
    case '.js':
    case '.mjs':
      return 'node';
    case '.py':
      return 'python3';
    case '.go':
      return 'go run';
    case '.rb':
      return 'ruby';
    case '.sh':
      return 'bash';
    default:
      return 'node';
  }
}

// ─── Console error capture helper ─────────────────────────────────────────────

interface PageErrors {
  errors: string[];
  warnings: string[];
}

function attachConsoleCapture(page: Page): PageErrors {
  const captured: PageErrors = { errors: [], warnings: [] };
  page.on('console', (msg) => {
    if (msg.type() === 'error') captured.errors.push(msg.text());
    if (msg.type() === 'warning') captured.warnings.push(msg.text());
  });
  page.on('pageerror', (err) => {
    captured.errors.push(`[page error] ${err.message}`);
  });
  return captured;
}

// ─── Executor ─────────────────────────────────────────────────────────────────

export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  ctx: ToolContext,
): Promise<{ result: ToolResult; step: AgentStep }> {
  const t0 = Date.now();
  let output = '';
  let error: string | undefined;

  try {
    switch (toolName) {
      // ── Code reading ────────────────────────────────────────────────────
      case 'read_file': {
        const abs = safePath(ctx.repoPath, toolInput['path'] as string);
        const content = fs.readFileSync(abs, 'utf8');
        const lines = content.split('\n');
        // Prefix with line numbers so the agent can reference line:col
        output = lines
          .map((l, i) => `${String(i + 1).padStart(4, ' ')} | ${l}`)
          .join('\n');
        break;
      }

      case 'write_file': {
        const abs = safePath(ctx.repoPath, toolInput['path'] as string);
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, toolInput['content'] as string, 'utf8');
        output = `✅ Written: ${toolInput['path']}`;
        break;
      }

      case 'list_directory': {
        const rel = (toolInput['path'] as string | undefined) ?? '';
        const abs = safePath(ctx.repoPath, rel);
        const entries = fs.readdirSync(abs, { withFileTypes: true });
        output = entries
          .sort((a, b) => {
            // dirs first, then files
            if (a.isDirectory() !== b.isDirectory())
              return a.isDirectory() ? -1 : 1;
            return a.name.localeCompare(b.name);
          })
          .map(
            (e) =>
              `${e.isDirectory() ? '📁' : '📄'} ${e.name}${e.isDirectory() ? '/' : ''}`,
          )
          .join('\n');
        break;
      }

      case 'get_file_tree': {
        const rel = (toolInput['path'] as string | undefined) ?? '';
        const abs = safePath(ctx.repoPath, rel);
        const maxDepth = Math.min(
          (toolInput['depth'] as number | undefined) ?? 3,
          6,
        );
        output = buildFileTree(abs, ctx.repoPath, 0, maxDepth, TREE_IGNORE);
        if (!output) output = '(empty directory)';
        break;
      }

      case 'search_files': {
        const pattern = toolInput['pattern'] as string;
        const glob = (toolInput['glob'] as string | undefined) ?? '';
        const ci = !(toolInput['caseSensitive'] as boolean | undefined);
        const flags = ci ? 'gi' : 'g';

        let rx: RegExp;
        try {
          rx = new RegExp(pattern, flags);
        } catch {
          // treat as literal string if not valid regex
          rx = new RegExp(
            pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            flags,
          );
        }

        const matches: string[] = [];
        const walked = walkForSearch(ctx.repoPath, glob);
        for (const file of walked) {
          let content: string;
          try {
            content = fs.readFileSync(file, 'utf8');
          } catch {
            continue;
          }
          const lines = content.split('\n');
          const hits: string[] = [];
          lines.forEach((line, i) => {
            if (rx.test(line)) {
              hits.push(`  ${i + 1}: ${line.trim()}`);
            }
            rx.lastIndex = 0;
          });
          if (hits.length > 0) {
            const rel = path.relative(ctx.repoPath, file);
            matches.push(`📄 ${rel}\n${hits.slice(0, 10).join('\n')}`);
          }
        }
        output =
          matches.length > 0
            ? matches.slice(0, 20).join('\n\n')
            : `No matches for "${pattern}"`;
        break;
      }

      case 'vector_search': {
        const results = await searchSimilarCode(
          toolInput['query'] as string,
          ctx.repoId,
          (toolInput['limit'] as number | undefined) ?? 5,
        );
        output =
          results.length === 0
            ? 'No matching code found.'
            : results
                .map(
                  (r) =>
                    `### ${r.chunk.filePath} (lines ${r.chunk.startLine}-${r.chunk.endLine}, sim=${r.similarity.toFixed(3)})\n\`\`\`${r.chunk.language}\n${r.chunk.content}\n\`\`\``,
                )
                .join('\n\n');
        break;
      }

      case 'search_by_symbol': {
        const results = await searchBySymbol(
          toolInput['name'] as string,
          ctx.repoId,
          (toolInput['limit'] as number | undefined) ?? 8,
        );
        output =
          results.length === 0
            ? `No symbol matching "${toolInput['name']}" found.`
            : results
                .map(
                  (r) =>
                    `### ${r.chunk.filePath}:${r.chunk.startLine}\n\`\`\`${r.chunk.language}\n${r.chunk.content.slice(0, 600)}\n\`\`\``,
                )
                .join('\n\n');
        break;
      }

      case 'search_by_file': {
        const results = await searchByFilePath(
          toolInput['path'] as string,
          ctx.repoId,
          (toolInput['limit'] as number | undefined) ?? 8,
        );
        output =
          results.length === 0
            ? `No file matching "${toolInput['path']}" found.`
            : results
                .map(
                  (r) =>
                    `📄 ${r.chunk.filePath} (lines ${r.chunk.startLine}-${r.chunk.endLine})`,
                )
                .join('\n');
        break;
      }

      case 'get_package_info': {
        const candidates = [
          'package.json',
          'pyproject.toml',
          'go.mod',
          'Cargo.toml',
          'requirements.txt',
        ];
        const found: string[] = [];
        for (const c of candidates) {
          const abs = path.join(ctx.repoPath, c);
          if (fs.existsSync(abs)) {
            found.push(`\n=== ${c} ===\n${fs.readFileSync(abs, 'utf8')}`);
          }
        }
        output =
          found.length > 0 ? found.join('\n') : 'No package manifest found.';
        break;
      }

      // ── Execution ────────────────────────────────────────────────────────
      case 'run_command': {
        if (!ctx.containerId) {
          output = '⚠️  No Docker container available.';
          break;
        }
        const wd = (toolInput['workdir'] as string | undefined) ?? '/workspace';
        const cmd = `cd ${wd} && ${toolInput['command'] as string}`;
        output = await runInContainer(ctx.containerId, cmd);
        break;
      }

      case 'run_file': {
        if (!ctx.containerId) {
          output = '⚠️  No Docker container available.';
          break;
        }
        const rel = toolInput['path'] as string;
        const args = (toolInput['args'] as string | undefined) ?? '';
        const runtime = detectRuntime(rel);
        output = await runInContainer(
          ctx.containerId,
          `cd /workspace && ${runtime} "${rel}" ${args} 2>&1`,
        );
        break;
      }

      case 'write_and_run': {
        const filename = toolInput['filename'] as string;
        const content = toolInput['content'] as string;
        const tempDir = path.join(ctx.repoPath, '.codekang-tmp');
        fs.mkdirSync(tempDir, { recursive: true });
        const filePath = path.join(tempDir, filename);
        fs.writeFileSync(filePath, content, 'utf8');

        if (ctx.containerId) {
          const runtime = detectRuntime(filename);
          output = await runInContainer(
            ctx.containerId,
            `cd /workspace && ${runtime} ".codekang-tmp/${filename}" 2>&1`,
          );
        } else {
          // Fallback: run locally (risky — only for dev)
          try {
            const runtime = detectRuntime(filename);
            const { stdout, stderr } = await execAsync(
              `cd "${ctx.repoPath}" && ${runtime} ".codekang-tmp/${filename}"`,
              { encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024 },
            );
            output = `${stdout ?? ''}${stderr ?? ''}`;
          } catch (e: unknown) {
            const err = e as {
              stdout?: string;
              stderr?: string;
              message: string;
            };
            output = (err.stdout ?? '') + (err.stderr ?? err.message);
          }
        }

        // Clean up temp file
        try {
          fs.unlinkSync(filePath);
        } catch {
          /* ignore */
        }
        break;
      }

      // ── Browser ──────────────────────────────────────────────────────────
      case 'browser_open': {
        // Initialise session if not already open
        if (!ctx.browser) {
          const session = await createPage();
          ctx.browser = { page: session.page, context: session.context };
        }
        const { page } = ctx.browser;
        const captured = attachConsoleCapture(page);

        const url = toolInput['url'] as string;
        const waitMs = (toolInput['waitMs'] as number | undefined) ?? 500;

        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        });

        if (toolInput['waitForSelector']) {
          await page
            .waitForSelector(toolInput['waitForSelector'] as string, {
              timeout: 10_000,
            })
            .catch(() => {
              /* ignore */
            });
        }

        await page.waitForTimeout(waitMs);

        const title = await page.title();
        const bodyText = await page.evaluate(
          "document.body ? document.body.innerText.slice(0,3000) : ''",
        );
        const screenshotPath = path.join(
          process.cwd(),
          'screenshots',
          `browser-${Date.now()}.png`,
        );
        fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
        await page.screenshot({ path: screenshotPath, fullPage: false });

        output =
          `URL: ${page.url()}\n` +
          `Title: ${title}\n\n` +
          `Page text (truncated):\n${bodyText}\n\n` +
          `Console errors: ${captured.errors.length > 0 ? captured.errors.join('; ') : 'none'}\n` +
          `Console warnings: ${captured.warnings.length > 0 ? captured.warnings.join('; ') : 'none'}\n` +
          `Screenshot: ${screenshotPath}`;
        break;
      }

      case 'browser_navigate': {
        if (!ctx.browser) {
          output = '⚠️  No browser session — call browser_open first.';
          break;
        }
        const { page } = ctx.browser;
        await page.goto(toolInput['url'] as string, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        });
        output = `Navigated to ${page.url()} — title: "${await page.title()}"`;
        break;
      }

      case 'browser_click': {
        if (!ctx.browser) {
          output = '⚠️  No browser session — call browser_open first.';
          break;
        }
        const { page } = ctx.browser;
        const sel = toolInput['selector'] as string;
        await page.click(sel, { timeout: 10_000 });

        if (toolInput['waitForSelector']) {
          await page
            .waitForSelector(toolInput['waitForSelector'] as string, {
              timeout: 10_000,
            })
            .catch(() => {
              /* ignore */
            });
        }

        const bodyText = await page.evaluate(
          "document.body ? document.body.innerText.slice(0,2000) : ''",
        );
        output = `Clicked "${sel}". Page text:\n${bodyText}`;
        break;
      }

      case 'browser_type': {
        if (!ctx.browser) {
          output = '⚠️  No browser session — call browser_open first.';
          break;
        }
        const { page } = ctx.browser;
        const sel = toolInput['selector'] as string;
        await page.fill(sel, toolInput['text'] as string);
        if (toolInput['pressEnter']) await page.keyboard.press('Enter');
        output = `Typed into "${sel}".`;
        break;
      }

      case 'browser_get_content': {
        if (!ctx.browser) {
          output = '⚠️  No browser session — call browser_open first.';
          break;
        }
        const { page } = ctx.browser;
        const bodyText = await page.evaluate(
          "document.body ? document.body.innerText.slice(0,4000) : ''",
        );
        const url = page.url();
        const title = await page.title();
        output = `URL: ${url}\nTitle: ${title}\n\nContent:\n${bodyText}`;
        break;
      }

      case 'browser_screenshot': {
        if (!ctx.browser) {
          output = '⚠️  No browser session — call browser_open first.';
          break;
        }
        const { page } = ctx.browser;
        const fullPage = (toolInput['fullPage'] as boolean | undefined) ?? true;
        const screenshotPath = path.join(
          process.cwd(),
          'screenshots',
          `shot-${Date.now()}.png`,
        );
        fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
        await page.screenshot({ path: screenshotPath, fullPage });
        output = `Screenshot saved: ${screenshotPath}`;
        break;
      }

      case 'browser_close': {
        if (ctx.browser) {
          await ctx.browser.context.close();
          ctx.browser = undefined;
          output = 'Browser session closed.';
        } else {
          output = 'No browser session was open.';
        }
        break;
      }

      // ── Autonomous actions ────────────────────────────────────────────────
      case 'run_tests': {
        if (!ctx.containerId) {
          output = '⚠️ No Docker sandbox available — cannot run tests.';
          break;
        }

        let testCmd = toolInput['command'] as string | undefined;

        if (!testCmd) {
          // Auto-detect test command
          const pkgPath = path.join(ctx.repoPath, 'package.json');
          const pytestCfg = path.join(ctx.repoPath, 'pytest.ini');
          const goMod = path.join(ctx.repoPath, 'go.mod');
          const cargoToml = path.join(ctx.repoPath, 'Cargo.toml');

          if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as Record<
              string,
              any
            >;
            const scripts = pkg.scripts ?? {};
            if (scripts['test']) testCmd = 'npm test';
            else if (scripts['test:unit']) testCmd = 'npm run test:unit';
            else if (scripts['test:ci']) testCmd = 'npm run test:ci';
            else testCmd = 'npm test';
          } else if (
            fs.existsSync(pytestCfg) ||
            fs.existsSync(path.join(ctx.repoPath, 'setup.py'))
          ) {
            testCmd = 'python3 -m pytest -x --tb=short 2>&1';
          } else if (fs.existsSync(goMod)) {
            testCmd = 'go test ./... 2>&1';
          } else if (fs.existsSync(cargoToml)) {
            testCmd = 'cargo test 2>&1';
          } else {
            testCmd = 'npm test';
          }
        }

        output = await runInContainer(
          ctx.containerId,
          `cd /workspace && ${testCmd} 2>&1`,
        );
        ctx.lastTestOutput = output;
        break;
      }

      case 'open_pr': {
        const { owner, repo, issueNumber, issueTitle, branchName } = ctx;
        if (!owner || !repo || !issueNumber || !branchName) {
          output =
            '❌ Missing context (owner/repo/issueNumber/branchName) — cannot open PR.';
          break;
        }
        const summary = toolInput['summary'] as string;
        const baseBranch =
          (toolInput['base_branch'] as string | undefined) ?? 'main';

        const pr = await createPullRequestForFix(
          owner,
          repo,
          ctx.repoPath,
          branchName,
          baseBranch,
          issueNumber,
          issueTitle ?? `Issue #${issueNumber}`,
          summary,
          ctx.installationId,
        );

        ctx.createdPrUrl = pr.html_url;
        output = `✅ PR created: ${pr.html_url}`;
        logger.info('Agent opened PR autonomously', {
          owner,
          repo,
          issueNumber,
          pr: pr.html_url,
        });
        break;
      }

      case 'post_comment': {
        const { owner, repo, issueNumber } = ctx;
        if (!owner || !repo || !issueNumber) {
          output = '❌ Missing context — cannot post comment.';
          break;
        }
        await createIssueComment(
          owner,
          repo,
          issueNumber,
          toolInput['body'] as string,
          ctx.installationId,
        );
        output = '✅ Comment posted.';
        break;
      }

      // ── Control ──────────────────────────────────────────────────────────
      case 'think': {
        // Just echo the thought back — used for reasoning traces
        output = toolInput['thought'] as string;
        logger.debug('Agent thinking', {
          thought: output.slice(0, 200),
        });
        break;
      }

      case 'finish': {
        output = toolInput['summary'] as string;
        break;
      }

      default:
        output = `Unknown tool: ${toolName}`;
    }
  } catch (err: unknown) {
    const e = err as { message: string };
    error = e.message;
    output = `❌ Error: ${e.message}`;
    logger.warn('Tool error', { toolName, error: e.message });
  }

  const step: AgentStep = {
    type: toolName as AgentStepType,
    input: toolInput,
    output,
    error,
    durationMs: Date.now() - t0,
  };

  return { result: { output, error }, step };
}

// ─── File walk helper for search_files ───────────────────────────────────────

function walkForSearch(dir: string, glob: string): string[] {
  const files: string[] = [];
  const ext = glob
    ? glob
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/^\./, '')
        .split(',')
        .filter(Boolean)
    : [];

  function walk(d: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (TREE_IGNORE.has(e.name)) continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.isFile()) {
        if (ext.length === 0) {
          files.push(full);
        } else {
          const fileExt = path.extname(e.name).replace('.', '');
          if (ext.includes(fileExt)) files.push(full);
        }
      }
    }
  }

  walk(dir);
  return files;
}

// ─── Browser cleanup (called by agent loop on exit) ──────────────────────────

export async function closeBrowserSession(ctx: ToolContext): Promise<void> {
  if (ctx.browser) {
    try {
      await ctx.browser.context.close();
    } catch {
      /* ignore */
    }
    ctx.browser = undefined;
  }
}
