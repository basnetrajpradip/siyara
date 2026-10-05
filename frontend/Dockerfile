# syntax=docker/dockerfile:1

FROM node:24-slim AS deps

RUN npm install -g pnpm@11

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

FROM node:24-slim AS builder

RUN npm install -g pnpm@11

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `output: "standalone"` in next.config.ts produces a self-contained server
RUN pnpm build

FROM node:24-slim AS runtime

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
