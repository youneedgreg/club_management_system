import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";

/**
 * Route protection (Next 16's `proxy`, formerly `middleware`). Redirects
 * unauthenticated requests to the sign-in page. This is an **optimistic** gate
 * only — real authorization is re-checked server-side in the data-access layer
 * (`src/lib/auth/session.ts`), per the Next.js auth guidance.
 *
 * When Neon Auth isn't configured yet, requests pass through untouched so the
 * app remains usable in development before provisioning.
 */
export default auth ? auth.middleware({ loginUrl: "/auth/sign-in" }) : () => NextResponse.next();

export const config = {
  // Guard everything except the auth pages, the auth API, and static assets.
  matcher: ["/((?!auth|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
