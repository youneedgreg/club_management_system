import "server-only";

import { isAuthConfigured } from "@/lib/auth/server";
import { requireMembership } from "@/lib/auth/session";

import { getDefaultClubId } from "./services";

/**
 * The club to scope queries to: the session's club once Neon Auth is wired,
 * else the single seeded club (keeps the app usable in dev before auth env is
 * present, mirroring the `(app)` layout's `isAuthConfigured` guard).
 */
export async function getActiveClubId(): Promise<string> {
  if (!isAuthConfigured) return getDefaultClubId();
  return (await requireMembership()).clubId;
}
