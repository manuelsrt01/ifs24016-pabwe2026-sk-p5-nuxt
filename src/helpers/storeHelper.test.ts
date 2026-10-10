import { describe, expect, it } from "vitest";
import { runTask } from "./storeHelper";

describe("runTask", () => {
  it("sukses: set flag, pesan, dan mengembalikan true", async () => {
    const state: Record<string, any> = { loading: false, done: false, error: "x", message: "" };
    let during: boolean;
    const result = await runTask(state, "loading", "done", async () => {
      during = state.loading;
      return "selesai";
    });
    expect(during).toBe(true);
    expect(result).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.done).toBe(true);
    expect(state.message).toBe("selesai");
    expect(state.error).toBe("");
  });

  it("gagal: set error dan mengembalikan false", async () => {
    const state: Record<string, any> = { loading: false, done: true, error: "", message: "" };
    const result = await runTask(state, "loading", "done", async () => {
      throw new Error("gagal");
    });
    expect(result).toBe(false);
    expect(state.error).toBe("gagal");
    expect(state.done).toBe(false);
    expect(state.loading).toBe(false);
  });
});
