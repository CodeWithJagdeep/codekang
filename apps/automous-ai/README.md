# 🦾 CodeKang

> **Autonomous AI agent that automatically fixes GitHub issues and opens Pull Requests.**

CodeKang listens to GitHub webhooks, classifies incoming issues using an AI classifier, clones the affected repository, runs an autonomous coding agent (powered by Claude), and submits a PR with the fix — all without human intervention.

---

## ✨ Features

- 🔔 **GitHub Webhook Integration** — Receives and processes issue events in real time
- 🧠 **AI Issue Classifier** — Uses Claude to determine if an issue is actionable and fixable
- 🤖 **Autonomous Coding Agent** — 21-tool Claude agent loop that explores, reproduces, and fixes bugs
- 🗂️ **Vector-Based Code Search** — Indexes repo code as embeddings for hybrid semantic + full-text search
- 💡 **Structured Fix Proposal** — Posts root cause + file changes + solution before touching any code
- ✅ **Contributor Approval Gate** — Waits for `@codekang fix` before applying changes
- 🌐 **Browser Automation** — Uses Playwright to detect and fix UI/visual bugs via screenshots
- 🔁 **Adaptive Retry** — Re-runs fix agent with test failure output as context (up to 2 attempts)
- 🔀 **Conflict Resolution** — Auto-rebases on main if push is rejected
- 📬 **PR Creation + Auto-Merge** — Opens PR and squash-merges when CI passes
- 🧠 **Cross-Issue Learning** — Stores successful fix patterns, injects them into future agent runs
- 🛡️ **Provider Fallback** — Falls back to OpenAI if Anthropic is unavailable
- ⚙️ **BullMQ Job Queue** — Processes jobs asynchronously with retry/backoff support
- 📊 **Monitoring** — Optional Prometheus + Grafana dashboards

---

## 🏗️ How It Works (Full Flow)

```
GitHub Issue Opened
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 1 — Analyse & Propose  (fully automatic)         │
│                                                         │
│  1. Classify issue (bug / feature / noise)              │
│  2. Clone repo + start isolated Docker container        │
│  3. Install dependencies (errors detected + reported)   │
│  4. Index entire codebase into pgvector database        │
│  5. Run AI Analysis Agent (Claude Sonnet)               │
│     • Explores repo structure with file tree            │
│     • Searches code semantically + by regex             │
│     • Reproduces the bug with a throwaway script        │
│     • Traces root cause to exact file + line            │
│  6. Extract structured proposal:                        │
│     • Root cause (one sentence)                         │
│     • Files to change + what each change does           │
│     • Full proposed solution                            │
│     • Verification strategy                             │
│  7. Post proposal comment on GitHub issue               │
│  8. Save proposal to database                           │
└─────────────────────────────────────────────────────────┘
        │
        │  Contributor reads proposal, replies:
        │  > @codekang fix
        ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 2 — Fix & Ship  (automatic after approval)       │
│                                                         │
│  1. Load saved proposal + inject root cause context     │
│  2. Query similar past fixes (cross-issue learning)     │
│  3. Re-clone repo + fresh Docker container              │
│  4. Run AI Fix Agent (Claude Sonnet)                    │
│     • Starts from root cause — no re-investigation      │
│     • Uses past fix patterns as reference               │
│     • Applies minimal correct code change               │
│     • Runs existing test suite to verify                │
│  5. If tests fail → inject test output + retry (×2)     │
│  6. Push branch (auto-rebase on conflict)               │
│  7. Open Pull Request                                   │
│  8. Poll CI checks every 30s (up to 10 minutes)         │
│  9. Squash-merge PR when all checks pass                │
│  10. Record fix pattern for future learning             │
└─────────────────────────────────────────────────────────┘
```

### Component Map

| Component | File | Purpose |
|---|---|---|
| AI Agent Loop | `src/agent/index.ts` | Multi-step Claude tool-use loop with prompt caching |
| Agent Tools (21) | `src/agent/tools.ts` | All tool implementations |
| Classifier | `src/agent/classifier.ts` | Issue triage — haiku model |
| Fix Service | `src/services/fix-service.ts` | Phase 1: propose / Phase 2: execute |
| Proposal Service | `src/services/proposal-service.ts` | Structured proposal extraction + GitHub comment |
| Learning Service | `src/services/learning-service.ts` | Fix pattern storage and retrieval |
| PR Service | `src/services/pr-service.ts` | Branch + commit + push + PR + auto-merge |
| Vector Search | `src/vector/search.ts` | Hybrid RRF (semantic + full-text) search |
| Chunker | `src/vector/chunker.ts` | Symbol-aware code chunking for embeddings |
| AI Router | `src/config/ai/router.ts` | Task → model routing + OpenAI fallback |

