# syntax=docker/dockerfile:1

FROM node:24-slim AS deps

# Build tools for the native bcrypt binary
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@11

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# --ignore-scripts skips the prisma postinstall, which needs env at build time
RUN pnpm install --frozen-lockfile --ignore-scripts \
    && pnpm rebuild bcrypt esbuild

# Generate the Prisma client without env: --schema bypasses prisma.config.ts;
# the copied tsconfig yields .js specifiers runnable by plain `node`.
COPY prisma ./prisma
COPY tsconfig.json ./tsconfig.json
RUN node_modules/.bin/prisma generate --schema prisma/schema

FROM node:24-slim AS builder

RUN npm install -g pnpm@11

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma/generated ./prisma/generated
COPY . .

RUN pnpm build

FROM node:24-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Full node_modules keeps the native bcrypt and the prisma CLI available
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Needed for `prisma migrate deploy` on container start
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

RUN mkdir -p uploads logs

EXPOSE 4000

# Clean builds emit dist/src/index.js (the repo `start` script targets a stale dist/index.js)
CMD ["node", "dist/src/index.js"]
