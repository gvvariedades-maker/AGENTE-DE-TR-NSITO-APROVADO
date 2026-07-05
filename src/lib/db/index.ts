import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { resolveDatabaseUrl } from "./resolve-database-url";
import * as schema from "./schema";

const connectionString = resolveDatabaseUrl();

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
