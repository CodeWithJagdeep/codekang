import { createIssueComment } from '../github/api';
import type { ClassificationResult } from '../types/agent';

// ─── Analysis comment ─────────────────────────────────────────────────────────

export interface AnalysisCommentData {
  classification: ClassificationResult;
  analysis?: string;
  filesAffected?: string[];
  suggestion?: string;
}

export async function postAnalysisComment(
  owner: string,
  repo: string,
  issueNumber: number,
  data: AnalysisCommentData,
  installationId?: number,
): Promise<void> {
  const { classification, analysis, filesAffected, suggestion } = data;

  const lines: string[] = [
    `## 🤖 CodeKang Analysis`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| **Category** | ${classification.category} |`,
    `| **Strategy** | ${classification.strategy} |`,
    `| **Confidence** | ${(classification.confidence * 100).toFixed(0)}% |`,
    `| **Complexity** | ${classification.estimatedComplexity} |`,
    ``,
    `**Reasoning:** ${classification.reasoning}`,
  ];

  if (analysis) {
    lines.push(``, `### Root Cause`, ``, analysis);
  }

  if (filesAffected && filesAffected.length > 0) {
    lines.push(``, `### Affected Files`, ``);
    filesAffected.forEach((f) => lines.push(`- \`${f}\``));
  }

  if (suggestion) {
    lines.push(``, suggestion);
  }

  if (classification.isActionable) {
    lines.push(``, `---`, `*Applying fix automatically…*`);
  }

  await createIssueComment(
    owner,
    repo,
    issueNumber,
    lines.join('\n'),
    installationId,
  );
}

// ─── Fix result comment ───────────────────────────────────────────────────────

export interface FixCommentData {
  success: boolean;
  message: string;
  prUrl?: string;
  testOutput?: string;
}

export async function postFixComment(
  owner: string,
  repo: string,
  issueNumber: number,
  data: FixCommentData,
  installationId?: number,
): Promise<void> {
  const { success, message, prUrl, testOutput } = data;

  const lines: string[] = success
    ? [
        `## ✅ CodeKang Fix Applied`,
        ``,
        message,
        ...(prUrl ? [``, `**Pull Request:** ${prUrl}`] : []),
      ]
    : [
        `## ❌ CodeKang Fix Failed`,
        ``,
        `**Reason:** ${message}`,
        ``,
        `This issue will need manual attention.`,
      ];

  if (testOutput) {
    lines.push(
      ``,
      `<details><summary>Test Output</summary>`,
      ``,
      '```',
      testOutput.slice(0, 3000),
      '```',
      `</details>`,
    );
  }

  await createIssueComment(
    owner,
    repo,
    issueNumber,
    lines.join('\n'),
    installationId,
  );
}
