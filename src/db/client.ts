import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "@/env";

import * as schema from "./schema";

/**
 * Drizzle client bound to Neon's serverless HTTP driver — one round-trip per
 * query, no connection pool to manage, ideal for Vercel Functions.
 *
 * This module has no `server-only` guard so CLI scripts (seed/verify) can use
 * it. App code should import {@link db} from `@/db` instead, which adds the
 * guard. Columns are written camelCase in the schema and mapped to snake_case
 * via `casing` — keep in sync with `drizzle.config.ts`.
 */
const sql = neon(env.DATABASE_URL);

export const db = drizzle({ client: sql, schema, casing: "snake_case" });

export type Db = typeof db;
export { schema };
