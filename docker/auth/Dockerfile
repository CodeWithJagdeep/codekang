FROM node:22-alpine AS builder
WORKDIR /app

# Monorepo: copy root package files and only the auth app source
COPY package*.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY apps/auth/ ./apps/auth/

RUN npm ci --ignore-scripts
RUN npm run build:auth

# ── Runtime ────────────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist/apps/auth/ ./dist/apps/auth/

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
USER nestjs

ENV NODE_ENV=production
# auth is a TCP-only microservice (port 3001); 3011 kept for legacy compat
EXPOSE 3001

CMD ["node", "dist/apps/auth/main"]
