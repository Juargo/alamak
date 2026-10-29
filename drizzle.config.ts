import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit does not read Next.js env files; load the local one when present.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// Migrations use the direct (unpooled) connection, ADR-0014.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/modules/*/infraestructura/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? "" },
  strict: true,
});
