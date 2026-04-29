#!/bin/bash
# ============================================================================
# CODEKANG — Docker Compose Deploy Script
# Usage: ./scripts/deploy-compose.sh [--build] [--service gateway]
#        Can be run from any directory.
# ============================================================================
set -euo pipefail

# Always run from the project root (one level up from this script)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── Config ────────────────────────────────────────────────────────────────────
COMPOSE="docker compose"
BUILD=false
SERVICE=""

# ── Args ──────────────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --build)   BUILD=true; shift ;;
    --service) SERVICE="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# ── Checks ────────────────────────────────────────────────────────────────────
if [[ ! -f .env ]]; then
  echo "❌  .env file not found. Copy .env.example and fill in your values."
  exit 1
fi

if [[ ! -f github-app-private-key.pem ]]; then
  echo "❌  github-app-private-key.pem not found."
  exit 1
fi

echo "🔍  Checking required env vars..."
required=(
  JWT_SECRET JWT_REFRESH_SECRET POSTGRES_PASSWORD
  ANTHROPIC_API_KEY GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET
  GITHUB_APP_ID GITHUB_WEBHOOK_SECRET FIREBASE_PROJECT_ID
  FIREBASE_CLIENT_EMAIL FIREBASE_PRIVATE_KEY INTERNAL_SECRET
  FRONTEND_URL
)
missing=()
for var in "${required[@]}"; do
  val=$(grep -E "^${var}=" .env | cut -d= -f2- | tr -d '"' | xargs 2>/dev/null || true)
  if [[ -z "$val" || "$val" == "CHANGE_ME"* ]]; then
    missing+=("$var")
  fi
done
if [[ ${#missing[@]} -gt 0 ]]; then
  echo "❌  Missing or placeholder values in .env:"
  for v in "${missing[@]}"; do echo "    - $v"; done
  exit 1
fi

# ── Build ─────────────────────────────────────────────────────────────────────
if [[ "$BUILD" == "true" ]]; then
  if [[ -n "$SERVICE" ]]; then
    echo "🏗️   Building $SERVICE..."
    $COMPOSE build --no-cache "$SERVICE"
  else
    echo "🏗️   Building all services..."
    $COMPOSE build --no-cache
  fi
fi

# ── Deploy ────────────────────────────────────────────────────────────────────
if [[ -n "$SERVICE" ]]; then
  echo "🚀  Deploying $SERVICE (zero-downtime pull & restart)..."
  $COMPOSE up -d --no-deps "$SERVICE"
else
  echo "🚀  Deploying all services..."
  $COMPOSE up -d
fi

# ── Health check ──────────────────────────────────────────────────────────────
echo "⏳  Waiting for gateway to be healthy..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅  Gateway is healthy."
    break
  fi
  if [[ $i -eq 30 ]]; then
    echo "❌  Gateway did not become healthy after 60s."
    echo "    Check logs: docker compose logs gateway"
    exit 1
  fi
  sleep 2
done

echo ""
echo "✅  Deployed successfully!"
echo "    Gateway:    http://localhost:3000/api/v1"
echo "    Autonomous: http://localhost:4000/health"
echo ""
echo "    Logs:    docker compose logs -f gateway"
echo "    Status:  docker compose ps"