---

---

## 🤖 AI Agent — What It Does and How

The agent is a multi-step loop powered by Claude. At every step Claude picks a tool, receives the result, reasons about it, then picks the next action. It continues until it calls `finish()` or hits the step limit (`AGENT_MAX_STEPS`).

The agent runs in two modes: **analyse** (find root cause, no code changes) and **fix** (apply the fix and verify it).

---

### Analyse Mode

Goal: understand the issue deeply before touching any code.

1. Opens the repo tree to get a mental map of the project layout
2. Reads `package.json` / `pyproject.toml` to understand scripts and entry points
3. Searches the codebase semantically and by regex to locate relevant code
4. Writes and runs a reproduction script to **confirm the bug exists**
5. Reads the affected files line by line to trace the exact root cause
6. Calls `finish()` with: file:line of root cause, what is wrong and why, reproduction steps, suggested fix approach
7. Does **not** write any source files

---

### Fix Mode

Goal: apply a minimal correct fix and verify it works.

Context injected before the first step (from the analysis pass):
- **Root cause** — the agent skips re-investigation and goes straight to fixing
- **Similar past fixes** — patterns from successfully fixed issues of the same category
- **Prior test failure** (on retry) — full test output from the previous attempt

Steps:
1. Reads the files identified in the analysis
2. Writes the fix with `write_file`
3. Writes a quick verification script with `write_and_run` to confirm the bug is gone
4. Runs the full test suite with `run_command`
5. If tests fail and this is the first attempt — stops, the service retries with test output injected
6. Calls `finish()` with: what changed, how it was verified, files modified

---

### Agent Tools — Complete Reference

The agent has **21 tools** across 5 categories. Claude decides which to use at each step.

#### Code Exploration

| Tool | What it does | When the agent uses it |
|---|---|---|
| `get_file_tree` | Nested directory tree up to 6 levels deep (ignores `node_modules`, `.git`, `dist`) | Always called first — gives a mental map of the repo |
| `list_directory` | Immediate contents of a specific folder | When the agent needs to zoom into one directory |
| `read_file` | Reads any file with line numbers prefixed | After locating the relevant file — reads before modifying |
| `search_files` | Regex/text search across all source files — returns matching file + line | Finding where a function is called, where an error is thrown, where a config key is set |
| `vector_search` | Semantic similarity search over the indexed codebase (hybrid RRF: nomic embeddings + FTS) | When the agent knows *what* something does but not its name — e.g. "function that validates JWT expiry" |
| `search_by_symbol` | Finds code by function/class/variable name (exact or partial) | Faster than vector search when the agent already knows the symbol name |
| `search_by_file` | Finds code chunks by file path fragment | When the agent knows the filename but not the directory |
| `get_package_info` | Reads `package.json`, `pyproject.toml`, `go.mod`, or `Cargo.toml` | Early in every session — reveals test scripts, dependencies, entry points |

**Typical exploration sequence:**
```
get_file_tree        → understand project layout
get_package_info     → find test script + dependencies
vector_search        → locate relevant code by meaning
search_by_symbol     → find specific function implementation
read_file            → read the exact code before changing it
```

---

#### Code Execution

All execution runs inside the isolated Docker container (`--network=none` — no internet access).

| Tool | What it does | When the agent uses it |
|---|---|---|
| `run_command` | Runs any shell command in the Docker sandbox — `npm test`, `npm run lint`, `python -m pytest`, `go test ./...` | Running the full test suite to verify the fix |
| `run_file` | Runs a specific file with runtime auto-detected from extension (`.ts` → `ts-node`, `.js` → `node`, `.py` → `python3`, `.go` → `go run`, `.rb` → `ruby`, `.sh` → `bash`) | Running a single test file or entry point |
| `write_and_run` | Writes a throwaway script to a temp dir and immediately runs it. Temp file is deleted after execution. | **Most important verification tool.** Agent writes a small script that imports the broken function, calls it with test data, and confirms the bug. After the fix, writes another script to confirm it's gone. |

**Example verification flow:**
```
write_and_run repro.ts  → confirms bug exists (prints wrong value)
write_file src/auth.ts  → applies the fix
write_and_run verify.ts → confirms bug is gone (prints correct value)
run_command npm test    → confirms no regressions in the full suite
```

---

