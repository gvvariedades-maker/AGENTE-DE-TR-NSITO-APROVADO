import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { resolveDatabaseUrl } from "./resolve-database-url";
import * as schema from "./schema";

const connectionString = resolveDatabaseUrl();
const isServerless = Boolean(process.env.VERCEL);

const client = postgres(connectionString, {
  prepare: false,
  max: isServerless ? 1 : 5,
  idle_timeout: isServerless ? 5 : 20,
  connect_timeout: 8,
  max_lifetime: isServerless ? 60 : 60 * 30,
  connection: {
    application_name: "ata-aprovado",
  },
});

export const db = drizzle(client, { schema });
