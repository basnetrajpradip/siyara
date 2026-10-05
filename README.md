# Ayurdarpan

Ayurdarpan is an Ayurveda-focused platform with a public web app, an internal admin portal, and a backend API.

## Apps

| App | Path | Stack | Purpose |
| --- | --- | --- | --- |
| Public frontend | `frontend` | Next.js, React, Tailwind CSS | Customer-facing site, shop, consultation, services, knowledge, and account flows. |
| Admin portal | `admin` | Vite, React, React Router, Zustand, Axios, Tiptap, Tailwind CSS | Internal management for products, categories, orders, customers, doctors, consultations, knowledge, profile, and auth. |
| Backend API | `backend` | Express, TypeScript, Prisma, PostgreSQL, Zod | Auth, catalog, media, cart, orders, users, doctors, consultations, knowledge, mail, and admin APIs. |

## Documentation

- [Local setup](docs/SETUP.md)
- [Architecture overview](docs/ARCHITECTURE.md)
- [Backend conventions](docs/BACKEND_CONVENTIONS.md)
- [Admin conventions](docs/ADMIN_CONVENTIONS.md)

## Prerequisites

- Node.js and pnpm
- PostgreSQL
- Git with Husky hooks enabled through `pnpm install`

## Quick Start

Install dependencies from the repo root:

```bash
pnpm install
```

Create local environment files:

```bash
cp backend/.env.example backend/.env
cp admin/.env.example admin/.env
```

Update `backend/.env` with working database credentials (`DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_HOST`, `DATABASE_PORT` — the URL is built in `src/config/env.ts`), JWT secrets, app URLs, and mail settings. Then generate the Prisma client:

```bash
pnpm -C backend db:generate
```

Run the apps in separate terminals:

```bash
pnpm -C backend dev
pnpm -C admin dev
pnpm -C frontend dev
```

Default local URLs:

- Backend API: `http://localhost:4000`
- Public frontend: `http://localhost:3000`
- Admin portal: `http://localhost:3001`

Make sure `FRONTEND_URL`, `ADMIN_URL`, and `VITE_BACKEND_BASE_URL` match your local ports.

## Common Commands

Run commands per app with `pnpm -C <app> <script>`.

```bash
pnpm -C frontend typecheck
pnpm -C frontend lint

pnpm -C admin typecheck
pnpm -C admin lint

pnpm -C backend typecheck
pnpm -C backend lint
pnpm -C backend db:migrate-dev
pnpm -C backend db:studio
```

The repo has a Husky pre-commit hook at `.husky/pre-commit` that runs lint and typecheck checks for all three apps through `scripts/precommit-checks.mjs`.
