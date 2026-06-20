# ADR 0003 — Auth SDK: Neon Auth on Better Auth (`@neondatabase/auth`)

- **Status:** Accepted
- **Date:** 2026-06-20
- **Context:** Phase 4 (Authentication & Authorization) — see [tasks.md](../../tasks.md)
- **Supersedes:** the SDK/keys part of [ADR 0001 §2](./0001-stack-foundations.md) (the
  Neon-Auth-vendor decision stands; only the SDK and env keys change).

## Context

ADR 0001 chose **Neon Auth** as the provider, then powered by **Stack Auth**
(`@stackframe/stack`, `NEXT_PUBLIC_STACK_*` / `STACK_SECRET_SERVER_KEY`). Since
then Neon Auth shipped a new first-party SDK, **`@neondatabase/auth`** (v0.4.x
beta at time of writing), built on **[Better Auth](https://www.better-auth.com)**.
The current Neon Auth Next.js quick-starts use this SDK.

## Decision

Adopt **`@neondatabase/auth`** with custom (hand-built, themed) auth UI.

- **Env keys:** `NEON_AUTH_BASE_URL` + `NEON_AUTH_COOKIE_SECRET` (≥32 chars),
  both server-only. The browser client (`createAuthClient()` from
  `@neondatabase/auth/next`) proxies through this app's `/api/auth/[...all]`
  route, so **no `NEXT_PUBLIC_` auth keys** are required. The old `STACK_*` keys
  are removed from `env.ts` / `.env.example`.
- **Server:** `createNeonAuth({ baseUrl, cookies })` in
  [src/lib/auth/server.ts](../../src/lib/auth/server.ts) exposes `handler()`,
  `middleware()`, `getSession()` / `getUser()`.
- **Route protection:** Next 16 renamed the `middleware` convention to
  **`proxy`**; protection lives in [src/proxy.ts](../../src/proxy.ts) (nodejs
  runtime). Middleware is an optimistic gate only — authorization is re-checked
  server-side in the data-access layer (per the Next.js auth guide).
- **UI:** custom sign-in / sign-up pages (the package also ships prebuilt UI at
  `@neondatabase/auth/react/ui`, kept as a future option).

### Consequences for the data model

- Better Auth user ids are **opaque strings, not UUIDs**. So user-referencing
  columns are `text`: the new `club_members.user_id`, and the existing
  `created_by` audit columns are migrated `uuid → text`.
- Roles + multi-tenant membership live in our own **`club_members`** table
  (`user_id` × `club_id` × `member_role`), not in the auth provider — see
  [ADR 0001 §2](./0001-stack-foundations.md) rationale for single-vendor data
  locality.

## Notes / risk

- `@neondatabase/auth` is **beta**; pin the version and revisit on GA.
- Auth env vars are **optional** in `env.ts` so the app builds before Neon Auth
  is provisioned; the auth server throws a clear error if used unconfigured.

## Revisiting

Revisit if the beta SDK's API churns badly before GA (fall back to
`@stackframe/stack`, still available), or if we need provider-side teams/roles.
