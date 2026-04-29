FROM node:22-alpine AS builder
WORKDIR /app

# Monorepo: copy root package files and only the repos app source
COPY package*.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY apps/repos/ ./apps/repos/

RUN npm install --ignore-scripts
RUN npm run build:repos

# ── Runtime ────────────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app/dist/apps/repos/ ./dist/apps/repos/

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
USER nestjs

ENV NODE_ENV=production
EXPOSE 3003

CMD ["node", "dist/apps/repos/main"]
