FROM node:22-alpine AS builder
WORKDIR /app

# Monorepo: copy root package files and only the gateway app source
COPY package*.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY apps/gateway/ ./apps/gateway/

RUN npm install --ignore-scripts
RUN npm run build:gateway

# ── Runtime ────────────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app/dist/apps/gateway/ ./dist/apps/gateway/

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
USER nestjs

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/apps/gateway/main"]
