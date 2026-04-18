import { Router, type Request, type Response } from 'express';
import { listOpenIssues } from '../github/api';
import { fixQueue } from '../queue/index';
import { logger } from '../utils/logger';

const router = Router();

// ─── POST /api/admin/batch-scan ───────────────────────────────────────────────
// Fetch all open issues for a repo and queue each one for triage.
// CodeKang will classify each issue and:
//   - "fix"     → propose a code change (existing flow)
//   - "guide"   → post a step-by-step contributor guide
//   - "discuss" → ping maintainers to make a design decision
//   - "clarify" → ask for more information from the reporter
//
// Body: { owner, repo, installationId? }

router.post(
  '/batch-scan',
  async (req: Request, res: Response): Promise<void> => {
    const { owner, repo, installationId } = req.body as {
      owner?: string;
      repo?: string;
      installationId?: number;
    };

    if (!owner || !repo) {
      res.status(400).json({ error: 'owner and repo are required' });
      return;
    }

    try {
      const issues = await listOpenIssues(owner, repo);

      if (issues.length === 0) {
        res.json({ queued: 0, message: 'No open issues found' });
        return;
      }

      // Queue all issues — each gets classified and routed independently.
      // Use deduplication so re-running doesn't double-queue the same issue.
      const jobs = await Promise.allSettled(
        issues.map((issue: any) =>
          fixQueue.add(
            'fix-issue',
            {
              owner,
              repo,
              issueNumber: issue.number,
              issueTitle: issue.title,
              issueBody: issue.body ?? '',
              installationId: installationId ?? 0,
              triggeredAt: new Date().toISOString(),
            },
            {
              jobId: `batch-${owner}-${repo}-${issue.number}`,
              // Skip if already queued/processed for this issue
            },
          ),
        ),
      );

      const queued = jobs.filter((j) => j.status === 'fulfilled').length;
      const skipped = jobs.filter((j) => j.status === 'rejected').length;

      logger.info('Batch scan queued', {
        owner,
        repo,
        total: issues.length,
        queued,
        skipped,
      });

      res.json({
        owner,
        repo,
        total: issues.length,
        queued,
        skipped,
        message: `Queued ${queued} issues for triage. CodeKang will classify and respond to each one.`,
        issues: issues.map((i: any) => ({ number: i.number, title: i.title })),
      });
    } catch (err: unknown) {
      const e = err as { message: string };
      logger.error('Batch scan failed', { owner, repo, error: e.message });
      res.status(500).json({ error: e.message });
    }
  },
);

// ─── GET /api/admin/batch-scan/status ─────────────────────────────────────────
// Returns queue depth so you can see how many issues are pending.

router.get(
  '/batch-scan/status',
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        fixQueue.getWaitingCount(),
        fixQueue.getActiveCount(),
        fixQueue.getCompletedCount(),
        fixQueue.getFailedCount(),
      ]);

      res.json({ waiting, active, completed, failed });
    } catch (err: unknown) {
      const e = err as { message: string };
      res.status(500).json({ error: e.message });
    }
  },
);

export default router;
