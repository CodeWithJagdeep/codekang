/**
 * playwright.ts
 * Thin wrapper around src/config/browser.ts.
 * Re-exports the singleton getBrowser / createContext / closeBrowser
 * and adds the convenience createPage() factory used across the browser module.
 */
import { Page } from 'playwright';
import { env } from '../config/env';
import { getBrowser, createContext, closeBrowser } from '../config/browser';

// ─── Re-export config-level primitives ───────────────────────────────────────
export { getBrowser, createContext, closeBrowser };

// ─── Page factory ─────────────────────────────────────────────────────────────

export async function createPage(): Promise<{
  page: Page;
  context: import('playwright').BrowserContext;
}> {
  const context = await createContext();
  const page = await context.newPage();
  page.setDefaultTimeout(env.BROWSER_TIMEOUT);
  return { page, context };
}
