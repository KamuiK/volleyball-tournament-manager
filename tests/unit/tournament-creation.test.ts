import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  current: null as null | { id: string; name: string; currentStage: string; isCurrent: boolean },
  groupLabels: [] as string[],
  transactions: 0
}));

vi.mock("server-only", () => ({}));
vi.mock("@/src/db", () => ({
  db: {
    transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
      state.transactions += 1;
      const tx = {
        select: () => ({ from: () => ({ where: () => ({ limit: () => ({ for: async () => state.current ? [state.current] : [] }) }) }) }),
        insert: () => {
          let values: unknown;
          const query = {
            onConflictDoNothing: () => {
              if (Array.isArray(values)) {
                for (const group of values as Array<{ label: string }>) {
                  if (!state.groupLabels.includes(group.label)) state.groupLabels.push(group.label);
                }
              }
              return {
                returning: async () => {
                  if (!Array.isArray(values)) {
                    if (state.current) return [];
                    state.current = { id: "current-id", name: "Current Tournament", currentStage: "setup", isCurrent: true };
                    return [state.current];
                  }
                  return [];
                }
              };
            }
          };
          return {
            values: (input: unknown) => { values = input; return query; }
          };
        }
      };
      return callback(tx);
    }),
    select: () => ({ from: () => ({ where: () => ({ limit: () => {
      const query = {
        for: async () => state.current ? [state.current] : [],
        then: (resolve: (rows: unknown[]) => unknown) => Promise.resolve(state.current ? [state.current] : []).then(resolve)
      };
      return query;
    } }) }) })
  }
}));

import { createCurrentTournament, loadSetup } from "@/src/tournament/setup";

describe("explicit current tournament creation (mocked database transaction)", () => {
  beforeEach(() => {
    state.current = null;
    state.groupLabels = [];
    state.transactions = 0;
  });

  it("creates the tournament and both fixed groups in the same transaction", async () => {
    const result = await createCurrentTournament();
    expect(result).toMatchObject({ ok: true });
    expect(state.current).toMatchObject({ name: "Current Tournament", isCurrent: true });
    expect(state.groupLabels).toEqual(["Group A", "Group B"]);
    expect(state.transactions).toBe(1);
  });

  it("does not create tournament or group data just by loading an empty organizer setup", async () => {
    await expect(loadSetup()).resolves.toBeNull();
    expect(state.transactions).toBe(0);
    expect(state.current).toBeNull();
  });

  it("returns the existing tournament on repeated and concurrent create attempts", async () => {
    const results = await Promise.all([createCurrentTournament(), createCurrentTournament()]);
    expect(results.every((result) => result.ok)).toBe(true);
    expect(state.current?.id).toBe("current-id");
    expect(state.groupLabels).toEqual(["Group A", "Group B"]);
  });
});