#### File Writing

| Tool | What it does | When the agent uses it |
|---|---|---|
| `write_file` | Creates or overwrites any file in the repo with full content | Applying the source fix, adding new test cases, updating config files |

Path traversal is blocked — the agent can only write files inside the cloned repo directory.

---

#### Browser (UI Bugs)

For issues classified as `ui-bug`, the agent uses a real Playwright browser instead of just reading code.

| Tool | What it does | When the agent uses it |
|---|---|---|
| `browser_open` | Opens a URL in Chromium. Returns: page title, visible text (3000 chars), all console errors and warnings, screenshot path | Entry point for all UI investigation. Used to reproduce the visual bug. |
| `browser_navigate` | Navigates the existing session to a new URL | Following redirects or moving between pages |
| `browser_click` | Clicks an element by CSS selector or text (e.g. `button:has-text("Submit")`). Returns updated page text. | Reproducing interaction-triggered bugs (broken button, failed form submit) |
| `browser_type` | Types text into an input field. Optionally presses Enter after. | Filling forms, triggering autocomplete, testing input validation |
| `browser_get_content` | Returns current page text, URL, title, and all console errors | Checking page state after an interaction |
| `browser_screenshot` | Takes a full-page or viewport screenshot, saves to disk | Capturing evidence of the bug before fixing, and confirming it's resolved after |
| `browser_close` | Closes the browser session | Always called at the end of UI investigation to release resources |

**Example UI bug flow:**
```
browser_open "http://localhost:3000/login"
  → sees: console error "TypeError: Cannot read property 'user' of undefined"
browser_click "button:has-text('Sign In')"
  → page crashes, captures the error
browser_screenshot
  → saves visual evidence of the broken state
read_file src/pages/login.tsx
  → finds: user?.token accessed before null check
write_file src/pages/login.tsx
  → adds: if (!user) return null
browser_open "http://localhost:3000/login"
  → confirms: no console errors
browser_close
```

---

#### Reasoning & Control

| Tool | What it does | When the agent uses it |
|---|---|---|
| `think` | Agent writes its current understanding and plan out loud — no action taken, no tool call made | When facing ambiguity: "I see two possible root causes, let me reason which is more likely before reading files." Prevents going in circles. |
| `finish` | Signals the end of the agent loop. Provides a full summary of findings (analyse) or changes and verification (fix). | When the agent is done. The summary becomes the PR description and issue comment. |

---

### AI Models

| Task | Primary model | Fallback |
|---|---|---|
| Issue classification | `claude-haiku-4-5-20251001` | `gpt-4o-mini` |
| Analysis + fix agent | `claude-sonnet-4-6` | `gpt-4o` |
| Proposal extraction | `claude-haiku-4-5-20251001` | `gpt-4o-mini` |
| Code review | `groq/llama-3.3-70b-versatile` | `gpt-4o-mini` |

**Prompt caching** is enabled on the agent system prompt — after the first step, repeat steps hit the Anthropic cache at ~10% of normal input token cost.

---

### Approval Keywords

After CodeKang posts its proposal comment, reply with any of these to trigger Phase 2:

| Comment | Effect |
|---|---|
| `@codekang fix` | Triggers fix |
| `@codekang go` | Triggers fix |
| `@codekang proceed` | Triggers fix |
| `@codekang apply` | Triggers fix |
| `lgtm` | Triggers fix |
| `approve` | Triggers fix |

---

### Cost Control

- Every LLM call is tracked and accumulated per fix job
- `MAX_COST_PER_FIX` — hard cap in USD. Job aborts if exceeded.
- `WARN_COST_THRESHOLD` — logs a warning before hitting the cap
- Prompt caching reduces per-step cost by ~90% on repeat agent steps
- Classifier uses haiku (cheapest); the agent uses sonnet

---

### Security

- Webhook signature verified with HMAC-SHA256 + timing-safe comparison on every request
- All code execution runs inside Docker with `--network=none` (no internet access from the sandbox)
- Path traversal blocked on all `read_file` / `write_file` calls
- Agent cannot read or write files outside the cloned repo directory

---

## 🛠️ Tech Stack

