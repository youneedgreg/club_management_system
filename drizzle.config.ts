import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so load the local env file if present.
// Node 21+ ships `process.loadEnvFile`; guard for safety.
try {
  process.loadEnvFile?.(".env");
} catch {
  // .env is optional (CI may inject DATABASE_URL directly).
}

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set — add it to .env (see .env.example).");
}

export default defineConfig({
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  // Write camelCase schema keys; emit snake_case columns/tables.
  casing: "snake_case",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
