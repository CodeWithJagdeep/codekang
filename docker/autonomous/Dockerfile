FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

# LanceDB writes embedded database files here — must exist before volume mount
RUN mkdir -p /data/lancedb

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /data
USER nodejs

ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm", "start"]
