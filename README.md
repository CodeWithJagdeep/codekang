# CodeKang Platform 🤖

Production-grade GitHub AI automation platform powered by Claude. Autonomously fixes GitHub issues, creates pull requests, and manages repositories with AI-driven code analysis.

## Architecture Overview

**Microservices Stack:**

- **Gateway** (NestJS) - HTTP API entry point, routes to microservices
- **Auth** (NestJS) - JWT tokens, OAuth (GitHub/Google), Firebase integration
- **AI Agent** (NestJS) - Conversation management, Claude API integration
- **Repos** (NestJS) - Repository management, GitHub integration
- **Autonomous Agent** (Express) - Advanced AI worker that analyzes issues, executes browser-based research, and autonomously creates PRs.
- **Frontend** (Next.js 15) - Professional dashboard featuring a modernized settings platform:
  - **Support Ticketing**: Full-featured threaded support system with status tracking and ratings.
  - **Member Management**: Vibrant, high-contrast team controls with role-based permissions.
  - **Profile Panel**: Dashboard-style user information card with integrated AI controls.
  - **Unified Layout**: Sticky breadcrumbs and glassmorphism-inspired settings interface.

**Infrastructure:**

- **PostgreSQL** (pgvector) - Vector embeddings, conversation history, repository data
- **Redis** - Caching, session storage, job queue (BullMQ)

---

## Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **Docker & Docker Compose** (for containerized setup)
- **kubectl** (for Kubernetes deployment)
- **Environment variables** - Copy `.env.example` to `.env` and configure

```bash
cp .env.example .env
# Edit .env with your API keys, secrets, and credentials
```

---

## Installation

```bash
# Install all dependencies (root + all workspaces)
npm install

# Playwright Setup (for Autonomous Agent)
npx playwright install --with-deps

# Ollama Setup (Optional, for local models)
# Download from https://ollama.com and run:
# ollama serve
```

---

## Running Services

### Option 1: Docker Compose (Full Stack)

#### Development (with hot-reload)

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Services:

- Gateway: `http://localhost:3000/api/v1` (Swagger: `/api/docs`)
- Auth: `http://localhost:3011`
- Frontend: `http://localhost:3010`
- Autonomous: `http://localhost:4000`

#### Production

```bash
docker-compose up -d
```

#### With Development Tools (pgAdmin, Redis Commander, Bull Board)

```bash
docker-compose --profile tools up
```

#### With Monitoring (Prometheus, Grafana)

```bash
docker-compose --profile monitoring up
```

---

### Option 2: Individual npm Services (Local Development)

#### Install dependencies first

```bash
npm install
```

#### Start Individual Services (in separate terminals)

**Gateway (HTTP, port 3000)**

```bash
npm run start:gateway
```

- Swagger docs: `http://localhost:3000/api/docs`

**Auth Service (HTTP 3011 + TCP 3001)**

```bash
npm run start:auth
```

**AI Agent Service (TCP 3002)**

```bash
npm run start:ai-agent
```

**Repos Service (TCP 3003)**

```bash
npm run start:repos
```

**Autonomous Agent (HTTP 4000)**

```bash
npm run start:autonomous
```

**Frontend (port 3010)**

```bash
cd codekang-web && npm run dev
```

#### Start All NestJS Services Together

```bash
npm run dev
```

#### Start Everything (including Autonomous + Frontend)

```bash
npm run dev:all
```

---

### Option 3: Build & Run Production Mode

#### Build all services

```bash
npm run build
# Or build individual services:
npm run build:gateway
npm run build:auth
npm run build:ai-agent
npm run build:repos
```

#### Run production

```bash
NODE_ENV=production npm run start:prod:gateway
```

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Container images built and pushed to registry (or use local)

### Deploy Base Configuration

```bash
# Deploy to 'codekang' namespace
kubectl apply -k kubernetes/base/

# Check deployment status
kubectl get pods -n codekang
kubectl logs -n codekang deployment/gateway
```

### Deploy Production Configuration

```bash
# High-availability deployment to 'codekang-prod' namespace
kubectl apply -k kubernetes/overlays/production/

# Verify
kubectl get pods -n codekang-prod
kubectl get hpa -n codekang-prod
```

### Access Services

```bash
# Port forward to gateway
kubectl port-forward -n codekang svc/gateway 3000:3000

# Port forward to auth
kubectl port-forward -n codekang svc/auth 3011:3011

# View logs
kubectl logs -n codekang deployment/gateway -f
kubectl logs -n codekang deployment/auth -f
```

### Scale Services

```bash
# Manual scaling
kubectl scale deployment gateway --replicas=5 -n codekang

# Or use HPA (configured for production overlay)
kubectl get hpa -n codekang-prod
```

### Delete Deployment

