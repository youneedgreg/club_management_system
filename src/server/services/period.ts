import { and, asc, desc, eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

const { clubs, nightlySnapshots } = schema;

/** The seeded default club (single venue until Phase 4 wires session scope). */
export async function getDefaultClubId(): Promise<string> {
  const [row] = await db
    .select({ id: clubs.id })
    .from(clubs)
    .orderBy(asc(clubs.createdAt))
    .limit(1);
  if (!row) throw new Error("No club found — run `pnpm db:seed`.");
  return row.id;
}

/** The current trading night's business date (the snapshot flagged tonight). */
export async function getTonightDate(clubId: string): Promise<string> {
  const [tonight] = await db
    .select({ d: nightlySnapshots.businessDate })
    .from(nightlySnapshots)
    .where(and(eq(nightlySnapshots.clubId, clubId), eq(nightlySnapshots.isTonight, true)))
    .limit(1);
  if (tonight) return tonight.d;

  const [latest] = await db
    .select({ d: nightlySnapshots.businessDate })
    .from(nightlySnapshots)
    .where(eq(nightlySnapshots.clubId, clubId))
    .orderBy(desc(nightlySnapshots.businessDate))
    .limit(1);
  if (!latest) throw new Error("No nightly snapshots — run `pnpm db:seed`.");
  return latest.d;
}

/** First-of-month ISO date for a `YYYY-MM-DD` business date. */
export const monthStart = (isoDate: string): string => `${isoDate.slice(0, 7)}-01`;
