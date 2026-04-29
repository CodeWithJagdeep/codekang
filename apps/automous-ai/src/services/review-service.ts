import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { db } from '../config/database';
import {
  getPRFiles,
  getPR,
  createPRReview,
  getFileContent,
  createIssueForFinding,
  type PRReviewComment,
} from '../github/api';
import {
  checkPRReview,
  consumeReviewCredits,
  type PRReviewContext,
  type RepoReviewSettings,
} from '../guards/plan-check';

const ai = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

// ─── Types ─────────────────────────────────────────────────────────────────────

type Severity = 'low' | 'medium' | 'high' | 'critical';
type IssueType = 'security' | 'bug' | 'performance' | 'style' | 'documentation';

interface ExtendedComment {
  path: string;
  line: number;
  body: string;
  severity: Severity;
  issueType: IssueType;
}

interface ReviewResult {
  summary: string;
  comments: ExtendedComment[];
  verdict: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number,
  installationId?: number,
  context: PRReviewContext = {
    webhookAction: 'opened',
    isDraft: false,
    targetBranch: 'main',
  },
): Promise<void> {
  logger.info('Starting PR review', { owner, repo, prNumber, ...context });

  const planCheck = await checkPRReview(owner, repo, context);
  if (!planCheck.allowed) {
    logger.info('PR review skipped', { owner, repo, prNumber, reason: planCheck.reason });
    return;
  }

  const settings = planCheck.settings!;

  const [pr, files] = await Promise.all([
    getPR(owner, repo, prNumber, installationId),
    getPRFiles(owner, repo, prNumber, installationId),
  ]);

  // Fetch full file content for changed/added files so Claude has cross-line context
  const fileContents = await fetchFileContents(
    owner,
    repo,
    files,
    pr.head.sha,
    settings.reviewDepth,
    installationId,
  );

  const diffContext = buildDiffContext(files, fileContents);

  if (!diffContext) {
    logger.info('No diff to review', { prNumber });
    return;
  }

  const review = await generateReview(
    pr.title,
    pr.body ?? '',
    diffContext,
    files,
    settings,
  );

  // Map extended comments → GitHub API comments (drop severity/issueType fields)
  const githubComments: PRReviewComment[] = review.comments.map((c) => ({
    path: c.path,
    line: c.line,
    body: formatCommentBody(c),
  }));

  await createPRReview(
    owner,
    repo,
    prNumber,
    pr.head.sha,
    review.summary,
    githubComments,
    review.verdict,
    installationId,
  );

  await upsertPRReview(
    owner,
    repo,
    prNumber,
    pr.title,
    pr.head.sha,
    pr.head.ref,
    review.summary,
    review.verdict,
    review.comments,
    installationId,
  );

  // Raise GitHub issues for high/critical findings so they don't get buried in PR comments
  await raiseIssuesForFindings(
    owner,
    repo,
    prNumber,
    pr.title,
    pr.html_url,
    review.comments,
    settings,
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

// ─── File content fetching ────────────────────────────────────────────────────

// Per-file content char limits by depth — quick skips full files entirely
const FILE_CONTENT_LIMITS: Record<RepoReviewSettings['reviewDepth'], number | null> = {
  quick: null,       // skip — diff only
  standard: 4000,   // ~1k tokens per file, max 5 files
  thorough: 8000,   // ~2k tokens per file, max 10 files
};

const FILE_COUNT_LIMITS: Record<RepoReviewSettings['reviewDepth'], number> = {
  quick: 0,
  standard: 5,
  thorough: 10,
};

async function fetchFileContents(
  owner: string,
  repo: string,
  files: { filename: string; status: string; patch?: string }[],
  headSha: string,
  depth: RepoReviewSettings['reviewDepth'],
  installationId?: number,
): Promise<Map<string, string>> {
  const charLimit = FILE_CONTENT_LIMITS[depth];
  const fileLimit = FILE_COUNT_LIMITS[depth];
  const result = new Map<string, string>();

  if (!charLimit || fileLimit === 0) return result;

  const candidates = files
    .filter((f) => f.status !== 'removed' && f.patch)
    .slice(0, fileLimit);

  await Promise.all(
    candidates.map(async (f) => {
      const content = await getFileContent(owner, repo, f.filename, headSha, installationId);
      if (content) {
        result.set(f.filename, content.slice(0, charLimit));
      }
    }),
  );

  logger.debug('Fetched full file contents for review', {
    owner, repo, count: result.size, depth,
  });

  return result;
}

// ─── Diff + file context builder ──────────────────────────────────────────────

function buildDiffContext(
  files: { filename: string; patch?: string; additions: number; deletions: number }[],
  fileContents: Map<string, string>,
): string {
  return files
    .filter((f) => f.patch)
    .map((f) => {
      const header = `### ${f.filename} (+${f.additions} -${f.deletions})`;
      const diff = `**Diff:**\n\`\`\`diff\n${f.patch}\n\`\`\``;
      const full = fileContents.get(f.filename);
      const fullSection = full
        ? `\n**Full file (current):**\n\`\`\`\n${full}\n\`\`\``
        : '';
      return `${header}\n${diff}${fullSection}`;
    })
    .join('\n\n');
}

// ─── Severity badge for inline GitHub comment body ────────────────────────────

const SEVERITY_BADGE: Record<Severity, string> = {
  low: '🔵 **Low**',
  medium: '🟡 **Medium**',
  high: '🟠 **High**',
  critical: '🔴 **Critical**',
};

const ISSUE_TYPE_BADGE: Record<IssueType, string> = {
  security: '🔒 Security',
  bug: '🐛 Bug',
  performance: '⚡ Performance',
  style: '🎨 Style',
  documentation: '📄 Documentation',
};

function formatCommentBody(c: ExtendedComment): string {
  return `${SEVERITY_BADGE[c.severity]} · ${ISSUE_TYPE_BADGE[c.issueType]}\n\n${c.body}`;
}

// ─── Claude-powered review ────────────────────────────────────────────────────

const DEPTH_CONFIG = {
  quick: {
    maxComments: 3,
    maxTokens: 1024,
    instruction: 'Do a fast surface-level scan. Focus only on obvious bugs and critical security issues.',
  },
  standard: {
    maxComments: 10,
    maxTokens: 4096,
    instruction: 'Do a balanced review. Use the full file content alongside the diff to detect cross-line security and logic issues.',
  },
  thorough: {
    maxComments: 20,
    maxTokens: 8192,
    instruction: 'Do an exhaustive deep analysis. Use the full file content to trace data flow, find auth bypasses, injection sinks, and architectural concerns that span beyond the changed lines.',
  },
};

function buildIssueTypeInstructions(issueTypes: RepoReviewSettings['issueTypes']): string {
  const enabled: string[] = [];
  const disabled: string[] = [];

  if (issueTypes.bugs) enabled.push('Bugs, logic errors, off-by-one errors, null/undefined issues');
  else disabled.push('bugs');

  if (issueTypes.security) enabled.push('Security issues (SQL/command injection, auth bypass, exposed secrets, XSS, path traversal, insecure deserialization, CSRF, IDOR, insecure dependencies)');
  else disabled.push('security');

  if (issueTypes.performance) enabled.push('Performance problems (N+1 queries, missing indexes, unnecessary loops, memory leaks)');
  else disabled.push('performance');

  if (issueTypes.style) enabled.push('Code quality (unclear names, missing error handling, dead code, overly complex logic)');
  else disabled.push('style');

  if (issueTypes.documentation) enabled.push('Missing or incorrect documentation and comments');
  else disabled.push('documentation');

  const lines = [`Check ONLY for these issue types:\n${enabled.map((e) => `- ${e}`).join('\n')}`];
  if (disabled.length > 0) lines.push(`Do NOT report on: ${disabled.join(', ')}`);
  return lines.join('\n');
}

async function generateReview(
  title: string,
  body: string,
  diffContext: string,
  files: { filename: string; patch?: string }[],
  settings: RepoReviewSettings,
): Promise<ReviewResult> {
  const depth = DEPTH_CONFIG[settings.reviewDepth] ?? DEPTH_CONFIG.standard;
  const issueInstructions = buildIssueTypeInstructions(settings.issueTypes);

  const systemPrompt = `You are CodeKang, an expert code reviewer and security analyst. ${depth.instruction}

${issueInstructions}

For each file you may receive both the diff (what changed) and the full current file content.
Use the full file to catch issues that span beyond the changed lines — for example, a changed function call that now bypasses an auth check 30 lines away.

For each issue, identify the exact file and line number from the diff.

Respond ONLY as valid JSON (no markdown wrapper):
{
  "summary": "Overall review summary (2-3 sentences)",
  "verdict": "APPROVE" | "COMMENT" | "REQUEST_CHANGES",
  "comments": [
    {
      "path": "relative/file/path.ts",
      "line": <line number in the diff>,
      "body": "Specific issue description with suggested fix",
      "severity": "low" | "medium" | "high" | "critical",
      "issueType": "security" | "bug" | "performance" | "style" | "documentation"
    }
  ]
}

Rules:
- verdict APPROVE if no significant issues found
- verdict REQUEST_CHANGES only for bugs or security issues (severity high/critical)
- verdict COMMENT for style/improvement/medium suggestions
- Limit to at most ${depth.maxComments} inline comments — focus on the most important issues
- Only comment on lines that appear in the diff (+ prefix lines)
- severity "critical": must fix before merge (security holes, data loss, crashes)
- severity "high": serious issue, strongly recommend fixing
- severity "medium": notable improvement needed
- severity "low": minor style or optional improvement`;

  const userMessage = `PR: ${title}

${body ? `Description:\n${body}\n\n` : ''}${diffContext}`;

  const response = await ai.messages.create({
    model: env.ANTHROPIC_MODEL_AGENT,
    max_tokens: depth.maxTokens,
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
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    const parsed = JSON.parse(jsonMatch[0]) as ReviewResult;

    const validPaths = new Set(files.map((f) => f.filename));
    const validComments = (parsed.comments ?? []).filter((c) => validPaths.has(c.path));

    return {
      summary: parsed.summary ?? 'Reviewed by CodeKang.',
      verdict: parsed.verdict ?? 'COMMENT',
      comments: validComments.slice(0, depth.maxComments),
    };
  } catch (err) {
    logger.warn('Failed to parse review JSON, posting summary only', { err });
    return { summary: text.slice(0, 500), verdict: 'COMMENT', comments: [] };
  }
}

// ─── Auto-raise GitHub issues for critical/high findings ─────────────────────

async function raiseIssuesForFindings(
  owner: string,
  repo: string,
  prNumber: number,
  prTitle: string,
  prUrl: string,
  comments: ExtendedComment[],
  settings: RepoReviewSettings,
  installationId?: number,
): Promise<void> {
  const shouldRaise = (c: ExtendedComment): boolean => {
    if (c.severity !== 'critical' && c.severity !== 'high') return false;
    if (c.issueType === 'security' && settings.issueTypes.security) return true;
    if (c.issueType === 'bug' && c.severity === 'critical' && settings.issueTypes.bugs) return true;
    return false;
  };

  const findings = comments.filter(shouldRaise);
  if (findings.length === 0) return;

  logger.info('Raising GitHub issues for critical findings', {
    owner, repo, prNumber, count: findings.length,
  });

  await Promise.all(
    findings.map(async (finding) => {
      const typeLabel = finding.issueType === 'security' ? '🔒 Security' : '🐛 Bug';
      const title = `[CodeKang] ${typeLabel}: ${finding.body.split('\n')[0].slice(0, 80)}`;
      const body = [
        `**Found during PR review of [#${prNumber} ${prTitle}](${prUrl})**`,
        '',
        `**File:** \`${finding.path}\` (line ${finding.line})`,
        `**Severity:** ${SEVERITY_BADGE[finding.severity]}`,
        `**Type:** ${ISSUE_TYPE_BADGE[finding.issueType]}`,
        '',
        '---',
        '',
        finding.body,
        '',
        '---',
        '_Automatically raised by [CodeKang](https://codekang.com) during PR review._',
      ].join('\n');

      const labels = ['codekang-auto', finding.issueType];

      const created = await createIssueForFinding(owner, repo, title, body, labels, installationId);
      if (created) {
        logger.info('Issue raised for finding', {
          owner, repo, prNumber, issueNumber: created.number, severity: finding.severity,
        });
      }
    }),
  );
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

export interface PRReviewRow {
  id: number;
  owner: string;
  repo: string;
  pr_number: number;
  pr_title: string | null;
  head_sha: string | null;
  head_branch: string | null;
  summary: string;
  verdict: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
  comments: ExtendedComment[];
  fix_status: 'none' | 'pending' | 'running' | 'done' | 'failed';
  fix_pr_url: string | null;
  fix_branch: string | null;
  installation_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export async function upsertPRReview(
  owner: string,
  repo: string,
  prNumber: number,
  prTitle: string,
  headSha: string,
  headBranch: string,
  summary: string,
  verdict: ReviewResult['verdict'],
  comments: ExtendedComment[],
  installationId?: number,
): Promise<void> {
  await db.query(
    `INSERT INTO pr_reviews
       (owner, repo, pr_number, pr_title, head_sha, head_branch, summary, verdict, comments, installation_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (owner, repo, pr_number) DO UPDATE SET
       pr_title        = EXCLUDED.pr_title,
       head_sha        = EXCLUDED.head_sha,
       head_branch     = EXCLUDED.head_branch,
       summary         = EXCLUDED.summary,
       verdict         = EXCLUDED.verdict,
       comments        = EXCLUDED.comments,
       installation_id = EXCLUDED.installation_id,
       fix_status      = 'none',
       fix_pr_url      = NULL,
       fix_branch      = NULL,
       updated_at      = NOW()`,
    [
      owner,
      repo,
      prNumber,
      prTitle,
      headSha,
      headBranch,
      summary,
      verdict,
      JSON.stringify(comments),
      installationId ?? null,
    ],
  );
}

export async function loadPRReview(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<PRReviewRow | null> {
  const { rows } = await db.query<PRReviewRow>(
    `SELECT * FROM pr_reviews WHERE owner=$1 AND repo=$2 AND pr_number=$3`,
    [owner, repo, prNumber],
  );
  return rows[0] ?? null;
}

export async function updatePRReviewFixStatus(
  owner: string,
  repo: string,
  prNumber: number,
  fixStatus: PRReviewRow['fix_status'],
  fixPrUrl?: string,
  fixBranch?: string,
): Promise<void> {
  await db.query(
    `UPDATE pr_reviews
     SET fix_status=$4, fix_pr_url=$5, fix_branch=$6, updated_at=NOW()
     WHERE owner=$1 AND repo=$2 AND pr_number=$3`,
    [owner, repo, prNumber, fixStatus, fixPrUrl ?? null, fixBranch ?? null],
  );
}
