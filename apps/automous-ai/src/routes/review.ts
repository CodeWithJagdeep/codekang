import { Router, type Request, type Response } from 'express';
import { logger } from '../utils/logger';
import { db } from '../config/database';
import { loadPRReview, updatePRReviewFixStatus } from '../services/review-service';
import { fixPRQueue } from '../queue/index';

const router = Router();

// ─── GET /review/stats ────────────────────────────────────────────────────────
// Aggregated analytics for a list of repos.
// Query params:
//   repos: comma-separated "owner/repo" strings (required)
//   days:  7 | 30 | 90 | 0 (0 = all time, default 30)

router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  const reposParam = (req.query.repos as string | undefined) ?? '';
  const daysParam  = parseInt((req.query.days as string | undefined) ?? '30', 10);

  const repoKeys = reposParam
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.includes('/'));

  if (repoKeys.length === 0) {
    res.json(emptyStats());
    return;
  }

  try {
    const dateFilter = daysParam > 0
      ? `AND created_at >= NOW() - INTERVAL '${daysParam} days'`
      : '';
    const prevDateFilter = daysParam > 0
      ? `AND created_at >= NOW() - INTERVAL '${daysParam * 2} days' AND created_at < NOW() - INTERVAL '${daysParam} days'`
      : "AND created_at < NOW() - INTERVAL '30 days'";

    const repoArray = `ARRAY[${repoKeys.map((_, i) => `$${i + 1}`).join(',')}]::text[]`;
    const params = repoKeys;

    // ── Current period totals ────────────────────────────────────────────────
    const totalsRes = await db.query<{
      total_reviews: string;
      total_bugs: string;
      fixed: string;
      approved: string;
      request_changes: string;
      commented: string;
    }>(
      `SELECT
         COUNT(*)                                                       AS total_reviews,
         SUM(jsonb_array_length(comments))                              AS total_bugs,
         COUNT(*) FILTER (WHERE fix_status = 'done')                   AS fixed,
         COUNT(*) FILTER (WHERE verdict = 'APPROVE')                   AS approved,
         COUNT(*) FILTER (WHERE verdict = 'REQUEST_CHANGES')           AS request_changes,
         COUNT(*) FILTER (WHERE verdict = 'COMMENT')                   AS commented
       FROM pr_reviews
       WHERE (owner || '/' || repo) = ANY(${repoArray})
         ${dateFilter}`,
      params,
    );

    // ── Previous period totals (for delta %) ──────────────────────────────────
    const prevRes = await db.query<{
      total_reviews: string;
      total_bugs: string;
      fixed: string;
    }>(
      `SELECT
         COUNT(*)                                       AS total_reviews,
         SUM(jsonb_array_length(comments))              AS total_bugs,
         COUNT(*) FILTER (WHERE fix_status = 'done')   AS fixed
       FROM pr_reviews
       WHERE (owner || '/' || repo) = ANY(${repoArray})
         ${prevDateFilter}`,
      params,
    );

    // ── Daily breakdown ───────────────────────────────────────────────────────
    const dailyRes = await db.query<{
      date: string;
      reviews: string;
      bugs: string;
    }>(
      `SELECT
         DATE(created_at)                          AS date,
         COUNT(*)                                  AS reviews,
         SUM(jsonb_array_length(comments))         AS bugs
       FROM pr_reviews
       WHERE (owner || '/' || repo) = ANY(${repoArray})
         ${dateFilter}
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      params,
    );

    // ── Per-repo breakdown ────────────────────────────────────────────────────
    const repoRes = await db.query<{
      owner: string;
      repo: string;
      reviews: string;
      bugs: string;
      fixed: string;
    }>(
      `SELECT
         owner,
         repo,
         COUNT(*)                                      AS reviews,
         SUM(jsonb_array_length(comments))             AS bugs,
         COUNT(*) FILTER (WHERE fix_status = 'done')  AS fixed
       FROM pr_reviews
       WHERE (owner || '/' || repo) = ANY(${repoArray})
         ${dateFilter}
       GROUP BY owner, repo
       ORDER BY reviews DESC`,
      params,
    );

    // ── Recent suggestions ────────────────────────────────────────────────────
    const recentRes = await db.query<{
      owner: string;
      repo: string;
      pr_number: number;
      pr_title: string | null;
      verdict: string;
      fix_status: string;
      fix_pr_url: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT owner, repo, pr_number, pr_title, verdict, fix_status, fix_pr_url,
              created_at, updated_at
       FROM pr_reviews
       WHERE (owner || '/' || repo) = ANY(${repoArray})
       ORDER BY updated_at DESC
       LIMIT 20`,
      params,
    );

    const t = totalsRes.rows[0] ?? {};
    const p = prevRes.rows[0] ?? {};

    res.json({
      totals: {
        reviews:        parseInt(t.total_reviews ?? '0', 10),
        bugs:           parseInt(t.total_bugs   ?? '0', 10),
        fixed:          parseInt(t.fixed         ?? '0', 10),
        approved:       parseInt(t.approved      ?? '0', 10),
        requestChanges: parseInt(t.request_changes ?? '0', 10),
        commented:      parseInt(t.commented     ?? '0', 10),
      },
      prev: {
        reviews: parseInt(p.total_reviews ?? '0', 10),
        bugs:    parseInt(p.total_bugs    ?? '0', 10),
        fixed:   parseInt(p.fixed         ?? '0', 10),
      },
      daily: dailyRes.rows.map((r) => ({
        date:    r.date,
        reviews: parseInt(r.reviews, 10),
        bugs:    parseInt(r.bugs ?? '0', 10),
      })),
      byRepo: repoRes.rows.map((r) => ({
        owner:   r.owner,
        repo:    r.repo,
        reviews: parseInt(r.reviews, 10),
        bugs:    parseInt(r.bugs ?? '0', 10),
        fixed:   parseInt(r.fixed ?? '0', 10),
      })),
      recent: recentRes.rows,
    });
  } catch (err) {
    logger.error('Failed to fetch review stats', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

function emptyStats() {
  return {
    totals:  { reviews: 0, bugs: 0, fixed: 0, approved: 0, requestChanges: 0, commented: 0 },
    prev:    { reviews: 0, bugs: 0, fixed: 0 },
    daily:   [],
    byRepo:  [],
    recent:  [],
  };
}

// ─── GET /review/:owner/:repo/:prNumber ───────────────────────────────────────

router.get(
  '/:owner/:repo/:prNumber',
  async (req: Request, res: Response): Promise<void> => {
    const { owner, repo, prNumber } = req.params as Record<string, string>;
    const prNum = parseInt(prNumber, 10);

    if (isNaN(prNum)) {
      res.status(400).json({ error: 'Invalid PR number' });
      return;
    }

    try {
      const review = await loadPRReview(owner, repo, prNum);
      if (!review) {
        res.status(404).json({ error: 'No review found for this PR' });
        return;
      }
      res.json(review);
    } catch (err) {
      logger.error('Failed to load PR review', { owner, repo, prNum, error: (err as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// ─── POST /review/:owner/:repo/:prNumber/fix ─────────────────────────────────

router.post(
  '/:owner/:repo/:prNumber/fix',
  async (req: Request, res: Response): Promise<void> => {
    const { owner, repo, prNumber } = req.params as Record<string, string>;
    const prNum = parseInt(prNumber, 10);

    if (isNaN(prNum)) {
      res.status(400).json({ error: 'Invalid PR number' });
      return;
    }

    try {
      const review = await loadPRReview(owner, repo, prNum);
      if (!review) {
        res.status(404).json({ error: 'No review found for this PR' });
        return;
      }
      if (review.fix_status === 'running' || review.fix_status === 'pending') {
        res.json({ status: review.fix_status, message: 'Fix is already in progress' });
        return;
      }
      if (review.fix_status === 'done') {
        res.json({ status: 'done', prUrl: review.fix_pr_url });
        return;
      }
      if (review.verdict === 'APPROVE') {
        res.status(400).json({ error: 'PR was approved — no issues to fix' });
        return;
      }

      await updatePRReviewFixStatus(owner, repo, prNum, 'pending');
      await fixPRQueue.add('fix-pr', {
        owner,
        repo,
        prNumber: prNum,
        approvedBy: (req.body as { approvedBy?: string }).approvedBy ?? 'ui',
        installationId: review.installation_id ?? undefined,
        triggeredAt: new Date().toISOString(),
      });

      logger.info('Fix-PR queued via API', { owner, repo, prNum });
      res.json({ status: 'pending', message: 'Fix queued — agent will apply changes shortly' });
    } catch (err) {
      logger.error('Failed to queue fix-PR', { owner, repo, prNum, error: (err as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export default router;
