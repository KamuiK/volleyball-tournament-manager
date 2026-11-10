import { afterAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";

const confirmedDevelopmentDatabase = process.env.WP04_CONFIRMED_DEVELOPMENT_DATABASE === "1";
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

describe.skipIf(!confirmedDevelopmentDatabase || !hasDatabaseUrl)("Neon development transaction smoke check", () => {
  it("executes a read-only query inside a real Drizzle transaction", async () => {
    const { db } = await import("@/src/db");
    const result = await db.transaction((tx) => tx.execute(sql`select 1 as value`));
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({ value: 1 });
  });

  afterAll(async () => {
    const { closeDatabasePoolForTests } = await import("@/src/db");
    await closeDatabasePoolForTests();
  });
});