```bash
# Delete base
kubectl delete -k kubernetes/base/

# Delete production
kubectl delete -k kubernetes/overlays/production/
```

---

## Service Ports Reference

| Service    | HTTP | TCP  | Purpose                    |
| ---------- | ---- | ---- | -------------------------- |
| Gateway    | 3000 | -    | API entry point            |
| Auth       | 3011 | 3001 | Authentication, OAuth      |
| AI Agent   | -    | 3002 | Conversation, Claude API   |
| Repos      | -    | 3003 | Repository management      |
| Autonomous | 4000 | -    | Webhook, autonomous fixing |
| Frontend   | 3010 | -    | Web UI                     |
| PostgreSQL | -    | 5432 | Database                   |
| Redis      | -    | 6379 | Cache, job queue           |

---

## Development Tools

### Build

```bash
npm run build          # Build all services
npm run build:gateway  # Build specific service
```

### Testing

```bash
npm run test           # Unit tests
npm run test:watch     # Watch mode
npm run test:cov       # Coverage report
npm run test:e2e       # E2E tests
```

### Linting & Formatting

```bash
npm run lint           # Run eslint with auto-fix
npm run format         # Run prettier
```

---

## Environment Configuration

Create `.env` file with:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codekang_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=codekang_platform

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-change-this
JWT_REFRESH_EXPIRES_IN=7d

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3011/auth/github/callback

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3011/auth/google/callback

# AI/Claude
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-sonnet-4-6

# GitHub App (for autonomous agent)
GITHUB_APP_ID=your_github_app_id
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_APP_PRIVATE_KEY_PATH=./github-app-private-key.pem

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_CLIENT_EMAIL=your_firebase_email
FIREBASE_PRIVATE_KEY=your_firebase_key

# URLs
FRONTEND_URL=http://localhost:3010
GATEWAY_URL=http://localhost:3000
WEBHOOK_URL=http://localhost:4000/webhook
```

---

## API Documentation

Once running, visit Swagger docs:

- **Gateway**: `http://localhost:3000/api/docs`
- **Auth**: `http://localhost:3011/api/docs` (if enabled)

---

## Monorepo Structure

```
codekang-platform/
├── apps/
│   ├── gateway/          # HTTP API Gateway (port 3000)
│   ├── auth/             # Auth Service (ports 3011/3001)
│   ├── ai-agent/         # AI Agent (port 3002)
│   ├── repos/            # Repos Service (port 3003)
│   └── automous-ai/      # Autonomous Agent (port 4000, Express)
├── libs/
│   └── common/           # Shared types, guards, constants
├── codekang-web/         # Next.js frontend (port 3010)
├── kubernetes/           # K8s manifests (Kustomize)
│   ├── base/             # Base configuration
│   └── overlays/
│       └── production/   # Production HA setup
├── docker-compose.yml    # Production compose
├── docker-compose.dev.yml # Development overrides
└── package.json          # Root monorepo config
```

---

## Common Commands

```bash
# Install dependencies
npm install

# Start all services for development
npm run dev

# Build all services
npm run build

# Run tests
npm run test

# Format code
npm run format

# Lint code
npm run lint

# Docker - Production
docker-compose up -d

# Docker - Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Docker - With tools (pgAdmin, Redis Commander, Bull Board)
docker-compose --profile tools up

# Kubernetes - Deploy base
kubectl apply -k kubernetes/base/

# Kubernetes - Deploy production HA
kubectl apply -k kubernetes/overlays/production/

# Kubernetes - Port forward gateway
kubectl port-forward svc/gateway 3000:3000 -n codekang
```

---

## Health Checks

Each service exposes a health endpoint:

```bash
# Gateway
curl http://localhost:3000/health

# Auth
curl http://localhost:3011/health

# Autonomous
curl http://localhost:4000/health
```

---

## Troubleshooting

### Services won't start locally

1. Ensure PostgreSQL and Redis are running
2. Check `.env` file has correct DATABASE_URL and REDIS_URL
3. Run `npm install` to install all dependencies
4. Check port conflicts: `lsof -i :3000` (etc.)

### Docker issues

1. Ensure `.env` file exists
2. Check firewall/port availability
3. View logs: `docker-compose logs <service_name>`
4. Rebuild: `docker-compose up --build`

### Kubernetes issues

1. Check pod status: `kubectl get pods -n codekang`
2. View logs: `kubectl logs -n codekang deployment/gateway`
3. Describe pod: `kubectl describe pod -n codekang <pod_name>`
4. Check services: `kubectl get svc -n codekang`

---

## CI/CD

See `.github/workflows/` for GitHub Actions pipelines (if configured).

---

## Support & Issues

For issues and feature requests, create an issue in the repository.

---

## License

UNLICENSED

---

## Team

CodeKang Platform - AI-Powered GitHub Automation
