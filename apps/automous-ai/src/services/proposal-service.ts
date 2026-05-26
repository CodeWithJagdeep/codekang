import { db } from '../config/database';
import { ai } from '../config/ai/index';
import { createIssueComment } from '../github/api';
import { logger } from '../utils/logger';
import type { ClassificationResult } from '../types/agent';

// ─── Structured proposal extracted from analysis ──────────────────────────────

export interface FixProposal {
  rootCause: string;
  filesToChange: { file: string; change: string }[];
  proposedSolution: string;
  testStrategy: string;
  confidence: number;
}

export interface PendingProposal {
  id: number;
  owner: string;
  repo: string;
  issueNumber: number;
  issueTitle: string;
  issueBody: string;
  installationId?: number;
  analysis: string;
  category: string;
  strategy: string;
  confidence: number;
  complexity: string;
  filesToChange: string[];
  proposedSolution: string;
  needsEnvironment: boolean;
  status: 'awaiting_approval' | 'executing' | 'done' | 'rejected';
}

// ─── Extract structured proposal from free-form analysis text ────────────────

export async function extractStructuredProposal(
  analysisSummary: string,
  issueTitle: string,
  issueBody: string,
): Promise<FixProposal> {
  const prompt = `You are reviewing a code analysis report and must extract a structured fix proposal.

Issue: ${issueTitle}
${issueBody.slice(0, 500)}

Analysis Report:
${analysisSummary}

Return ONLY a JSON object (no markdown, no extra text):
{
  "rootCause": "<one clear sentence describing the exact root cause>",
  "filesToChange": [
    { "file": "<relative/file/path.ts>", "change": "<what specifically needs to change and why>" }
  ],
  "proposedSolution": "<2-4 sentences: what code change will fix this and how>",
  "testStrategy": "<how to verify the fix works: specific test command or test case to write>",
  "confidence": <0.0-1.0>
}`;

  try {
    const response = await ai.classify([{ role: 'user', content: prompt }], {
      maxTokens: 600,
      temperature: 0.1,
    });
    const raw = response.content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    return JSON.parse(raw) as FixProposal;
  } catch (err) {
    logger.warn('Proposal extraction failed, building from summary', {
      error: (err as Error).message,
    });
    // Graceful fallback: build minimal proposal from raw summary
    return {
      rootCause: analysisSummary.slice(0, 300),
      filesToChange: [],
      proposedSolution: analysisSummary.slice(0, 500),
      testStrategy: 'Run the existing test suite',
      confidence: 0.5,
    };
  }
}

// ─── Save pending proposal to DB ──────────────────────────────────────────────

export async function savePendingProposal(
  owner: string,
  repo: string,
  issueNumber: number,
  issueTitle: string,
  issueBody: string,
  installationId: number | undefined,
  classification: ClassificationResult,
  analysis: string,
  proposal: FixProposal,
  githubCommentId?: number,
): Promise<number> {
  const filesList = proposal.filesToChange.map((f) => f.file);
  const { rows } = await db.query<{ id: number }>(
    `INSERT INTO fix_proposals
       (owner, repo, issue_number, issue_title, issue_body, installation_id,
        analysis, category, strategy, confidence, complexity, needs_environment,
        files_to_change, proposed_solution, github_comment_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING id`,
    [
      owner,
      repo,
      issueNumber,
      issueTitle,
      issueBody,
      installationId ?? null,
      analysis,
      classification.category,
      classification.strategy,
      classification.confidence,
      classification.estimatedComplexity,
      classification.needsEnvironment,
      filesList,
      proposal.proposedSolution,
      githubCommentId ?? null,
    ],
  );
  if (!rows[0]) throw new Error('Failed to save proposal to DB');
  return rows[0].id;
}

// ─── Load pending proposal ────────────────────────────────────────────────────

export async function loadPendingProposal(
  owner: string,
  repo: string,
  issueNumber: number,
): Promise<PendingProposal | null> {
  const { rows } = await db.query<PendingProposal>(
    `SELECT id, owner, repo, issue_number AS "issueNumber",
            issue_title AS "issueTitle", issue_body AS "issueBody",
            installation_id AS "installationId",
            analysis, category, strategy, confidence, complexity,
            needs_environment AS "needsEnvironment",
            files_to_change AS "filesToChange",
            proposed_solution AS "proposedSolution", status
     FROM fix_proposals
     WHERE owner = $1 AND repo = $2 AND issue_number = $3
       AND status = 'awaiting_approval'
     ORDER BY created_at DESC
     LIMIT 1`,
    [owner, repo, issueNumber],
  );
  return rows[0] ?? null;
}

export async function markProposalStatus(
  proposalId: number,
  status: PendingProposal['status'],
): Promise<void> {
  await db.query(
    `UPDATE fix_proposals SET status = $1, updated_at = NOW() WHERE id = $2`,
    [status, proposalId],
  );
}

// ─── Post the structured proposal comment to GitHub ──────────────────────────

export async function postProposalComment(
  owner: string,
  repo: string,
  issueNumber: number,
  classification: ClassificationResult,
  analysis: string,
  proposal: FixProposal,
  installationId?: number,
): Promise<void> {
  const confidencePct = (proposal.confidence * 100).toFixed(0);
  const categoryBadge = classification.category.toUpperCase();

  const fileRows =
    proposal.filesToChange.length > 0
      ? proposal.filesToChange
          .map((f) => `| \`${f.file}\` | ${f.change} |`)
          .join('\n')
      : '| *(not identified yet)* | See proposed solution below |';

  const body = [
    `## 🤖 CodeKang — Fix Proposal`,
    ``,
    `| | |`,
    `|---|---|`,
    `| **Category** | ${categoryBadge} |`,
    `| **Strategy** | ${classification.strategy} |`,
    `| **Confidence** | ${confidencePct}% |`,
    `| **Complexity** | ${classification.estimatedComplexity} |`,
    ``,
    `### 🔍 Root Cause`,
    ``,
    proposal.rootCause,
    ``,
    `### 📋 Full Analysis`,
    ``,
    `<details><summary>Click to expand</summary>`,
    ``,
    analysis,
    ``,
    `</details>`,
    ``,
    `### 📁 Files to Change`,
    ``,
    `| File | What changes |`,
    `|---|---|`,
    fileRows,
    ``,
    `### 💡 Proposed Solution`,
    ``,
    proposal.proposedSolution,
    ``,
    `### ✅ Verification Strategy`,
    ``,
    proposal.testStrategy,
    ``,
    `---`,
    ``,
    `### ▶️ How to proceed`,
    ``,
    `Reply with one of these commands to have CodeKang implement the fix automatically:`,
    ``,
    `| Command | What happens |`,
    `|---|---|`,
    `| \`@codekang fix\` | CodeKang applies the fix, runs tests, and opens a PR |`,
    `| \`/fix\` | Same as above |`,
    ``,
    `> ℹ️ Only the issue author or repo maintainers should approve. CodeKang will not act until one of the above commands is posted.`,
  ].join('\n');

  await createIssueComment(owner, repo, issueNumber, body, installationId);
}
