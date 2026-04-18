/**
 * error-capture.ts
 * Captures console errors, uncaught exceptions, and failed requests
 * from a Playwright page — used to detect UI bugs automatically.
 */
import { Page } from 'playwright';
import { logger } from '../utils/logger';
import { CapturedError, BrowserTestResult } from '../types/brower';
import { createPage } from './playwright';
import { takeScreenshot } from './screenshot';
import { attachNetworkListener } from './network';
import { env } from '../config/env';

// ─── Attach error listeners ───────────────────────────────────────────────────

export function attachErrorCapture(page: Page): {
  getErrors: () => CapturedError[];
} {
  const errors: CapturedError[] = [];

  // Console messages (errors and warnings)
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      errors.push({
        type: 'console',
        message: msg.text(),
        source: msg.location()?.url,
        line: msg.location()?.lineNumber,
        column: msg.location()?.columnNumber,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Uncaught page exceptions
  page.on('pageerror', (err) => {
    logger.debug('Page error captured', { message: err.message });
    errors.push({
      type: 'page-error',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  });

  return {
    getErrors: () => [...errors],
  };
}

// ─── Full UI test run ─────────────────────────────────────────────────────────
// Navigates to a URL, captures errors, takes a screenshot, returns a report.

export async function runBrowserTest(url: string): Promise<BrowserTestResult> {
  if (!env.ENABLE_BROWSER_TESTING) {
    return {
      url,
      errors: [],
      failedRequests: [],
      consoleMessages: [],
      hasCriticalErrors: false,
      summary: 'Browser testing is disabled via ENABLE_BROWSER_TESTING=false',
    };
  }

  const { page, context } = await createPage();
  const consoleMessages: string[] = [];

  try {
    const { getErrors } = attachErrorCapture(page);
    const { getFailedRequests } = attachNetworkListener(page);

    // Capture all console messages for logging
    page.on('console', (msg) =>
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`),
    );

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: env.BROWSER_TIMEOUT,
    });

    // Optionally take a screenshot for UI bug reports
    let screenshot;
    if (env.BROWSER_TEST_FOR_UI_BUGS) {
      screenshot = await takeScreenshot({ url });
    }

    const errors = getErrors();
    const failedRequests = getFailedRequests();
    const hasCriticalErrors =
      errors.some((e) => e.type === 'page-error') || failedRequests.length > 0;

    const summary = hasCriticalErrors
      ? `Found ${errors.length} error(s) and ${failedRequests.length} failed request(s) on ${url}`
      : `No critical errors found on ${url}`;

    logger.debug('Browser test complete', { url, hasCriticalErrors });

    return {
      url,
      screenshot,
      errors,
      failedRequests,
      consoleMessages,
      hasCriticalErrors,
      summary,
    };
  } finally {
    await context.close();
  }
}
