import { openTable, TABLE } from './tables';
import { generateEmbedding } from '../embeddings';
import { db } from '../../config/database';
import { logger } from '../../utils/logger';

// ─── Index a GitHub issue into LanceDB ───────────────────────────────────────
// Called when an issue is received (fix job) so retrieval has issue context.

export async function indexIssueInLance(params: {
  repoId?: number;
  owner: string;
  repoName: string;
  issueNumber: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: string[];
}): Promise<void> {
  const { owner, repoName, issueNumber, title, body, state, labels } = params;

  try {
    // Resolve repoId from DB if not provided
    let repoId = params.repoId ?? 0;
    if (!repoId) {
      const { rows } = await db.query<{ id: number }>(
        'SELECT id FROM repos WHERE full_name = $1',
        [`${owner}/${repoName}`],
      );
      repoId = rows[0]?.id ?? 0;
      if (!repoId) return; // repo not yet indexed — skip
    }
    const embedText =
      `Issue #${issueNumber}: ${title}\n` +
      `Labels: ${labels.join(', ')}\n\n` +
      body.slice(0, 2000);

    const embedding = await generateEmbedding(embedText);
    const tbl = await openTable(TABLE.ISSUE);

    // Upsert — delete old version first
    await tbl.delete(`repo_id = ${repoId} AND issue_number = ${issueNumber}`);

    await tbl.add([
      {
        id: `${repoId}:issue:${issueNumber}`,
        repo_id: repoId,
        owner,
        repo_name: repoName,
        issue_number: issueNumber,
        title,
        body: body.slice(0, 3000),
        state,
        labels: labels.join(','),
        vector: embedding,
      },
    ]);

    logger.debug('Issue indexed in LanceDB', { owner, repoName, issueNumber });
  } catch (err) {
    logger.warn('Failed to index issue in LanceDB (non-fatal)', {
      error: (err as Error).message,
      owner,
      repoName,
      issueNumber,
    });
  }
}
