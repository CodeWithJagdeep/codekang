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
import {
  createIssueComment,
  createPullRequest,
  githubListDir,
  githubGetTree,
  githubSearchCode,
  githubCreateBranch,
  githubCommitFiles,
  getFileContent,
} from '../github/api';
import { createPullRequestForFix } from '../services/pr-service';
import type { AgentStep, AgentStepType } from '../types/agent';

const execAsync = promisify(execCallback);

// ─── Browser session ──────────────────────────────────────────────────────────

export interface BrowserSession {
  page: Page;
  context: BrowserContext;
}

// ─── Tool execution context ───────────────────────────────────────────────────

export interface ToolContext {
  // ── GitHub API context (always available — no clone needed) ───────────────
  owner: string;
  repo: string;
  token: string;
  installationId?: number;
  defaultBranch: string;
  issueNumber?: number;
  issueTitle?: string;
  branchName?: string;

  // ── Local clone (available after request_clone escalation) ────────────────
  repoPath?: string;
  repoId?: number;

  // ── Docker sandbox (available after request_sandbox escalation) ───────────
  containerId?: string;

  // ── Browser session (lazy, always available) ──────────────────────────────
  browser?: BrowserSession;

  // ── Progressive escalation state ─────────────────────────────────────────
  cloneReady: boolean;
  sandboxReady: boolean;
  /** Called when agent requests_clone — does the actual clone + index work */
  onRequestClone?: () => Promise<{ repoPath: string; repoId: number }>;
  /** Called when agent requests_sandbox — does the actual Docker start */
  onRequestSandbox?: () => Promise<{ containerId: string }>;

  // ── Output tracking ───────────────────────────────────────────────────────
  createdPrUrl?: string;
  lastTestOutput?: string;
}

export interface ToolResult {
  output: string;
  error?: string;
}

// ─── Tool group definitions ───────────────────────────────────────────────────
// Lightweight tools are always available (use GitHub API, no local state).
// Clone tools unlock after request_clone. Sandbox tools after request_sandbox.

