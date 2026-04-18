import { runBrowserTest } from '../browser/error-capture';
import { takeScreenshot } from '../browser/screenshot';
import { logger } from '../utils/logger';
import type { BrowserTestResult } from '../types/brower';

// ─── UI issue investigation ───────────────────────────────────────────────────

export async function testUIForIssue(
  url: string,
  issueDescription: string,
): Promise<{
  result: BrowserTestResult;
  relevant: boolean;
  summary: string;
}> {
  logger.info('Running browser test for UI issue', { url });

  const result = await runBrowserTest(url);

  // Find errors whose message overlaps with the issue description keywords
  const keywords = issueDescription
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 4);

  const relevantErrors = result.errors.filter((e) =>
    keywords.some((kw) => e.message.toLowerCase().includes(kw)),
  );

  const relevant = relevantErrors.length > 0 || result.hasCriticalErrors;

  const summary = relevant
    ? `Found ${relevantErrors.length} relevant error(s):\n` +
      relevantErrors.map((e) => `- [${e.type}] ${e.message}`).join('\n')
    : `No matching UI errors at ${url}. Total errors detected: ${result.errors.length}.`;

  return { result, relevant, summary };
}

// ─── Simple screenshot capture ────────────────────────────────────────────────

export async function captureUIState(
  url: string,
  outputPath?: string,
): Promise<string> {
  const result = await takeScreenshot({ url, fullPage: true, outputPath });
  return result.path;
}
