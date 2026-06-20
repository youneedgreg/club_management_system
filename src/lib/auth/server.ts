import { createNeonAuth } from "@neondatabase/auth/next/server";

import { env } from "@/env";

/**
 * Neon Auth (Better Auth) server instance — the single entry point for the API
 * handler, route-protection middleware, and server-side session reads.
 *
 * Auth is optional until provisioned: when the env keys are absent, `auth` is
 * `null` so the app still builds and runs (unauthenticated) before Neon Auth is
 * set up. Server code guards on `auth`/`isAuthConfigured`. No `server-only` here
 * because the route handler and `proxy.ts` (both server-only contexts) import
 * this module.
 */
export const isAuthConfigured = Boolean(env.NEON_AUTH_BASE_URL && env.NEON_AUTH_COOKIE_SECRET);

export const auth = isAuthConfigured
  ? createNeonAuth({
      baseUrl: env.NEON_AUTH_BASE_URL as string,
      cookies: { secret: env.NEON_AUTH_COOKIE_SECRET as string },
    })
  : null;

/** Narrow `auth` to non-null, throwing a clear error if Neon Auth isn't configured. */
export function requireAuth() {
  if (!auth) {
    throw new Error(
      "Neon Auth is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET " +
        "(see .env.example and docs/decisions/0003-auth-neon-better-auth.md).",
    );
  }
  return auth;
}