const LIGHTWEIGHT_TOOL_DEFS = [
  // ── GitHub API (no clone) ────────────────────────────────────────────────
  {
    name: 'gh_read_file',
    description:
      'Read a file directly from GitHub via API — no local clone needed. ' +
      'Use this first before deciding to clone. Returns file content with line numbers.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative path from repo root' },
        ref: {
          type: 'string',
          description: 'Branch/tag/sha to read from (defaults to default branch)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'gh_list_dir',
    description:
      'List a directory in the GitHub repo without cloning. Good for understanding repo structure.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'Directory path (empty string = repo root)',
        },
        ref: { type: 'string', description: 'Branch/tag/sha (defaults to default branch)' },
      },
      required: [],
    },
  },
  {
    name: 'gh_tree',
    description:
      'Get the full recursive file tree of the repo via GitHub API. ' +
      'Call this early to understand the project layout without cloning.',
    input_schema: {
      type: 'object' as const,
      properties: {
        ref: { type: 'string', description: 'Branch/tag/sha (defaults to default branch)' },
      },
      required: [],
    },
  },
  {
    name: 'gh_search',
    description:
      'Search code in the GitHub repo using GitHub\'s search API. ' +
      'Good for finding where a function is defined or where a pattern appears.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g. "getUserById", "import auth", "TODO")',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'gh_commit_files',
    description:
      'Commit one or more file changes directly to GitHub via API — no clone needed. ' +
      'Use this for simple fixes (config changes, typos, single-file logic changes). ' +
      'Creates the branch from the default branch if it does not exist yet. ' +
      'After committing, call gh_open_pr to create the pull request.',
    input_schema: {
      type: 'object' as const,
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path relative to repo root' },
              content: { type: 'string', description: 'Complete new file content' },
            },
            required: ['path', 'content'],
          },
          description: 'Files to write',
        },
        message: { type: 'string', description: 'Commit message' },
      },
      required: ['files', 'message'],
    },
  },
  {
    name: 'gh_open_pr',
    description:
      'Open a GitHub pull request via API — no local clone needed. ' +
      'Use after gh_commit_files to propose the fix. Returns the PR URL.',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary: {
          type: 'string',
          description: 'PR description — explain what was changed and why',
        },
        base_branch: {
          type: 'string',
          description: 'Target branch (defaults to default branch)',
        },
      },
      required: ['summary'],
    },
  },

  // ── Escalation ────────────────────────────────────────────────────────────
  {
    name: 'request_clone',
    description:
      'Request a full local clone of the repository. ' +
      'Call this ONLY when you need deep codebase search (vector_search, search_files, search_by_symbol) ' +
      'or need to write multi-file changes that require local file context. ' +
      'After this completes, read_file, write_file, search_files, vector_search, and open_pr become available.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: {
          type: 'string',
          description: 'Why you need a full clone (helps with logging)',
        },
      },
      required: ['reason'],
    },
  },
  {
    name: 'request_sandbox',
    description:
      'Request a Docker sandbox for code execution. ' +
      'Call this ONLY when you need to run tests, execute the code, or reproduce a runtime bug. ' +
      'Requires request_clone to have been called first. ' +
      'After this completes, run_command, run_tests, and write_and_run become available.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: {
          type: 'string',
          description: 'Why you need to execute code',
        },
      },
      required: ['reason'],
    },
  },

  // ── Always-available actions ──────────────────────────────────────────────
  {
    name: 'post_comment',
    description: 'Post a comment on the GitHub issue for progress updates.',
    input_schema: {
      type: 'object' as const,
      properties: {
        body: { type: 'string', description: 'Markdown comment body' },
      },
      required: ['body'],
    },
  },
  {
    name: 'think',
    description:
      'Reason out loud before acting. Write your current understanding, what you learned, ' +
      'and your next step. Use especially before deciding whether to clone or use API tools.',
    input_schema: {
      type: 'object' as const,
      properties: {
        thought: { type: 'string', description: 'Your reasoning / plan' },
      },
      required: ['thought'],
    },
  },
  {
    name: 'finish',
    description: 'Call when fully done. Provide a complete summary of changes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary: { type: 'string', description: 'Full summary of what was found / changed' },
        filesModified: {
          type: 'array',
          items: { type: 'string' },
          description: 'Relative paths of files changed (if any)',
        },
      },
      required: ['summary'],
    },
  },

  // ── Browser (always available, lazy init) ────────────────────────────────
  {
    name: 'browser_open',
    description: 'Open a URL in a real browser. Returns page text, console errors, screenshot path.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'Full URL to open' },
        waitForSelector: { type: 'string', description: 'CSS selector to wait for' },
        waitMs: { type: 'number', description: 'Extra wait time in ms (default 500)' },
      },
      required: ['url'],
    },
  },
  {
    name: 'browser_click',
    description: 'Click an element on the current browser page.',
    input_schema: {
      type: 'object' as const,
      properties: {
        selector: { type: 'string', description: 'CSS selector' },
        waitForSelector: { type: 'string', description: 'Selector to wait for after clicking' },
      },
      required: ['selector'],
    },
  },
  {
    name: 'browser_type',
    description: 'Type text into an input field.',
    input_schema: {
      type: 'object' as const,
      properties: {
        selector: { type: 'string', description: 'CSS selector for input' },
        text: { type: 'string', description: 'Text to type' },
        pressEnter: { type: 'boolean', description: 'Press Enter after typing (default false)' },
      },
      required: ['selector', 'text'],
    },
  },
  {
    name: 'browser_get_content',
    description: "Get the current page's visible text, URL, title, console errors.",
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'browser_screenshot',
    description: 'Take a screenshot of the current browser page.',
    input_schema: {
      type: 'object' as const,
      properties: {
        fullPage: { type: 'boolean', description: 'Capture full scrollable page (default true)' },
      },
      required: [],
    },
  },
  {
    name: 'browser_navigate',
    description: 'Navigate the current browser session to a new URL.',
    input_schema: {
      type: 'object' as const,
      properties: { url: { type: 'string', description: 'URL to navigate to' } },
      required: ['url'],
    },
  },
  {
    name: 'browser_close',
    description: 'Close the browser session.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
];

