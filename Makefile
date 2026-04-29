# ============================================================================
# CODEKANG PLATFORM — MAKEFILE
# ============================================================================

REGISTRY   ?= gcr.io/codekang
TAG        ?= latest
NAMESPACE  ?= codekang
COMPOSE    := docker compose

# ── Docker Compose ────────────────────────────────────────────────────────────

.PHONY: up down build logs ps restart

## Start all services (production mode)
up:
	$(COMPOSE) up -d

## Start all services + dev tools
up-tools:
	$(COMPOSE) --profile tools up -d

## Build all images without cache
build:
	$(COMPOSE) build --no-cache

## Build a single service: make build-svc SVC=gateway
build-svc:
	$(COMPOSE) build --no-cache $(SVC)

## Stop all services
down:
	$(COMPOSE) down

## View logs (all services or: make logs SVC=gateway)
logs:
	$(COMPOSE) logs -f $(SVC)

## Show running containers
ps:
	$(COMPOSE) ps

## Restart a service: make restart SVC=gateway
restart:
	$(COMPOSE) restart $(SVC)

# ── Deploy Scripts ───────────────────────────────────────────────────────────

.PHONY: deploy deploy-build deploy-k8s deploy-k8s-service rollback

## Full Docker Compose deploy (no rebuild)
deploy:
	./scripts/deploy-compose.sh

## Docker Compose deploy with fresh build
deploy-build:
	./scripts/deploy-compose.sh --build

## Deploy single service with rebuild: make deploy-svc SVC=gateway
deploy-svc:
	./scripts/deploy-compose.sh --build --service $(SVC)

## Full Kubernetes deploy (build + push + apply)
deploy-k8s:
	./scripts/deploy-k8s.sh

## Kubernetes deploy without rebuild: make deploy-k8s-skip REGISTRY=gcr.io/... TAG=abc
deploy-k8s-skip:
	./scripts/deploy-k8s.sh --skip-build

## Deploy one K8s service: make deploy-k8s-svc SVC=gateway
deploy-k8s-svc:
	./scripts/deploy-k8s.sh --service $(SVC)

## Rollback all K8s deployments to previous version
rollback:
	./scripts/deploy-k8s.sh --rollback

# ── Docker Build & Push ───────────────────────────────────────────────────────

.PHONY: docker-build docker-push

## Build and tag all images for registry
docker-build:
	docker build -f docker/gateway/Dockerfile    -t $(REGISTRY)/gateway:$(TAG)    .
	docker build -f docker/auth/Dockerfile       -t $(REGISTRY)/auth:$(TAG)       .
	docker build -f docker/ai-agent/Dockerfile   -t $(REGISTRY)/ai-agent:$(TAG)   .
	docker build -f docker/repos/Dockerfile      -t $(REGISTRY)/repos:$(TAG)      .
	docker build -f docker/autonomous/Dockerfile -t $(REGISTRY)/autonomous:$(TAG) apps/automous-ai

## Push all images to registry
docker-push: docker-build
	docker push $(REGISTRY)/gateway:$(TAG)
	docker push $(REGISTRY)/auth:$(TAG)
	docker push $(REGISTRY)/ai-agent:$(TAG)
	docker push $(REGISTRY)/repos:$(TAG)
	docker push $(REGISTRY)/autonomous:$(TAG)

# ── Kubernetes ────────────────────────────────────────────────────────────────

.PHONY: k8s-apply k8s-delete k8s-status k8s-logs k8s-secrets

## Apply base manifests (dev/staging)
k8s-apply:
	kubectl apply -k kubernetes/base

## Apply production overlay
k8s-apply-prod:
	kubectl apply -k kubernetes/overlays/production

## Delete all resources in namespace
k8s-delete:
	kubectl delete -k kubernetes/base

## Show pod status
k8s-status:
	kubectl get pods -n $(NAMESPACE) -o wide

## Stream pod logs: make k8s-logs SVC=gateway
k8s-logs:
	kubectl logs -n $(NAMESPACE) -l app=$(SVC) -f --max-log-requests=5

## Create secrets from .env (fill .env first, then run this once)
k8s-secrets:
	kubectl apply -f kubernetes/base/secrets.yaml

## Restart a deployment: make k8s-restart SVC=gateway
k8s-restart:
	kubectl rollout restart deployment/$(SVC) -n $(NAMESPACE)

## Watch rollout status: make k8s-rollout SVC=gateway
k8s-rollout:
	kubectl rollout status deployment/$(SVC) -n $(NAMESPACE)

# ── Database ──────────────────────────────────────────────────────────────────

.PHONY: db-shell db-backup

## Open a psql shell inside the postgres container
db-shell:
	$(COMPOSE) exec postgres psql -U postgres codekang_platform

## Manual backup
db-backup:
	$(COMPOSE) exec postgres pg_dump -U postgres codekang_platform | gzip > backup-$$(date +%Y%m%d-%H%M%S).sql.gz

# ── Help ──────────────────────────────────────────────────────────────────────

.PHONY: help
help:
	@echo ""
	@echo "  CodeKang Platform — available targets:"
	@echo ""
	@grep -E '^##' Makefile | sed 's/## /    /'
	@echo ""
