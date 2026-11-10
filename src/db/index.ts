import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL must be set to connect to the database.");
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000
  });
  return { db: drizzle(pool, { schema }), pool };
}

let resources: ReturnType<typeof createDatabase> | undefined;
function getResources() {
  resources ??= createDatabase();
  return resources;
}

// Delay configuration access until a query is made. This lets anonymous routes
// and build-time page collection load without a database connection. Keep one
// small pool per warm Node.js server instance; Drizzle releases transaction
// clients, and the pool is closed explicitly only by verification code.
export const db = new Proxy({} as ReturnType<typeof createDatabase>["db"], {
  get(_target, property) {
    const instance = getResources().db;
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  }
});
export type Database = ReturnType<typeof createDatabase>["db"];

export async function closeDatabasePoolForTests() {
  if (resources) {
    await resources.pool.end();
    resources = undefined;
  }
}
