#!/bin/bash
# ============================================================================
# CODEKANG — Kubernetes Deploy Script
# Usage:
#   ./scripts/deploy-k8s.sh                          # build + push + deploy
#   ./scripts/deploy-k8s.sh --skip-build             # deploy already-pushed image
#   ./scripts/deploy-k8s.sh --service gateway        # deploy one service only
#   ./scripts/deploy-k8s.sh --rollback               # undo last deployment
#   Can be run from any directory.
# ============================================================================
set -euo pipefail

# Always run from the project root (one level up from this script)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── Config ────────────────────────────────────────────────────────────────────
REGISTRY="${REGISTRY:-gcr.io/codekang-prod}"
TAG="${TAG:-$(date +%Y%m%d-%H%M%S)}"
NAMESPACE="${NAMESPACE:-codekang}"
OVERLAY="kubernetes/overlays/production"
SKIP_BUILD=false
SERVICE=""
ROLLBACK=false

# ── Args ──────────────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-build) SKIP_BUILD=true; shift ;;
    --service)    SERVICE="$2"; shift 2 ;;
    --rollback)   ROLLBACK=true; shift ;;
    --tag)        TAG="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# ── Rollback ──────────────────────────────────────────────────────────────────
if [[ "$ROLLBACK" == "true" ]]; then
  echo "⏪  Rolling back all deployments in namespace $NAMESPACE..."
  for dep in $(kubectl get deployments -n "$NAMESPACE" -o name); do
    kubectl rollout undo "$dep" -n "$NAMESPACE"
  done
  echo "✅  Rollback triggered. Watch with: kubectl rollout status deployment -n $NAMESPACE"
  exit 0
fi

# ── Checks ────────────────────────────────────────────────────────────────────
echo "🔍  Checking tools..."
for tool in docker kubectl; do
  if ! command -v "$tool" &>/dev/null; then
    echo "❌  $tool not found. Please install it."
    exit 1
  fi
done

if ! kubectl cluster-info &>/dev/null; then
  echo "❌  kubectl cannot reach the cluster. Check your kubeconfig."
  exit 1
fi

echo "📋  Registry:  $REGISTRY"
echo "📋  Tag:       $TAG"
echo "📋  Namespace: $NAMESPACE"
echo ""

# ── Build & push ──────────────────────────────────────────────────────────────
SERVICES=(gateway auth ai-agent repos autonomous)

if [[ "$SKIP_BUILD" == "false" ]]; then
  if [[ -n "$SERVICE" ]]; then
    SERVICES=("$SERVICE")
  fi

  echo "🏗️   Building images..."
  for svc in "${SERVICES[@]}"; do
    if [[ "$svc" == "autonomous" ]]; then
      docker build \
        -f docker/autonomous/Dockerfile \
        -t "$REGISTRY/$svc:$TAG" \
        -t "$REGISTRY/$svc:latest" \
        apps/automous-ai
    else
      docker build \
        -f "docker/$svc/Dockerfile" \
        -t "$REGISTRY/$svc:$TAG" \
        -t "$REGISTRY/$svc:latest" \
        .
    fi
    echo "    ✓ Built $svc:$TAG"
  done

  echo "📤  Pushing images..."
  for svc in "${SERVICES[@]}"; do
    docker push "$REGISTRY/$svc:$TAG"
    docker push "$REGISTRY/$svc:latest"
    echo "    ✓ Pushed $svc:$TAG"
  done
fi

# ── Update image tags in overlay ──────────────────────────────────────────────
echo "📝  Updating image tags to $TAG..."
# Replace all newTag lines in the production kustomization
sed -i "s|newTag:.*|newTag: $TAG|g" "$OVERLAY/kustomization.yaml"

echo "    Committed tag $TAG to $OVERLAY/kustomization.yaml"

# ── Apply manifests ───────────────────────────────────────────────────────────
echo "🚀  Applying Kubernetes manifests..."

if [[ -n "$SERVICE" && "$SKIP_BUILD" == "true" ]]; then
  # Restart a single deployment without re-applying everything
  kubectl rollout restart "deployment/$SERVICE" -n "$NAMESPACE"
else
  kubectl apply -k "$OVERLAY"
fi

# ── Wait for rollout ──────────────────────────────────────────────────────────
echo "⏳  Waiting for rollout to complete (timeout: 5m)..."

if [[ -n "$SERVICE" ]]; then
  kubectl rollout status "deployment/$SERVICE" -n "$NAMESPACE" --timeout=5m
else
  for svc in "${SERVICES[@]}"; do
    echo "    Checking $svc..."
    kubectl rollout status "deployment/$svc" -n "$NAMESPACE" --timeout=5m || {
      echo "❌  $svc failed to roll out. Rolling back..."
      kubectl rollout undo "deployment/$svc" -n "$NAMESPACE"
      exit 1
    }
  done
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "✅  Deployed tag $TAG successfully!"
echo ""
echo "    Pods:       kubectl get pods -n $NAMESPACE"
echo "    Gateway log: kubectl logs -n $NAMESPACE -l app=gateway -f"
echo "    Rollback:   ./scripts/deploy-k8s.sh --rollback"
echo ""
