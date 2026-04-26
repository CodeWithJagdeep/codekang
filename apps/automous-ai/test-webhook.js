/**
 * test-webhook.js
 *
 * Simulates GitHub webhook payloads sent to the local CodeKang server.
 * Run: node test-webhook.js [scenario]
 *
 * Scenarios:
 *   node test-webhook.js bug1        → ReferenceError: userData not defined
 *   node test-webhook.js bug2        → Type coercion in user lookup
 *   node test-webhook.js bug3        → Off-by-one pagination
 *   node test-webhook.js bug5        → Wrong discount formula
 *   node test-webhook.js bug6        → Race condition in stock decrement
 *   node test-webhook.js noisy       → Vague issue (non-actionable, should be skipped)
 *   node test-webhook.js feature     → Feature request (non-actionable, should be skipped)
 *   node test-webhook.js approve     → Simulate @codekang fix approval comment (issue)
 *   node test-webhook.js all         → Fire all bug scenarios one after another
 *
 *   ── PR Review scenarios ────────────────────────────────────────────────────
 *   node test-webhook.js pr-open     → PR opened → triggers AI review
 *   node test-webhook.js pr-sync     → Commits pushed to PR → re-review
 *   node test-webhook.js pr-draft    → Draft PR → should be SKIPPED (onDraft=false)
 *   node test-webhook.js pr-approve  → @codekang fix on PR → triggers fix-pr job
 *                                      (run AFTER pr-open has completed)
 *
 *   Env overrides:
 *   TEST_SERVER=http://localhost:4000  (default; autonomous-ai port)
 *   WEBHOOK_PATH=/webhook/github       (default; must match WEBHOOK_PATH in .env)
 */

const crypto = require("crypto");
const fs = require("fs");

// ─── Config ───────────────────────────────────────────────────────────────────

function getSecret() {
  try {
    let envFile;
    if (fs.existsSync(".env.development")) {
      envFile = fs.readFileSync(".env.development", "utf-8");
    } else {
      envFile = fs.readFileSync(".env", "utf-8");
    }
    const match = envFile.match(/^GITHUB_WEBHOOK_SECRET=(.*)$/m);
    if (match) return match[1].trim();
  } catch {
    console.warn("Could not read .env — using fallback secret");
  }
  return "my_super_secret_webhook_key_12345";
}

const SECRET = getSecret();
// autonomous-ai runs on port 4000 by default (AUTONOMOUS_PORT in root .env)
const SERVER = process.env.TEST_SERVER || "http://localhost:4000";
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || "/webhook/github";
const OWNER = "CodeWithJagdeep";
const REPO = "demo-api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sign(body) {
  return (
    "sha256=" + crypto.createHmac("sha256", SECRET).update(body).digest("hex")
  );
}

function makeRepo() {
  return {
    name: REPO,
    full_name: `${OWNER}/${REPO}`,
    owner: { login: OWNER },
    clone_url: `https://github.com/${OWNER}/${REPO}.git`,
    default_branch: "main",
  };
}

