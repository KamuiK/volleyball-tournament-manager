import { afterEach, describe, expect, it, vi } from "vitest";

describe("lazy Neon transaction adapter wiring", () => {
  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.doUnmock("@neondatabase/serverless");
    vi.doUnmock("drizzle-orm/neon-serverless");
  });

  it("defers Pool creation and delegates transactions to the Pool-backed adapter", async () => {
    const transaction = vi.fn(async (callback: (tx: object) => Promise<string>) => callback({}));
    const end = vi.fn(async () => undefined);
    const poolConstructor = vi.fn(function (this: { end: typeof end }, options: unknown) {
      void options;
      this.end = end;
    });
    const drizzle = vi.fn(() => ({ transaction }));
    vi.stubEnv("DATABASE_URL", "postgresql://test.invalid/unused");
    vi.doMock("@neondatabase/serverless", () => ({ Pool: poolConstructor }));
    vi.doMock("drizzle-orm/neon-serverless", () => ({ drizzle }));

    const { db, closeDatabasePoolForTests } = await import("@/src/db");
    expect(poolConstructor).not.toHaveBeenCalled();
    await expect(db.transaction(async () => "committed")).resolves.toBe("committed");
    expect(poolConstructor).toHaveBeenCalledOnce();
    expect(drizzle).toHaveBeenCalledOnce();
    expect(transaction).toHaveBeenCalledOnce();
    await closeDatabasePoolForTests();
    expect(end).toHaveBeenCalledOnce();
  });
});
