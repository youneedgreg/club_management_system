import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

import { canAccess, type MemberRole } from "./roles";
import { auth, isAuthConfigured } from "./server";

const { clubMembers, clubs } = schema;

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

export interface Membership {
  clubId: string;
  role: MemberRole;
}

/**
 * The current authenticated user (or null). Memoized per request via `cache()`
 * so multiple components share one session read. Tolerant of the beta SDK's
 * session shape.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  if (!auth) return null;
  try {
    // Confirmed shape: { data: { session, user }, error }.
    const { data } = (await auth.getSession()) as {
      data?: { user?: Partial<AuthUser> } | null;
    };
    const u = data?.user;
    if (!u?.id) return null;
    return { id: u.id, email: u.email ?? null, name: u.name ?? null, image: u.image ?? null };
  } catch {
    return null;
  }
});

/** Require an authenticated user; redirect to sign-in otherwise. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}

/**
 * The current user's club membership. Bootstraps the **first** user as `owner`
 * of the single seeded club; later member-less users are treated as pending
 * invites (null). Memoized per request.
 */
export const getMembership = cache(async (): Promise<Membership | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const [existing] = await db
    .select({ clubId: clubMembers.clubId, role: clubMembers.role })
    .from(clubMembers)
    .where(eq(clubMembers.userId, user.id))
    .limit(1);
  if (existing) return existing;

  const [club] = await db.select({ id: clubs.id }).from(clubs).limit(1);
  if (!club) return null;

  // First user to arrive at an unclaimed club becomes its owner.
  const [anyMember] = await db
    .select({ id: clubMembers.id })
    .from(clubMembers)
    .where(eq(clubMembers.clubId, club.id))
    .limit(1);
  if (anyMember) return null;

  const [created] = await db
    .insert(clubMembers)
    .values({
      clubId: club.id,
      userId: user.id,
      role: "owner",
      email: user.email,
      displayName: user.name,
    })
    .returning({ clubId: clubMembers.clubId, role: clubMembers.role });
  return created ?? null;
});

export interface ActiveSession {
  user: AuthUser;
  clubId: string;
  role: MemberRole;
}

/** Require an authenticated user **with** a club membership. */
export async function requireMembership(): Promise<ActiveSession> {
  const user = await requireUser();
  const membership = await getMembership();
  if (!membership) redirect("/auth/no-access");
  return { user, clubId: membership.clubId, role: membership.role };
}

/**
 * Require access to a module/capability (server-side authorization). Redirects
 * to the dashboard if the role is insufficient. Use in sensitive pages and
 * Server Actions (payables, salaries, settings…).
 */
export async function requireModule(moduleKey: string): Promise<ActiveSession> {
  const session = await requireMembership();
  if (!canAccess(session.role, moduleKey)) redirect("/dashboard");
  return session;
}

/**
 * Page-level guard for a sensitive route. No-op until Neon Auth is provisioned
 * (so the app stays usable in dev); afterwards enforces the role requirement.
 */
export async function enforceModule(moduleKey: string): Promise<void> {
  if (!isAuthConfigured) return;
  await requireModule(moduleKey);
}