async function sendWebhook(event, payload, label) {
  const body = JSON.stringify(payload);
  const signature = sign(body);

  console.log(`\n${"─".repeat(60)}`);
  console.log(`📤 Sending: ${label}`);
  console.log(`   Event   : ${event}`);
  if (payload.issue) {
    console.log(
      `   Issue   : #${payload.issue.number} — ${payload.issue.title}`,
    );
  }
  if (payload.comment) {
    console.log(`   Comment : "${payload.comment.body}"`);
  }

  try {
    const res = await fetch(`${SERVER}${WEBHOOK_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-github-event": event,
        "x-hub-signature-256": signature,
      },
      body,
    });

    const data = await res.json();
    console.log(`   Status  : ${res.status} ${res.ok ? "✅" : "❌"}`);
    console.log(`   Response:`, data);
  } catch (err) {
    console.error(
      `   ❌ Failed to reach ${SERVER} — is 'npm run dev' running?`,
    );
    console.error(`   ${err.message}`);
  }
}

// ─── Test Scenarios ───────────────────────────────────────────────────────────

const scenarios = {
  // Bug 1 — ReferenceError: userData is not defined
  // Agent should: find userData → replace with database.users
  bug1: () =>
    sendWebhook(
      "issues",
      {
        action: "opened",
        repository: makeRepo(),
        installation: { id: 12345678 },
        issue: {
          number: 101,
          title: "App crashes when I try to open the Users List",
          body: `Hi team,

I was trying to load the users list page today on the dashboard, but the whole page just crashes. 
When I check the network tab, it says "500 Internal Server Error" from \`GET /api/users\`.

I literally can't see any of our users right now! Please fix this ASAP.`,
        },
      },
      "Bug 1 — userData ReferenceError",
    ),

  // Bug 2 — Loose == in user lookup allows type coercion
  // Agent should: change == to === with parseInt
  bug2: () =>
    sendWebhook(
      "issues",
      {
        action: "opened",
        repository: makeRepo(),
        installation: { id: 12345678 },
        issue: {
          number: 102,
          title:
            "Sometimes looking up a user profile returns the wrong account",
          body: `Hey,

I've been looking up certain user IDs on the platform, but sometimes it loads a completely different user profile or someone that looks deleted! 
I think the database is out of sync or something is mixing up the user IDs when looking them up via \`GET /api/users/:id\`. It's really confusing.`,
        },
      },
      "Bug 2 — Loose == comparison",
    ),

  // Bug 3 — Off-by-one in pagination
  // Agent should: change page * pageSize to (page - 1) * pageSize
  bug3: () =>
    sendWebhook(
      "issues",
      {
        action: "opened",
        repository: makeRepo(),
        installation: { id: 12345678 },
        issue: {
          number: 103,
          title: "Product catalog page 1 is completely blank!",
          body: `Hey developers,

When I click on the products tab and go to page 1, the list is totally empty! 

But if I go to page 2, the products show up. Why does page 1 skip all the new products? It almost feels like the first 10 items are just missing from the database when it loads \`GET /api/products?page=1\`.`,
        },
      },
      "Bug 3 — Off-by-one pagination",
    ),

  // Bug 5 — Discount formula adds instead of subtracting
  // Agent should: change (1 + discountPct/100) to (1 - discountPct/100)
  bug5: () =>
    sendWebhook(
      "issues",
      {
        action: "opened",
        repository: makeRepo(),
        installation: { id: 12345678 },
        issue: {
          number: 105,
          title: "Discounts are charging customers MORE money!",
          body: `URGENT!

I applied a 20% discount code to a Laptop ($999.99) at checkout, and instead of taking the price down, it INCREASED the charge to like $1,200!! 

Look at \`GET /api/products/101/price?discount=20\`, it's adding money instead of subtracting! People are paying more when they use coupons. Please revert this immediately!`,
        },
      },
      "Bug 5 — Wrong discount formula",
    ),

  // Bug 6 — Race condition: stock not checked atomically
  bug6: () =>
    sendWebhook(
      "issues",
      {
        action: "opened",
        repository: makeRepo(),
        installation: { id: 12345678 },
        issue: {
          number: 106,
          title: "Customers are buying items that are out of stock",
          body: `We have a huge issue with inventory.

We only had 50 mouses left in stock. But two different customers were able to buy 50 at the exact same time, and now our stock reads as -50! 

They both placed the order via \`POST /api/orders\` simultaneously, and the system accepted both. I think the system isn't locking the inventory when a purchase happens.`,
        },
      },
      "Bug 6 — Stock race condition",
    ),

  // Non-actionable: vague noise issue — agent should classify and skip
  noisy: () =>
    sendWebhook(
      "issues",
      {
        action: "opened",
        repository: makeRepo(),
        installation: { id: 12345678 },
        issue: {
          number: 200,
          title: "Something feels off",
          body: "The API sometimes seems slow? Not sure. Maybe it's my network. Could be a bug.",
        },
      },
      "Noise — vague issue (should be classified as non-actionable)",
    ),

  // Non-actionable: feature request — agent should classify and skip
  feature: () =>
    sendWebhook(
      "issues",
      {
        action: "opened",
        repository: makeRepo(),
        installation: { id: 12345678 },
        issue: {
          number: 201,
          title: "Feature: Add JWT authentication to all endpoints",
          body: `We need proper JWT-based authentication on all API routes.

Currently the auth middleware only checks for a hardcoded Bearer token.
We should implement proper JWT signing, verification, and refresh token support.`,
        },
      },
      "Feature request (should be classified as non-actionable)",
    ),

  // Simulate a contributor posting @codekang fix on an existing proposal
  // Use this AFTER one of the bug scenarios has been processed and a proposal posted
  approve: () =>
    sendWebhook(
      "issue_comment",
      {
        action: "created",
        repository: makeRepo(),
        installation: { id: 12345678 },
        issue: {
          number: 101, // must match an issue with a pending proposal
          title: "App crashes when I try to open the Users List",
          body: "",
        },
        comment: {
          id: 9001,
          body: "@codekang fix",
          user: { login: OWNER, id: 1 },
          created_at: new Date().toISOString(),
          html_url: `https://github.com/${OWNER}/${REPO}/issues/101#issuecomment-9001`,
        },
        sender: { login: OWNER, id: 1 },
      },
      "Approval comment — @codekang fix (triggers Phase 2 execute)",
    ),

  // ── PR Review scenarios ───────────────────────────────────────────────────

  // Simulate: PR opened → should trigger AI review
  // Expected: review saved to pr_reviews table, posted to GitHub PR
  "pr-open": () =>
    sendWebhook(
      "pull_request",
      {
        action: "opened",
        number: 42,
        repository: {
          ...makeRepo(),
          default_branch: "main",
        },
        installation: { id: 12345678 },
        pull_request: {
          number: 42,
          title: "feat: add user authentication with JWT",
          body: "Implements JWT-based login and refresh tokens. Also adds rate limiting.",
          state: "open",
          html_url: `https://github.com/${OWNER}/${REPO}/pull/42`,
          head: {
            ref: "feature/jwt-auth",
            sha: "abc123def456abc123def456abc123def456abc1",
            label: `${OWNER}:feature/jwt-auth`,
          },
          base: {
            ref: "main",
            sha: "deadbeefdeadbeefdeadbeefdeadbeefdeadbee1",
            label: `${OWNER}:main`,
          },
          user: { login: OWNER, id: 1 },
          draft: false,
          merged: false,
        },
        sender: { login: OWNER, id: 1 },
      },
      "PR opened — should trigger AI review (plan + settings permitting)",
    ),

  // Simulate: commits pushed to an open PR → re-review (onPush trigger)
  "pr-sync": () =>
    sendWebhook(
      "pull_request",
      {
        action: "synchronize",
        number: 42,
        repository: {
          ...makeRepo(),
          default_branch: "main",
        },
        installation: { id: 12345678 },
        pull_request: {
          number: 42,
          title: "feat: add user authentication with JWT",
          body: "Updated after code review feedback.",
          state: "open",
          html_url: `https://github.com/${OWNER}/${REPO}/pull/42`,
          head: {
            ref: "feature/jwt-auth",
            sha: "111aaabbbcccdddeee111aaabbbcccdddeee111a",
            label: `${OWNER}:feature/jwt-auth`,
          },
          base: {
            ref: "main",
            sha: "deadbeefdeadbeefdeadbeefdeadbeefdeadbee1",
            label: `${OWNER}:main`,
          },
          user: { login: OWNER, id: 1 },
          draft: false,
          merged: false,
        },
        sender: { login: OWNER, id: 1 },
      },
      "PR synchronize — re-review on new push (requires onPush=true in settings)",
    ),

  // Simulate: draft PR opened — should be SKIPPED if onDraft=false (default)
  "pr-draft": () =>
    sendWebhook(
      "pull_request",
      {
        action: "opened",
        number: 43,
        repository: {
          ...makeRepo(),
          default_branch: "main",
        },
        installation: { id: 12345678 },
        pull_request: {
          number: 43,
          title: "WIP: refactor payment service",
          body: "Work in progress — do not review yet.",
          state: "open",
          html_url: `https://github.com/${OWNER}/${REPO}/pull/43`,
          head: {
            ref: "refactor/payments",
            sha: "222aaabbbcccdddeee222aaabbbcccdddeee222a",
            label: `${OWNER}:refactor/payments`,
          },
          base: {
            ref: "main",
            sha: "deadbeefdeadbeefdeadbeefdeadbeefdeadbee1",
            label: `${OWNER}:main`,
          },
          user: { login: OWNER, id: 1 },
          draft: true,
          merged: false,
        },
        sender: { login: OWNER, id: 1 },
      },
      "PR draft — should be SKIPPED (onDraft=false by default in repo settings)",
    ),

  // Simulate: user comments "@codekang fix" on a PR
  // Run AFTER pr-open has completed and review is stored in pr_reviews table
  "pr-approve": () =>
    sendWebhook(
      "issue_comment",
      {
        action: "created",
        repository: makeRepo(),
        installation: { id: 12345678 },
        // GitHub sends issue_comment with issue.pull_request defined for PR comments
        issue: {
          number: 42,
          title: "feat: add user authentication with JWT",
          body: "",
          state: "open",
          labels: [],
          assignees: [],
          user: { login: OWNER, id: 1 },
          html_url: `https://github.com/${OWNER}/${REPO}/pull/42`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pull_request: {
            url: `https://api.github.com/repos/${OWNER}/${REPO}/pulls/42`,
            html_url: `https://github.com/${OWNER}/${REPO}/pull/42`,
          },
        },
        comment: {
          id: 9002,
          body: "@codekang fix",
          user: { login: OWNER, id: 1 },
          created_at: new Date().toISOString(),
          html_url: `https://github.com/${OWNER}/${REPO}/pull/42#issuecomment-9002`,
        },
        sender: { login: OWNER, id: 1 },
      },
      "PR approval — @codekang fix on PR #42 (triggers fix-pr job)",
    ),

  // Fire all bug scenarios with a small delay between each
  async all() {
    const bugScenarios = ["bug1", "bug2", "bug3", "bug5", "bug6"];
    console.log(`\n🚀 Firing all ${bugScenarios.length} bug scenarios...\n`);
    for (const name of bugScenarios) {
      await scenarios[name]();
      await new Promise((r) => setTimeout(r, 1500)); // small gap between requests
    }
    console.log(`\n✅ All scenarios sent. Watch server logs for processing.`);
  },
};

// ─── Entry point ──────────────────────────────────────────────────────────────

const arg = process.argv[2] || "bug1";

if (!scenarios[arg]) {
  console.error(`\n❌ Unknown scenario: "${arg}"`);
  console.error(`\nAvailable scenarios:`);
  Object.keys(scenarios).forEach((k) =>
    console.error(`  node test-webhook.js ${k}`),
  );
  process.exit(1);
}

console.log(`\n🔧 CodeKang Webhook Test Runner`);
console.log(`   Server : ${SERVER}`);
console.log(`   Secret : ${SECRET.slice(0, 8)}...`);
console.log(`   Repo   : ${OWNER}/${REPO}`);

Promise.resolve(scenarios[arg]()).then(() => {
  if (arg !== "all") {
    console.log(`\n📋 Watch your server terminal for live logs.`);
    console.log(`   Phase 1 (propose): agent analyses, posts proposal comment`);
    console.log(`   Phase 2 (fix):     run: node test-webhook.js approve`);
  }
});
