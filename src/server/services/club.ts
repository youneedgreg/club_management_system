import { eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

import { getDefaultClubId } from "./period";

const { clubs } = schema;

export type Club = typeof clubs.$inferSelect;

/** The club profile (defaults to the single seeded venue). */
export async function getClub(clubId?: string): Promise<Club | null> {
  const id = clubId ?? (await getDefaultClubId());
  const [row] = await db.select().from(clubs).where(eq(clubs.id, id)).limit(1);
  return row ?? null;
}

export { getDefaultClubId };
