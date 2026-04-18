import { ai } from '../config/ai/index';
import { createIssueComment, labelIssue } from '../github/api';
import { logger } from '../utils/logger';
import type { ClassificationResult } from '../types/agent';

// ─── Admin logins ─────────────────────────────────────────────────────────────

export function getAdminLogins(): string[] {
  return (process.env['ADMIN_GITHUB_LOGINS'] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ─── Label names CodeKang manages ─────────────────────────────────────────────

const LABELS: Record<string, string> = {
  fix: 'codekang: fixing',
  guide: 'codekang: guidance-posted',
  discuss: 'codekang: needs-discussion',
  clarify: 'codekang: needs-more-info',
};

const PERMISSION_FOOTER = `

---

### ▶️ How to proceed

| Command | What happens |
|---|---|
| \`/fix\` | CodeKang implements this automatically and opens a PR |
| \`@codekang fix\` | Same as above |

> ℹ️ CodeKang will not touch any code until a command is posted by the issue author or a maintainer.`;

// ─── Guide generator ──────────────────────────────────────────────────────────

async function generateGuide(
  issueTitle: string,
  issueBody: string,
  classification: ClassificationResult,
): Promise<string> {
  const prompt = `You are an expert open-source contributor writing a helpful GitHub comment.

A contributor opened this issue:
Title: ${issueTitle}
Body:
${issueBody}

Classification: ${classification.category} — ${classification.reasoning}
Complexity: ${classification.estimatedComplexity}

Write a friendly, technically precise comment that:
1. Acknowledges the issue in 1-2 sentences
2. Explains the root cause (if identifiable from the issue)
3. Gives a numbered step-by-step guide for a contributor to fix it
4. Includes a code snippet or pseudocode showing the approach (use markdown fences)
5. Mentions what tests to write or update
6. Ends with an encouraging call-to-action ("PRs welcome!")

Keep it under 400 words. Use GitHub-flavoured markdown. Do NOT say you are an AI.
Write as if you are a senior maintainer responding to the issue.`;

  try {
    const response = await ai.classify([{ role: 'user', content: prompt }], {
      maxTokens: 800,
      temperature: 0.3,
    });
    return response.content.trim();
  } catch (err: unknown) {
    logger.warn('Guide generation failed, using fallback', {
      error: (err as Error).message,
    });
    return [
      `Thanks for reporting this! This looks like a **${classification.category}** issue.`,
      ``,
      `### How to contribute a fix`,
      ``,
      `1. Fork the repository and create a branch: \`git checkout -b fix/issue-title\``,
      `2. Identify the relevant code based on the issue description`,
      `3. Apply the minimal fix`,
      `4. Add or update tests to cover the case`,
      `5. Open a pull request — the CI will run automatically`,
      ``,
      `**Reasoning:** ${classification.reasoning}`,
      ``,
      `PRs welcome! Feel free to comment here if you need guidance.`,
    ].join('\n');
  }
}

// ─── Comment builders ─────────────────────────────────────────────────────────

function buildDiscussionComment(
  classification: ClassificationResult,
  admins: string[],
): string {
  const mentions = admins.map((m) => `@${m}`).join(' ');
  return [
    `## 💬 CodeKang — Design Decision Needed`,
    ``,
    `This issue requires a maintainer decision before any code is written.`,
    ``,
    `**Category:** ${classification.category}`,
    `**Reason:** ${classification.reasoning}`,
    ``,
    admins.length > 0
      ? `Pinging maintainers for input: ${mentions}`
      : `Please clarify the intended approach so CodeKang can proceed.`,
    PERMISSION_FOOTER,
  ].join('\n');
}

function buildClarificationComment(issueBody: string): string {
  const missing: string[] = [];
  if (
    !issueBody.toLowerCase().includes('reproduce') &&
    !issueBody.toLowerCase().includes('steps')
  ) {
    missing.push(
      '**Steps to reproduce** — what exact code triggers the issue?',
    );
  }
  if (
    !issueBody.toLowerCase().includes('expect') &&
    !issueBody.toLowerCase().includes('actual')
  ) {
    missing.push(
      '**Expected vs actual behaviour** — what should happen vs what does?',
    );
  }
  if (!issueBody.toLowerCase().includes('version')) {
    missing.push('**Version info** — library version, language runtime, OS');
  }

  const questions =
    missing.length > 0
      ? missing
      : [
          'Can you share a minimal reproduction case?',
          'Which version of the library are you using?',
        ];

  return [
    `## ❓ CodeKang — More Information Needed`,
    ``,
    `Thanks for opening this issue! To investigate and fix it, CodeKang needs a bit more info:`,
    ``,
    ...questions.map((q) => `- ${q}`),
    ``,
    `Once you've added these details, CodeKang will re-analyze the issue.`,
    PERMISSION_FOOTER,
  ].join('\n');
}

// ─── AI Response Generator ───────────────────────────────────────────────────

async function generateAIResponse(
  issueTitle: string,
  issueBody: string,
  classification: ClassificationResult,
  analysisSummary?: string,
): Promise<string> {
  const { responseType, category, reasoning } = classification;

  let goal = '';
  if (responseType === 'guide') {
    goal =
      'Explain the root cause and provide a step-by-step guide for a contributor to fix this themselves.';
  } else if (responseType === 'clarify') {
    goal =
      "Explain that you've analyzed the issue but need specific missing information (repro steps, versions, etc.) to proceed with a fix.";
  } else if (responseType === 'discuss') {
    goal =
      'Explain that a design decision or maintainer input is needed before this can be implemented.';
  }

  const prompt = `You are CodeKang, an AI agent that reviews GitHub issues.

Issue: ${issueTitle}
Description: ${issueBody}
Classification: ${category}
${analysisSummary ? `Code Analysis: ${analysisSummary}` : ''}

Goal: ${goal}

Rules:
- Be brief and direct. Max 150 words.
- No headers, no tables, no long lists.
- For clarify: ask only the 1-2 most important missing details as bullet points.
- For guide: give the key fix in 2-3 sentences with a short code snippet if helpful.
- For discuss: one sentence explaining what decision is needed.
- Do NOT say you are an AI. Do NOT add sign-offs or footers.
- Use plain GitHub markdown only.`;

  try {
    const response = await ai.classify([{ role: 'user', content: prompt }], {
      maxTokens: 800,
      temperature: 0.3,
    });
    return response.content.trim();
  } catch (err: unknown) {
    logger.warn('AI guidance generation failed, using fallback', {
      error: (err as Error).message,
    });
    return `Thanks for reporting! This looks like a **${category}** issue. We've classified it for research. Reasoning: ${reasoning}`;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function postGuidanceResponse(
  owner: string,
  repo: string,
  issueNumber: number,
  issueTitle: string,
  issueBody: string,
  classification: ClassificationResult,
  analysisSummary?: string,
  installationId?: number,
): Promise<void> {
  const { responseType } = classification;

  logger.info('Generating autonomous response...', {
    issueNumber,
    responseType,
    hasAnalysis: !!analysisSummary,
  });

  const aiBody = await generateAIResponse(
    issueTitle,
    issueBody,
    classification,
    analysisSummary,
  );

  const showFixFooter = responseType === 'guide';
  const body = [aiBody, ...(showFixFooter ? [PERMISSION_FOOTER] : [])].join(
    '\n',
  );

  await createIssueComment(owner, repo, issueNumber, body, installationId);

  const label = LABELS[responseType] ?? LABELS['guide'];
  await labelIssue(owner, repo, issueNumber, [label], installationId).catch(
    () => {
      // Labels may not exist in the repo yet — non-fatal
    },
  );

  logger.info('Guidance response posted', {
    owner,
    repo,
    issueNumber,
    responseType,
  });
}