| Layer              | Technology              |
| ------------------ | ----------------------- |
| Runtime            | Node.js + TypeScript    |
| Web Framework      | Express v5              |
| AI Model           | Anthropic Claude        |
| GitHub             | `@octokit/rest`         |
| Job Queue          | BullMQ (Redis-backed)   |
| Database           | PostgreSQL + pgvector   |
| Browser Automation | Playwright              |
| Logging            | Winston                 |
| Env Validation     | Zod                     |
| Containerization   | Docker + Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Anthropic API key
- GitHub App (or Personal Access Token + Webhook Secret)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/codekang.git
cd codekang
```

### 2. Configure environment variables

```bash
cp .env.development .env
```

Edit `.env` and fill in the required values:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_APP_ID=your-app-id
GITHUB_APP_PRIVATE_KEY_PATH=./certs/private-key.pem

# Database (set by Docker automatically)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codekang

# Redis (set by Docker automatically)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Start infrastructure

```bash
# Start PostgreSQL (with pgvector), Redis, and BullMQ Board
docker-compose up -d
```

### 4. Install dependencies

```bash
npm install
```

### 5. Run in development

```bash
npm run dev
```

The server starts at `http://localhost:3000`.

---

## 🐳 Docker Services

| Service      | URL                     | Description         |
| ------------ | ----------------------- | ------------------- |
| CodeKang API | `http://localhost:3000` | Main application    |
| BullMQ Board | `http://localhost:3001` | Job queue dashboard |
| PostgreSQL   | `localhost:5432`        | Database            |
| Redis        | `localhost:6379`        | Queue broker        |

### Optional profiles

```bash
# Database + Redis GUIs
docker-compose --profile tools up -d

# Prometheus + Grafana monitoring
docker-compose --profile monitoring up -d
```

| Tool            | URL                     | Credentials                    |
| --------------- | ----------------------- | ------------------------------ |
| pgAdmin         | `http://localhost:5050` | `admin@codekang.com` / `admin` |
| Redis Commander | `http://localhost:8081` | `admin` / `admin`              |
| Grafana         | `http://localhost:3002` | `admin` / `admin`              |
| Prometheus      | `http://localhost:9090` | —                              |

---

## 📡 API Endpoints

| Method | Path             | Description             |
| ------ | ---------------- | ----------------------- |
| `GET`  | `/`              | Service info            |
| `GET`  | `/health`        | Health check            |
| `POST` | `/webhook`       | GitHub webhook receiver |
| `GET`  | `/queue`         | Queue status            |
| `GET`  | `/status/:jobId` | Fix job status          |

---

## 🔧 Environment Variables

See `.env.development` for the full annotated reference. Key sections:

| Section       | Variables                                                                  |
| ------------- | -------------------------------------------------------------------------- |
| Server        | `PORT`, `NODE_ENV`                                                         |
| Database      | `DATABASE_URL`, `DB_POOL_MIN/MAX`                                          |
| Redis         | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`                               |
| Anthropic     | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL_CLASSIFIER`, `ANTHROPIC_MODEL_AGENT` |
| GitHub        | `GITHUB_TOKEN`, `GITHUB_WEBHOOK_SECRET`, `GITHUB_APP_ID`                   |
| Agent         | `AGENT_MAX_STEPS`, `AGENT_MAX_TOKENS`, `MAX_COST_PER_FIX`                  |
| Vector Search | `ENABLE_VECTOR_SEARCH`, `VECTOR_SEARCH_LIMIT`                              |
| Browser       | `ENABLE_BROWSER_TESTING`, `HEADLESS_BROWSER`                               |
| Feature Flags | `ENABLE_PR_AUTO_MERGE`, `ENABLE_CODE_ANALYSIS`                             |

---

## 🧪 Scripts

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Compile TypeScript
npm run start    # Run compiled output
npm run watch    # Watch mode TypeScript compilation
npm run clean    # Remove dist/
```

---

## 📁 Project Structure

```
src/
├── server.ts          # Entry point + graceful shutdown
├── app.ts             # Express app + middleware
├── config/            # Env validation, AI config, DB, Redis
├── agent/             # AI agent loop, classifier, tools
├── github/            # GitHub API client + webhook parsing
├── services/          # Fix, PR, comment, indexing, browser services
├── queue/             # BullMQ workers + job definitions
├── vector/            # Embeddings, chunker, indexer, semantic search
├── browser/           # Playwright automation
├── parser/            # Code parser
├── repo/              # Repository cloning + management
├── db/                # Database access layer + migrations
├── routes/            # HTTP route handlers
├── types/             # Shared TypeScript types
├── middleware/         # Express middleware
└── utils/             # Logger + shared utilities
```

---

## 📄 License

Copyright © 2025 Team NineBug. All Rights Reserved.

This source code is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software, in whole or in part, is strictly prohibited.

---

> Built by **Team NineBug** 🐛×9
