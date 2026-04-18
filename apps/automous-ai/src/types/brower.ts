// ─── Browser / Playwright Types ───────────────────────────────────────────────

export interface ScreenshotOptions {
  url: string;
  fullPage?: boolean;
  width?: number;
  height?: number;
  waitForSelector?: string;
  waitMs?: number;
  outputPath?: string;
}

export interface ScreenshotResult {
  path: string;
  width: number;
  height: number;
  url: string;
  takenAt: string; // ISO string
}

export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  contentType: string;
  durationMs: number;
  failed: boolean;
  errorText?: string;
}

export interface CapturedError {
  type: 'console' | 'page-error' | 'request-failed';
  message: string;
  source?: string;
  line?: number;
  column?: number;
  url?: string;
  timestamp: string;
}

export interface BrowserTestResult {
  url: string;
  screenshot?: ScreenshotResult;
  errors: CapturedError[];
  failedRequests: NetworkRequest[];
  consoleMessages: string[];
  hasCriticalErrors: boolean;
  summary: string;
}
