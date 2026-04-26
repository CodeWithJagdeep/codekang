import { config } from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env
const envFile =
  process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
config({ path: path.resolve(process.cwd(), envFile) });

// Load .env as fallback if the specific one doesn't exist or doesn't have all values
config();

// Schema definition
const envSchema = z.object({
  // SERVER
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // DATABASE
  DATABASE_URL: z.string().url(),
  DB_POOL_MIN: z.coerce.number(),
  DB_POOL_MAX: z.coerce.number(),

  // REDIS
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string().optional(),

  // ANTHROPIC
  ANTHROPIC_API_KEY: z.string(),
  ANTHROPIC_MODEL_CLASSIFIER: z.string(),
  ANTHROPIC_MODEL_AGENT: z.string(),

  // GITHUB
  GITHUB_TOKEN: z.string(),
  GITHUB_WEBHOOK_SECRET: z.string(),
  GITHUB_APP_ID: z.string(),
  GITHUB_APP_PRIVATE_KEY_PATH: z.string(),

  // BULLMQ
  INDEX_WORKER_CONCURRENCY: z.coerce.number(),
  FIX_WORKER_CONCURRENCY: z.coerce.number(),
  JOB_ATTEMPTS: z.coerce.number(),
  JOB_BACKOFF_DELAY: z.coerce.number(),
  INDEX_JOB_TIMEOUT: z.coerce.number(),
  FIX_JOB_TIMEOUT: z.coerce.number(),

  // VECTOR
  EMBEDDING_PROVIDER: z.string(),
  OLLAMA_URL: z.string().url().default('http://localhost:11434'),
  VECTOR_SEARCH_LIMIT: z.coerce.number(),
  VECTOR_SIMILARITY_THRESHOLD: z.coerce.number(),

  // BROWSER
  HEADLESS_BROWSER: z.coerce.boolean(),
  BROWSER_TIMEOUT: z.coerce.number(),
  BROWSER_VIEWPORT_WIDTH: z.coerce.number(),
  BROWSER_VIEWPORT_HEIGHT: z.coerce.number(),
  ENABLE_BROWSER_TESTING: z.coerce.boolean(),
  BROWSER_TEST_FOR_UI_BUGS: z.coerce.boolean(),

  // FILE SYSTEM
  TEMP_REPOS_DIR: z.string(),
  SCREENSHOTS_DIR: z.string(),
  CACHE_DIR: z.string(),
  CLEANUP_TEMP_FILES_AFTER_DAYS: z.coerce.number(),

  // LOGGING
  LOG_LEVEL: z.string(),
  LOG_FILE_PATH: z.string(),
  LOG_MAX_FILES: z.coerce.number(),
  LOG_MAX_SIZE: z.coerce.number(),

  // RATE LIMIT
  RATE_LIMIT_WINDOW_MS: z.coerce.number(),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number(),

  // AGENT
  AGENT_MAX_STEPS: z.coerce.number(),
  AGENT_MAX_TOKENS: z.coerce.number(),
  AGENT_TEMPERATURE: z.coerce.number(),
  MAX_COST_PER_FIX: z.coerce.number(),
  WARN_COST_THRESHOLD: z.coerce.number(),

  // INDEXING
  MAX_FILE_SIZE_BYTES: z.coerce.number(),
  MAX_TOTAL_REPO_SIZE_MB: z.coerce.number(),
  INDEX_FILE_EXTENSIONS: z.string(),
  IGNORE_DIRECTORIES: z.string(),

  // FEATURE FLAGS
  ENABLE_VECTOR_SEARCH: z.coerce.boolean(),
  ENABLE_CODE_ANALYSIS: z.coerce.boolean(),
  ENABLE_PR_AUTO_MERGE: z.coerce.boolean(),

  // MONITORING
  ENABLE_METRICS: z.coerce.boolean(),
  METRICS_PORT: z.coerce.number(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string(),

  // WEBHOOK
  WEBHOOK_PATH: z.string(),
  WEBHOOK_TIMEOUT: z.coerce.number(),

  // OBSERVABILITY (optional — Langfuse)
  LANGFUSE_PUBLIC_KEY: z.string().optional(),
  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_BASE_URL: z.string().url().optional(),

  // REALTIME (optional — gateway event bridge)
  GATEWAY_INTERNAL_URL: z.string().url().optional(),
  INTERNAL_SECRET: z.string().optional(),
});

// Validate
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables');
  console.error(parsed.error.format());
  process.exit(1);
}

// Resolve relative paths to absolute so Docker mounts always get a real path
const data = parsed.data;
data.TEMP_REPOS_DIR = path.resolve(process.cwd(), data.TEMP_REPOS_DIR);
data.SCREENSHOTS_DIR = path.resolve(process.cwd(), data.SCREENSHOTS_DIR);
data.CACHE_DIR = path.resolve(process.cwd(), data.CACHE_DIR);

// Export typed env
export const env = data;
