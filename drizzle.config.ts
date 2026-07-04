import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { existsSync } from "node:fs";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
