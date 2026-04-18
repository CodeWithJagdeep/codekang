/**
 * screenshot.ts
 * Navigates to a URL and takes a full-page or viewport screenshot.
 */
import * as path from 'path';
import * as fs from 'fs';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { createPage } from './playwright';
import { ScreenshotOptions, ScreenshotResult } from '../types/brower';

// ─── Screenshot ───────────────────────────────────────────────────────────────

export async function takeScreenshot(
  options: ScreenshotOptions,
): Promise<ScreenshotResult> {
  const {
    url,
    fullPage = true,
    width = env.BROWSER_VIEWPORT_WIDTH,
    height = env.BROWSER_VIEWPORT_HEIGHT,
    waitForSelector,
    waitMs = 500,
    outputPath,
  } = options;

  // Ensure output directory exists
  const screenshotsDir = env.SCREENSHOTS_DIR;
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const filename = outputPath ?? path.join(screenshotsDir, `${Date.now()}.png`);

  const { page, context } = await createPage();

  try {
    await page.setViewportSize({ width, height });
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: env.BROWSER_TIMEOUT,
    });

    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, {
        timeout: env.BROWSER_TIMEOUT,
      });
    }

    if (waitMs > 0) {
      await page.waitForTimeout(waitMs);
    }

    await page.screenshot({ path: filename, fullPage });

    logger.debug('Screenshot taken', { url, filename });

    return {
      path: filename,
      width,
      height,
      url,
      takenAt: new Date().toISOString(),
    };
  } finally {
    await context.close();
  }
}

// ─── Compare two screenshots (pixel diff) ────────────────────────────────────
// Returns similarity ratio 0-1 (1 = identical).
// This is a lightweight byte-level comparison; for pixel-diff use pixelmatch.
export function compareScreenshots(pathA: string, pathB: string): number {
  const a = fs.readFileSync(pathA);
  const b = fs.readFileSync(pathB);

  if (a.length !== b.length) return 0;

  let same = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) same++;
  }

  return same / a.length;
}
