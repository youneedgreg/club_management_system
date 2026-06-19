import { and, desc, eq } from "drizzle-orm";

import { db, schema } from "@/db/client";

const { sales } = schema;

/** Recent sales feed for a night, newest first. */
export function getRecentSales(clubId: string, businessDate: string, limit = 20) {
  return db
    .select()
    .from(sales)
    .where(and(eq(sales.clubId, clubId), eq(sales.businessDate, businessDate)))
    .orderBy(desc(sales.occurredAt))
    .limit(limit);
}