const CLONE_TOOL_DEFS = [
  {
    name: 'read_file',
    description: 'Read a file from the local clone with line numbers.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative path from repo root' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Write or overwrite a file in the local clone.',
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
    name: 'list_directory',
    description: 'List immediate contents of a directory in the local clone.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative path (defaults to repo root)' },
      },
      required: [],
    },
  },
  {
    name: 'get_file_tree',
    description: 'Get a nested tree view of the local clone up to N levels deep.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Root path for tree (defaults to repo root)' },
        depth: { type: 'number', description: 'Max depth (default 3, max 6)' },
      },
      required: [],
    },
  },
  {
    name: 'search_files',
    description: 'Search local clone file contents for a pattern (like grep).',
    input_schema: {
      type: 'object' as const,
      properties: {
        pattern: { type: 'string', description: 'Text or regex pattern' },
        glob: { type: 'string', description: "Optional glob, e.g. '**/*.ts'" },
        caseSensitive: { type: 'boolean', description: 'Case-sensitive search (default false)' },
      },
      required: ['pattern'],
    },
  },
  {
    name: 'vector_search',
    description: 'Semantic similarity search over the indexed codebase. Best for "find where X is done".',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Natural language description' },
        limit: { type: 'number', description: 'Max results (default 5)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_by_symbol',
    description: 'Find code chunks by function/class/variable name. Faster than vector_search for known names.',
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
    name: 'search_by_file',
    description: 'Find code chunks by file path substring.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: "File path fragment, e.g. 'auth', 'login.ts'" },
        limit: { type: 'number', description: 'Max results (default 8)' },
      },
      required: ['path'],
    },
  },
  {
    name: 'get_package_info',
    description: 'Read package.json / pyproject.toml / go.mod. Shows scripts, dependencies, entry points.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'open_pr',
    description:
      'Commit all local changes, push the branch, and open a GitHub pull request. ' +
      'ONLY call this when tests pass (or no tests exist).',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary: { type: 'string', description: 'Summary of what was changed and why (PR body)' },
        base_branch: { type: 'string', description: 'Target branch (default: main)' },
      },
      required: ['summary'],
    },
  },
];

const SANDBOX_TOOL_DEFS = [
  {
    name: 'run_command',
    description: 'Run any shell command inside the Docker sandbox (npm test, lint, build, etc.).',
    input_schema: {
      type: 'object' as const,
      properties: {
        command: { type: 'string', description: 'Shell command to run' },
        workdir: {
          type: 'string',
          description: 'Working directory inside /workspace (defaults to /workspace)',
        },
      },
      required: ['command'],
    },
  },
  {
    name: 'run_file',
    description: 'Run a specific file in the Docker sandbox. Auto-detects runtime from extension.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative path to the file' },
        args: { type: 'string', description: 'Optional CLI arguments' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_and_run',
    description:
      'Write a temporary script and immediately run it in the sandbox. ' +
      'Perfect for reproducing a bug or validating a hypothesis.',
    input_schema: {
      type: 'object' as const,
      properties: {
        filename: { type: 'string', description: "Filename with extension, e.g. 'repro.ts'" },
        content: { type: 'string', description: 'Script content' },
      },
      required: ['filename', 'content'],
    },
  },
  {
    name: 'run_tests',
    description: 'Run the full test suite. Auto-detects test command from package.json, pytest, etc.',
    input_schema: {
      type: 'object' as const,
      properties: {
        command: { type: 'string', description: 'Override test command (optional)' },
      },
      required: [],
    },
  },
];

// ─── Full tool list (used for type reference only) ────────────────────────────

export const AGENT_TOOLS = [
  ...LIGHTWEIGHT_TOOL_DEFS,
  ...CLONE_TOOL_DEFS,
  ...SANDBOX_TOOL_DEFS,
];

// ─── Dynamic tool list based on escalation state ──────────────────────────────

