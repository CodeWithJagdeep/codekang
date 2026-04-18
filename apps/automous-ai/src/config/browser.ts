import { chromium, Browser, BrowserContext } from 'playwright';
import { env } from './env';

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browser) return browser;

  browser = await chromium.launch({
    headless: env.HEADLESS_BROWSER,
    timeout: env.BROWSER_TIMEOUT,
  });

  return browser;
}

export async function createContext(): Promise<BrowserContext> {
  const browser = await getBrowser();

  return browser.newContext({
    viewport: {
      width: env.BROWSER_VIEWPORT_WIDTH,
      height: env.BROWSER_VIEWPORT_HEIGHT,
    },
  });
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
