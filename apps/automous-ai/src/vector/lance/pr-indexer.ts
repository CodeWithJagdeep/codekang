import { openTable, deleteByRepo, TABLE } from './tables';
import { generateEmbedding } from '../embeddings';
import { logger } from '../../utils/logger';

// ─── Index a PR review into LanceDB ──────────────────────────────────────────
// Called after every review completes so future retrievals have PR history.

export async function indexPRInLance(params: {
  repoId: number;
  owner: string;
  repoName: string;
  prNumber: number;
  prTitle: string;
  prBody: string;
  verdict: string;
  headBranch: string;
  summary: string;
}): Promise<void> {
  const {
    repoId,
    owner,
    repoName,
    prNumber,
    prTitle,
    prBody,
    verdict,
    headBranch,
    summary,
  } = params;

  try {
    // Rich embed text: title + body + summary for semantic retrieval
    const embedText =
      `PR #${prNumber}: ${prTitle}\n\n` +
      `Description:\n${prBody.slice(0, 1000)}\n\n` +
      `Review summary:\n${summary.slice(0, 500)}`;

    const embedding = await generateEmbedding(embedText);

    const tbl = await openTable(TABLE.PR);

    // Delete old version of this PR if it was re-reviewed
    await tbl.delete(`repo_id = ${repoId} AND pr_number = ${prNumber}`);

    await tbl.add([
      {
        id: `${repoId}:pr:${prNumber}`,
        repo_id: repoId,
        owner,
        repo_name: repoName,
        pr_number: prNumber,
        pr_title: prTitle,
        pr_body: prBody.slice(0, 2000),
        verdict,
        head_branch: headBranch,
        summary: summary.slice(0, 1000),
        vector: embedding,
      },
    ]);

    logger.debug('PR indexed in LanceDB', { owner, repoName, prNumber });
  } catch (err) {
    logger.warn('Failed to index PR in LanceDB (non-fatal)', {
      error: (err as Error).message,
      owner,
      repoName,
      prNumber,
    });
  }
}

// ─── Bulk delete PR history for a repo ───────────────────────────────────────

export async function deletePRHistoryForRepo(repoId: number): Promise<void> {
  await deleteByRepo(TABLE.PR, repoId);
}