export function getActiveTools(ctx: ToolContext): unknown[] {
  return [
    ...LIGHTWEIGHT_TOOL_DEFS,
    ...(ctx.cloneReady ? CLONE_TOOL_DEFS : []),
    ...(ctx.sandboxReady ? SANDBOX_TOOL_DEFS : []),
  ];
}

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
      out += buildFileTree(path.join(dir, e.name), root, depth + 1, maxDepth, ignore);
    } else {
      out += `${indent}📄 ${e.name}\n`;
    }
  }
  return out;
}

const TREE_IGNORE = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '__pycache__',
  '.venv', 'vendor', 'target', '.cache', 'coverage',
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

      // ── Lightweight GitHub API tools ────────────────────────────────────────

      case 'gh_read_file': {
        const filePath = toolInput['path'] as string;
        const ref = (toolInput['ref'] as string | undefined) ?? ctx.defaultBranch;
        const content = await getFileContent(ctx.owner, ctx.repo, filePath, ref, ctx.installationId);
        if (!content) {
          output = `File not found: ${filePath}`;
          break;
        }
        const lines = content.split('\n');
        output = lines.map((l, i) => `${String(i + 1).padStart(4, ' ')} | ${l}`).join('\n');
        break;
      }

      case 'gh_list_dir': {
        const dirPath = (toolInput['path'] as string | undefined) ?? '';
        const ref = (toolInput['ref'] as string | undefined) ?? ctx.defaultBranch;
        const items = await githubListDir(ctx.owner, ctx.repo, dirPath, ref, ctx.installationId);
        output = items
          .map((i) => `${i.type === 'dir' ? '📁' : '📄'} ${i.name}`)
          .join('\n') || '(empty)';
        break;
      }

      case 'gh_tree': {
        const ref = (toolInput['ref'] as string | undefined) ?? ctx.defaultBranch;
        output = await githubGetTree(ctx.owner, ctx.repo, ref, ctx.installationId);
        break;
      }

      case 'gh_search': {
        const results = await githubSearchCode(
          ctx.owner,
          ctx.repo,
          toolInput['query'] as string,
          ctx.installationId,
        );
        if (results.length === 0) {
          output = 'No results found.';
          break;
        }
        output = results
          .map((r) => `📄 ${r.path}${r.fragment ? `\n  > ${r.fragment.slice(0, 200)}` : ''}`)
          .join('\n\n');
        break;
      }

      case 'gh_commit_files': {
        const { branchName, defaultBranch, owner, repo, installationId } = ctx;
        if (!branchName) {
          output = '❌ No branch name set in context.';
          break;
        }
        // Ensure the branch exists (creates from default branch if not)
        await githubCreateBranch(owner, repo, branchName, defaultBranch, installationId);

        const files = toolInput['files'] as { path: string; content: string }[];
        const message = toolInput['message'] as string;
        const result = await githubCommitFiles(owner, repo, branchName, files, message, installationId);
        output = `✅ Committed ${files.length} file(s) to branch \`${branchName}\`.\nCommit: ${result.url}\n\nCall gh_open_pr to create the pull request.`;
        break;
      }

      case 'gh_open_pr': {
        const { owner, repo, branchName, defaultBranch, issueNumber, issueTitle, installationId } = ctx;
        if (!branchName) {
          output = '❌ No branch name set in context.';
          break;
        }
        const summary = toolInput['summary'] as string;
        const base = (toolInput['base_branch'] as string | undefined) ?? defaultBranch;
        const prTitle = issueTitle
          ? `fix: ${issueTitle}${issueNumber ? ` (closes #${issueNumber})` : ''}`
          : `fix: automated fix for issue #${issueNumber ?? '?'}`;

        const pr = await createPullRequest(owner, repo, prTitle, summary, branchName, base, installationId);
        ctx.createdPrUrl = pr.html_url;
        output = `✅ PR created: ${pr.html_url}`;
        logger.info('Agent opened PR via API', { owner, repo, pr: pr.html_url });
        break;
      }

      // ── Escalation ──────────────────────────────────────────────────────────

      case 'request_clone': {
        if (ctx.cloneReady) {
          output =
            '✅ Repo already cloned. Available tools: read_file, write_file, search_files, ' +
            'vector_search, search_by_symbol, get_file_tree, get_package_info, open_pr.';
          break;
        }
        if (!ctx.onRequestClone) {
          output = '⚠️ Clone escalation not available in this context.';
          break;
        }
        logger.info('Agent requested clone', {
          reason: toolInput['reason'],
          owner: ctx.owner,
          repo: ctx.repo,
        });
        output = '⏳ Cloning repository and building vector index (this takes ~30-60s)...';
        const { repoPath, repoId } = await ctx.onRequestClone();
        ctx.repoPath = repoPath;
        ctx.repoId = repoId;
        ctx.cloneReady = true;
        output =
          '✅ Repository cloned and indexed. New tools now available:\n' +
          '  read_file, write_file, list_directory, get_file_tree\n' +
          '  search_files, vector_search, search_by_symbol, search_by_file\n' +
          '  get_package_info, open_pr\n\n' +
          'Use request_sandbox if you also need to run code.';
        break;
      }

      case 'request_sandbox': {
        if (ctx.sandboxReady) {
          output = '✅ Sandbox already running. Tools available: run_command, run_tests, write_and_run.';
          break;
        }
        if (!ctx.cloneReady) {
          output = '⚠️ Must call request_clone before request_sandbox.';
          break;
        }
        if (!ctx.onRequestSandbox) {
          output = '⚠️ Sandbox escalation not available in this context.';
          break;
        }
        logger.info('Agent requested sandbox', {
          reason: toolInput['reason'],
          owner: ctx.owner,
          repo: ctx.repo,
        });
        output = '⏳ Starting Docker sandbox and installing dependencies (~60-90s)...';
        const { containerId } = await ctx.onRequestSandbox();
        ctx.containerId = containerId;
        ctx.sandboxReady = true;
        output =
          '✅ Docker sandbox ready. New tools now available:\n' +
          '  run_command, run_file, write_and_run, run_tests';
        break;
      }

      // ── Clone-required tools ─────────────────────────────────────────────────

      case 'read_file': {
        if (!ctx.repoPath) { output = '⚠️ No local clone. Use gh_read_file or call request_clone first.'; break; }
        const abs = safePath(ctx.repoPath, toolInput['path'] as string);
        const content = fs.readFileSync(abs, 'utf8');
        const lines = content.split('\n');
        output = lines.map((l, i) => `${String(i + 1).padStart(4, ' ')} | ${l}`).join('\n');
        break;
      }

      case 'write_file': {
        if (!ctx.repoPath) { output = '⚠️ No local clone. Call request_clone first.'; break; }
        const abs = safePath(ctx.repoPath, toolInput['path'] as string);
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, toolInput['content'] as string, 'utf8');
        output = `✅ Written: ${toolInput['path']}`;
        break;
      }

      case 'list_directory': {
        if (!ctx.repoPath) { output = '⚠️ No local clone. Use gh_list_dir or call request_clone first.'; break; }
        const rel = (toolInput['path'] as string | undefined) ?? '';
        const abs = safePath(ctx.repoPath, rel);
        const entries = fs.readdirSync(abs, { withFileTypes: true });
        output = entries
          .sort((a, b) => {
            if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
            return a.name.localeCompare(b.name);
          })
          .map((e) => `${e.isDirectory() ? '📁' : '📄'} ${e.name}${e.isDirectory() ? '/' : ''}`)
          .join('\n');
        break;
      }

      case 'get_file_tree': {
        if (!ctx.repoPath) { output = '⚠️ No local clone. Use gh_tree or call request_clone first.'; break; }
        const rel = (toolInput['path'] as string | undefined) ?? '';
        const abs = safePath(ctx.repoPath, rel);
        const maxDepth = Math.min((toolInput['depth'] as number | undefined) ?? 3, 6);
        output = buildFileTree(abs, ctx.repoPath, 0, maxDepth, TREE_IGNORE) || '(empty directory)';
        break;
      }

      case 'search_files': {
        if (!ctx.repoPath) { output = '⚠️ No local clone. Use gh_search or call request_clone first.'; break; }
        const pattern = toolInput['pattern'] as string;
        const glob = (toolInput['glob'] as string | undefined) ?? '';
        const ci = !(toolInput['caseSensitive'] as boolean | undefined);
        const flags = ci ? 'gi' : 'g';

        let rx: RegExp;
        try {
          rx = new RegExp(pattern, flags);
        } catch {
          rx = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        }

        const matches: string[] = [];
        const walked = walkForSearch(ctx.repoPath, glob);
        for (const file of walked) {
          let content: string;
          try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
          const lines = content.split('\n');
          const hits: string[] = [];
          lines.forEach((line, i) => {
            if (rx.test(line)) hits.push(`  ${i + 1}: ${line.trim()}`);
            rx.lastIndex = 0;
          });
          if (hits.length > 0) {
            const rel = path.relative(ctx.repoPath!, file);
            matches.push(`📄 ${rel}\n${hits.slice(0, 10).join('\n')}`);
          }
        }
        output = matches.length > 0
          ? matches.slice(0, 20).join('\n\n')
          : `No matches for "${pattern}"`;
        break;
      }

      case 'vector_search': {
        if (!ctx.repoId) { output = '⚠️ No vector index. Call request_clone first.'; break; }
        const results = await searchSimilarCode(
          toolInput['query'] as string,
          ctx.repoId,
          (toolInput['limit'] as number | undefined) ?? 5,
        );
        output = results.length === 0
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
        if (!ctx.repoId) { output = '⚠️ No vector index. Call request_clone first.'; break; }
        const results = await searchBySymbol(
          toolInput['name'] as string,
          ctx.repoId,
          (toolInput['limit'] as number | undefined) ?? 8,
        );
        output = results.length === 0
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
        if (!ctx.repoId) { output = '⚠️ No vector index. Call request_clone first.'; break; }
        const results = await searchByFilePath(
          toolInput['path'] as string,
          ctx.repoId,
          (toolInput['limit'] as number | undefined) ?? 8,
        );
        output = results.length === 0
          ? `No file matching "${toolInput['path']}" found.`
          : results.map((r) => `📄 ${r.chunk.filePath} (lines ${r.chunk.startLine}-${r.chunk.endLine})`).join('\n');
        break;
      }

      case 'get_package_info': {
        if (!ctx.repoPath) { output = '⚠️ No local clone. Call request_clone first.'; break; }
        const candidates = ['package.json', 'pyproject.toml', 'go.mod', 'Cargo.toml', 'requirements.txt'];
        const found: string[] = [];
        for (const c of candidates) {
          const abs = path.join(ctx.repoPath, c);
          if (fs.existsSync(abs)) found.push(`\n=== ${c} ===\n${fs.readFileSync(abs, 'utf8')}`);
        }
        output = found.length > 0 ? found.join('\n') : 'No package manifest found.';
        break;
      }

      case 'open_pr': {
        const { owner, repo, issueNumber, issueTitle, branchName } = ctx;
        if (!owner || !repo || !issueNumber || !branchName) {
          output = '❌ Missing context (owner/repo/issueNumber/branchName) — cannot open PR.';
          break;
        }
        if (!ctx.repoPath) {
          output = '⚠️ No local clone. Use gh_open_pr for API-only PR creation.';
          break;
        }
        const summary = toolInput['summary'] as string;
        const baseBranch = (toolInput['base_branch'] as string | undefined) ?? 'main';
        const pr = await createPullRequestForFix(
          owner, repo, ctx.repoPath, branchName, baseBranch,
          issueNumber, issueTitle ?? `Issue #${issueNumber}`, summary, ctx.installationId,
        );
        ctx.createdPrUrl = pr.html_url;
        output = `✅ PR created: ${pr.html_url}`;
        logger.info('Agent opened PR via git push', { owner, repo, issueNumber, pr: pr.html_url });
        break;
      }

      // ── Sandbox-required tools ───────────────────────────────────────────────

      case 'run_command': {
        if (!ctx.containerId) { output = '⚠️ No Docker sandbox. Call request_sandbox first.'; break; }
        const wd = (toolInput['workdir'] as string | undefined) ?? '/workspace';
        if (wd.includes('..')) {
          output = '❌ Invalid workdir — path traversal not allowed.';
          break;
        }
        const cmd = `cd ${wd} && ${toolInput['command'] as string}`;
        output = await runInContainer(ctx.containerId, cmd);
        break;
      }

      case 'run_file': {
        if (!ctx.containerId) { output = '⚠️ No Docker sandbox. Call request_sandbox first.'; break; }
        const rel = toolInput['path'] as string;
        const args = (toolInput['args'] as string | undefined) ?? '';
        const runtime = detectRuntime(rel);
        output = await runInContainer(ctx.containerId, `cd /workspace && ${runtime} "${rel}" ${args} 2>&1`);
        break;
      }

      case 'write_and_run': {
        const filename = toolInput['filename'] as string;
        const content = toolInput['content'] as string;

        if (ctx.containerId) {
          const tempDir = path.join(ctx.repoPath ?? '/tmp', '.codekang-tmp');
          fs.mkdirSync(tempDir, { recursive: true });
          const filePath = path.join(tempDir, filename);
          fs.writeFileSync(filePath, content, 'utf8');
          const runtime = detectRuntime(filename);
          output = await runInContainer(ctx.containerId, `cd /workspace && ${runtime} ".codekang-tmp/${filename}" 2>&1`);
          try { fs.unlinkSync(filePath); } catch { /* ignore */ }
        } else {
          // No sandbox — run locally in a temp dir (dev/test only)
          const tmpDir = path.join('/tmp', `ck-run-${Date.now()}`);
          fs.mkdirSync(tmpDir, { recursive: true });
          const filePath = path.join(tmpDir, filename);
          fs.writeFileSync(filePath, content, 'utf8');
          try {
            const runtime = detectRuntime(filename);
            const { stdout, stderr } = await execAsync(`${runtime} "${filePath}"`, {
              encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024,
            });
            output = `${stdout ?? ''}${stderr ?? ''}`;
          } catch (e: unknown) {
            const err = e as { stdout?: string; stderr?: string; message: string };
            output = (err.stdout ?? '') + (err.stderr ?? err.message);
          } finally {
            try { fs.rmSync(tmpDir, { recursive: true }); } catch { /* ignore */ }
          }
        }
        break;
      }

      case 'run_tests': {
        if (!ctx.containerId) { output = '⚠️ No Docker sandbox. Call request_sandbox first.'; break; }
        let testCmd = toolInput['command'] as string | undefined;
        if (!testCmd) {
          const pkgPath = path.join(ctx.repoPath ?? '', 'package.json');
          const pytestCfg = path.join(ctx.repoPath ?? '', 'pytest.ini');
          const goMod = path.join(ctx.repoPath ?? '', 'go.mod');
          const cargoToml = path.join(ctx.repoPath ?? '', 'Cargo.toml');
          if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as Record<string, any>;
            const scripts = pkg.scripts ?? {};
            testCmd = scripts['test'] ? 'npm test'
              : scripts['test:unit'] ? 'npm run test:unit'
              : scripts['test:ci'] ? 'npm run test:ci'
              : 'npm test';
          } else if (fs.existsSync(pytestCfg) || fs.existsSync(path.join(ctx.repoPath ?? '', 'setup.py'))) {
            testCmd = 'python3 -m pytest -x --tb=short 2>&1';
          } else if (fs.existsSync(goMod)) {
            testCmd = 'go test ./... 2>&1';
          } else if (fs.existsSync(cargoToml)) {
            testCmd = 'cargo test 2>&1';
          } else {
            testCmd = 'npm test';
          }
        }
        output = await runInContainer(ctx.containerId, `cd /workspace && ${testCmd} 2>&1`);
        ctx.lastTestOutput = output;
        break;
      }

      // ── Always-available actions ─────────────────────────────────────────────

      case 'post_comment': {
        const { owner, repo, issueNumber } = ctx;
        if (!owner || !repo || !issueNumber) { output = '❌ Missing context — cannot post comment.'; break; }
        await createIssueComment(owner, repo, issueNumber, toolInput['body'] as string, ctx.installationId);
        output = '✅ Comment posted.';
        break;
      }

      case 'think': {
        output = toolInput['thought'] as string;
        logger.debug('Agent thinking', { thought: output.slice(0, 200) });
        break;
      }

      case 'finish': {
        output = toolInput['summary'] as string;
        break;
      }

      // ── Browser ──────────────────────────────────────────────────────────────

      case 'browser_open': {
        if (!ctx.browser) {
          const session = await createPage();
          ctx.browser = { page: session.page, context: session.context };
        }
        const { page } = ctx.browser;
        const captured = attachConsoleCapture(page);
        const url = toolInput['url'] as string;
        const waitMs = (toolInput['waitMs'] as number | undefined) ?? 500;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        if (toolInput['waitForSelector']) {
          await page.waitForSelector(toolInput['waitForSelector'] as string, { timeout: 10_000 }).catch(() => {});
        }
        await page.waitForTimeout(waitMs);
        const title = await page.title();
        const bodyText = await page.evaluate("document.body ? document.body.innerText.slice(0,3000) : ''");
        const screenshotPath = path.join(process.cwd(), 'screenshots', `browser-${Date.now()}.png`);
        fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
        await page.screenshot({ path: screenshotPath, fullPage: false });
        output =
          `URL: ${page.url()}\nTitle: ${title}\n\nPage text:\n${bodyText}\n\n` +
          `Console errors: ${captured.errors.length > 0 ? captured.errors.join('; ') : 'none'}\n` +
          `Screenshot: ${screenshotPath}`;
        break;
      }

      case 'browser_navigate': {
        if (!ctx.browser) { output = '⚠️ No browser session — call browser_open first.'; break; }
        await ctx.browser.page.goto(toolInput['url'] as string, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        output = `Navigated to ${ctx.browser.page.url()} — title: "${await ctx.browser.page.title()}"`;
        break;
      }

      case 'browser_click': {
        if (!ctx.browser) { output = '⚠️ No browser session — call browser_open first.'; break; }
        const { page } = ctx.browser;
        const sel = toolInput['selector'] as string;
        await page.click(sel, { timeout: 10_000 });
        if (toolInput['waitForSelector']) {
          await page.waitForSelector(toolInput['waitForSelector'] as string, { timeout: 10_000 }).catch(() => {});
        }
        const bodyText = await page.evaluate("document.body ? document.body.innerText.slice(0,2000) : ''");
        output = `Clicked "${sel}". Page text:\n${bodyText}`;
        break;
      }

      case 'browser_type': {
        if (!ctx.browser) { output = '⚠️ No browser session — call browser_open first.'; break; }
        const { page } = ctx.browser;
        await page.fill(toolInput['selector'] as string, toolInput['text'] as string);
        if (toolInput['pressEnter']) await page.keyboard.press('Enter');
        output = `Typed into "${toolInput['selector']}".`;
        break;
      }

      case 'browser_get_content': {
        if (!ctx.browser) { output = '⚠️ No browser session — call browser_open first.'; break; }
        const { page } = ctx.browser;
        const bodyText = await page.evaluate("document.body ? document.body.innerText.slice(0,4000) : ''");
        output = `URL: ${page.url()}\nTitle: ${await page.title()}\n\nContent:\n${bodyText}`;
        break;
      }

      case 'browser_screenshot': {
        if (!ctx.browser) { output = '⚠️ No browser session — call browser_open first.'; break; }
        const fullPage = (toolInput['fullPage'] as boolean | undefined) ?? true;
        const screenshotPath = path.join(process.cwd(), 'screenshots', `shot-${Date.now()}.png`);
        fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
        await ctx.browser.page.screenshot({ path: screenshotPath, fullPage });
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

// ─── File walk helper ─────────────────────────────────────────────────────────

function walkForSearch(dir: string, glob: string): string[] {
  const files: string[] = [];
  const ext = glob
    ? glob.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^\./, '').split(',').filter(Boolean)
    : [];

  function walk(d: string): void {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
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

// ─── Browser cleanup ──────────────────────────────────────────────────────────

export async function closeBrowserSession(ctx: ToolContext): Promise<void> {
  if (ctx.browser) {
    try { await ctx.browser.context.close(); } catch { /* ignore */ }
    ctx.browser = undefined;
  }
}
