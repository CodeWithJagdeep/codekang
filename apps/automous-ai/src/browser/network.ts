/**
 * network.ts
 * Intercepts and records all HTTP requests made during a page load.
 * Useful for detecting failed API calls, 4xx/5xx, missing assets, etc.
 */
import { Page } from 'playwright';
import { logger } from '../utils/logger';
import { NetworkRequest } from '../types/brower';

// ─── Attach network listener to a page ───────────────────────────────────────

export function attachNetworkListener(page: Page): {
  getRequests: () => NetworkRequest[];
  getFailedRequests: () => NetworkRequest[];
} {
  const requests: NetworkRequest[] = [];
  const startTimes = new Map<string, number>();

  page.on('request', (req) => {
    startTimes.set(req.url(), Date.now());
  });

  page.on('response', async (res) => {
    const url = res.url();
    const start = startTimes.get(url) ?? Date.now();
    const durationMs = Date.now() - start;
    startTimes.delete(url);

    const contentType = res.headers()['content-type'] ?? '';

    requests.push({
      url,
      method: res.request().method(),
      status: res.status(),
      contentType,
      durationMs,
      failed: res.status() >= 400,
    });
  });

  page.on('requestfailed', (req) => {
    const url = req.url();
    const start = startTimes.get(url) ?? Date.now();
    startTimes.delete(url);

    logger.debug('Request failed', { url, error: req.failure()?.errorText });

    requests.push({
      url,
      method: req.method(),
      status: 0,
      contentType: '',
      durationMs: Date.now() - start,
      failed: true,
      errorText: req.failure()?.errorText,
    });
  });

  return {
    getRequests: () => [...requests],
    getFailedRequests: () => requests.filter((r) => r.failed),
  };
}
