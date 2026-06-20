import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";

/**
 * Route protection (Next 16's `proxy`, formerly `middleware`). Redirects
 * unauthenticated requests to the sign-in page. Optimistic gate only — real
 * authorization is re-checked server-side in `src/lib/auth/session.ts`.
 *
 * When Neon Auth isn't configured, requests pass through untouched.
 *
 * Note: Neon Auth session cookies are `__Secure-` prefixed, so local dev must
 * run over HTTPS (`pnpm dev:https`) or the cookie is dropped and every request
 * redirects to sign-in.
 */
export default auth ? auth.middleware({ loginUrl: "/auth/sign-in" }) : () => NextResponse.next();

export const config = {
  // Guard everything except the auth pages, the auth API, and static assets.
  matcher: ["/((?!auth|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
