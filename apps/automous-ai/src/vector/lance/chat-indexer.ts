import { openTable, TABLE } from './tables';
import { generateEmbedding } from '../embeddings';
import { logger } from '../../utils/logger';

export type FeedbackType =
  | 'accepted'
  | 'dismissed'
  | 'helpful'
  | 'unhelpful'
  | 'false_positive';

// ─── Index a review feedback signal into LanceDB ──────────────────────────────
// Called when a user accepts/dismisses a review suggestion or replies to one.
// This creates a "learning" corpus that future reviews can retrieve to understand
// what this team considers useful vs. noise.

export async function indexChatLearningInLance(params: {
  repoId: number;
  owner: string;
  repoName: string;
  prNumber: number;
  feedbackType: FeedbackType;
  content: string;
}): Promise<void> {
  const { repoId, owner, repoName, prNumber, feedbackType, content } = params;

  try {
    const embedText = `Feedback [${feedbackType}] on PR #${prNumber}:\n${content.slice(0, 1500)}`;

    const embedding = await generateEmbedding(embedText);
    const tbl = await openTable(TABLE.CHAT);

    await tbl.add([
      {
        id: `${repoId}:chat:${prNumber}:${Date.now()}`,
        repo_id: repoId,
        owner,
        repo_name: repoName,
        feedback_type: feedbackType,
        content: content.slice(0, 2000),
        pr_number: prNumber,
        vector: embedding,
      },
    ]);

    logger.debug('Chat learning indexed', {
      owner,
      repoName,
      prNumber,
      feedbackType,
    });
  } catch (err) {
    logger.warn('Failed to index chat learning (non-fatal)', {
      error: (err as Error).message,
    });
  }
}
