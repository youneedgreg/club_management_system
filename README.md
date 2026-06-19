# Black Stars — Club Management System

Lounge & nightclub management for **Black Stars** (Westlands, Nairobi). Built with
Next.js (App Router) on top of the static prototype in [`black stars html/`](black%20stars%20html/).
All money is **KES**. UI locales: `en`, `fr`, `ar` (Arabic = RTL).

> Build plan and progress: [tasks.md](tasks.md) · Service costs: [SERVICES_AND_COSTS.md](SERVICES_AND_COSTS.md)
> · Architecture decisions: [docs/decisions/](docs/decisions/)

## Stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Framework      | Next.js 16 (App Router) · React 19 · TS |
| Styling        | Tailwind CSS v4 · shadcn/ui · lucide    |
| Database       | Neon (serverless Postgres)              |
| ORM            | Drizzle ORM + drizzle-kit               |
| Auth           | Neon Auth (Stack Auth)                  |
| Env validation | zod + @t3-oss/env-nextjs                |
| Email          | Resend                                  |
| SMS / WhatsApp | Twilio                                  |
| AI             | Claude API (Anthropic)                  |
| Payments       | M-Pesa Daraja                           |
| Hosting        | Vercel                                  |

See [docs/decisions/0001-stack-foundations.md](docs/decisions/0001-stack-foundations.md)
for the ORM / Auth / DB rationale.

## Prerequisites

- **Node.js** ≥ 20 (developed on 24)
- **pnpm** ≥ 10 — `corepack enable` or `npm i -g pnpm`

## Getting started

```bash
pnpm install           # install dependencies
cp .env.example .env.local   # then fill in values you need (all optional for now)
pnpm dev               # start the dev server → http://localhost:3000
```

Integration keys (DB, auth, Resend, Twilio, Claude, M-Pesa) are **optional** until
the phase that uses them — the app runs without them. Each key is documented in
[.env.example](.env.example) and typed/validated in [src/env.ts](src/env.ts). Cost
context lives in [SERVICES_AND_COSTS.md](SERVICES_AND_COSTS.md).

## Scripts

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `pnpm dev`          | Run the dev server (Turbopack)                |
| `pnpm build`        | Production build                              |
| `pnpm start`        | Serve the production build                    |
| `pnpm lint`         | ESLint (flat config, next + prettier)         |
| `pnpm lint:fix`     | ESLint with `--fix`                           |
| `pnpm format`       | Prettier write across the repo                |
| `pnpm format:check` | Prettier check (no writes)                    |
| `pnpm typecheck`    | `tsc --noEmit` (strict mode)                  |

A **pre-commit hook** (husky + lint-staged) auto-runs ESLint `--fix` and Prettier
on staged files. To bypass env validation in a CI lint-only job, set
`SKIP_ENV_VALIDATION=1`.

## Project structure

```
src/
  app/         Next.js App Router routes, layouts, pages
  components/  React components (ui/ = shadcn primitives)
  hooks/       Reusable client hooks
  lib/         Framework-agnostic utilities (cn, formatters)
  db/          Drizzle client, schema, seed (Phase 3)
  server/      Server Actions (actions/) + domain logic (services/)
  i18n/        next-intl message catalogs (Phase 2)
  types/       Shared cross-cutting types
  env.ts       Typed, validated environment config
```

## Reference prototype

[`black stars html/`](black%20stars%20html/) is the original static React prototype
(`app.jsx`, `ui.jsx`, `modules_*.jsx`, `data.js`, `i18n.js`) plus screenshots in
`screens/`. It is the source of truth for look/feel and domain data while porting.
