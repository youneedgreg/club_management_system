import "server-only";

/**
 * Server-only entrypoint for the Drizzle client. App code (Server Components,
 * the data-access layer in `src/server/services`, Server Actions) imports the
 * client from here so it can never be pulled into a client bundle.
 *
 * CLI scripts that run in plain Node (seed, verify) import `@/db/client`
 * directly, which has no `server-only` guard.
 */
export { db, schema, type Db } from "./client";
