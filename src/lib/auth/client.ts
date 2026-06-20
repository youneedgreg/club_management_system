"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/**
 * Browser auth client. Proxies through this app's `/api/auth/[...path]` route
 * (same origin), so it needs no public keys. Exposes Better Auth methods:
 * `signIn.email`, `signIn.social`, `signUp.email`, `signOut`, `useSession`, …
 */
export const authClient = createAuthClient();
