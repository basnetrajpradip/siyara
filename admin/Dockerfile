# syntax=docker/dockerfile:1

FROM node:24-slim AS builder

RUN npm install -g pnpm@11

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Vite inlines VITE_* vars from admin/.env at build time
RUN pnpm build

FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
