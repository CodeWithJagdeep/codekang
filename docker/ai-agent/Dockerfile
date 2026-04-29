FROM node:22-alpine AS builder
WORKDIR /app

# Monorepo: copy root package files and only the ai-agent app source
COPY package*.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY apps/ai-agent/ ./apps/ai-agent/

RUN npm install --ignore-scripts
RUN npm run build:ai-agent

# ── Runtime ────────────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app/dist/apps/ai-agent/ ./dist/apps/ai-agent/

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
USER nestjs

ENV NODE_ENV=production
EXPOSE 3002

CMD ["node", "dist/apps/ai-agent/main"]
