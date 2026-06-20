# ADR 0001 — Stack foundations: ORM, Auth, Database, Package manager

- **Status:** Accepted
- **Date:** 2026-06-19
- **Context:** Phase 0 (Project Foundation & Tooling) — see [tasks.md](../../tasks.md)

## Context

Black Stars is moving from a static HTML/React prototype to a production Next.js 16
(App Router) application. Phase 0 requires committing to a small number of
foundational technologies that shape every later phase: the ORM, the auth
provider, the Postgres host, and the package manager. Cost envelopes are in
[SERVICES_AND_COSTS.md](../../SERVICES_AND_COSTS.md) — at club scale (~200 members)
hosting, DB, auth and AI all sit comfortably in free tiers; Twilio SMS dominates.

## Decisions

### 1. ORM → Drizzle ORM (+ drizzle-kit)

TypeScript-first, SQL-like query builder with low runtime overhead — a good fit
for serverless/edge execution on Vercel and for Neon's serverless driver.
Explicit, reviewable migrations via `drizzle-kit`. Row types infer directly into
our `types/`, reducing duplication.

- _Rejected:_ **Prisma** — excellent DX and Studio, but a heavier client and an
  extra schema language; Drizzle's lighter footprint suits serverless better.

### 2. Auth → Neon Auth (Stack Auth)

> **Update (ADR 0003):** the Neon Auth vendor decision stands, but the SDK and
> env keys changed — we now use `@neondatabase/auth` (Better Auth), not Stack
> Auth. See [ADR 0003](./0003-auth-neon-better-auth.md).

Keeps auth and the database with a single vendor: Neon Auth (powered by Stack
Auth) provisions users and **syncs them into our Postgres** automatically, which
simplifies the audit/attribution requirements (who recorded a payment/expense/
advance) and future multi-tenant scoping by club.

- _Rejected:_ **Clerk** — best-in-class Next.js auth, but a second vendor; the
  single-vendor Neon path wins for this project's scale and data-locality needs.

### 3. Database → Neon (serverless Postgres)

Serverless Postgres with scale-to-zero, instant branching (great for preview
deploys), and first-class Vercel + Drizzle integration. Pairs with the Neon Auth
decision above.

- _Rejected:_ **Supabase** — strong all-in-one (DB + auth + storage), but we are
  not adopting Supabase Auth, so Neon's leaner Postgres + branching is preferred.

### 4. Package manager → pnpm

Fast, disk-efficient, strict dependency resolution; already installed (v10).

- _Rejected:_ **npm** — fine, but pnpm's speed/strictness is the better default.

## Consequences

- `src/db` uses the Drizzle + Neon serverless driver; migrations land in
  `/drizzle` (Phase 3).
- `.env.example` and [src/env.ts](../../src/env.ts) document and validate
  `DATABASE_URL` (Neon) and the `STACK_*` / `NEXT_PUBLIC_STACK_*` keys (Neon Auth).
- Auth integration, route protection and role gating are implemented in Phase 4.
- CI and the pre-commit hook assume pnpm.

## Revisiting

Revisit if: we add a second venue and need cross-tenant auth features Stack Auth
lacks; query ergonomics push us toward Prisma; or Neon limits (connections,
branching quota) become a constraint at scale.
