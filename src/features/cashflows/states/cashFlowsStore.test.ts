import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockPinia } from "../../../test-utils";
import * as cashFlowApi from "../api/cashFlowApi";
import { useCashFlowsStore } from "./cashFlowsStore";

vi.mock("../api/cashFlowApi", () => ({
  getCashFlows: vi.fn(),
  getCashFlow: vi.fn(),
  postCashFlow: vi.fn(),
  putCashFlow: vi.fn(),
  deleteCashFlow: vi.fn(),
  getLabels: vi.fn(),
  getStatsDaily: vi.fn(),
  getStatsMonthly: vi.fn(),
  deleteAllCashFlows: vi.fn(),
}));

const api = cashFlowApi as any;

const response = {
  message: "ok",
  data: {
    cash_flows: [{ id: 1 }],
    stats: { cashflow: 100 },
    cash_flow: { id: 2 },
    labels: ["gaji"],
    stats_cashflow: { "05-10-2024": 100 },
  },
};

// [action, args, fungsi API, flag loading, flag selesai]
const cases: [string, any[], string, string, string][] = [
  ["fetchCashFlows", [{ type: "inflow" }], "getCashFlows", "isCashFlow", "isCashFlowLoaded"],
  ["fetchCashFlow", [2], "getCashFlow", "isCashFlow", "isCashFlowLoaded"],
  ["fetchLabels", [], "getLabels", "isLabels", "isLabelsLoaded"],
  ["fetchStatsDaily", [7], "getStatsDaily", "isStatsDaily", "isStatsDailyLoaded"],
  ["fetchStatsMonthly", [6], "getStatsMonthly", "isStatsMonthly", "isStatsMonthlyLoaded"],
  ["addCashFlow", [{ label: "a" }], "postCashFlow", "isCashFlowAdd", "isCashFlowAdded"],
  ["changeCashFlow", [2, { label: "b" }], "putCashFlow", "isCashFlowChange", "isCashFlowChanged"],
  ["removeCashFlow", [2], "deleteCashFlow", "isCashFlowDelete", "isCashFlowDeleted"],
  ["removeAllCashFlows", [], "deleteAllCashFlows", "isCashFlowDeleteAll", "isCashFlowDeletedAll"],
];

// argumen yang diteruskan ke fungsi API (statistik dikirim sebagai { total_data })
const expectedArgs: Record<string, any[]> = {
  fetchStatsDaily: [{ total_data: 7 }],
  fetchStatsMonthly: [{ total_data: 6 }],
};

describe("cashFlowsStore", () => {
  beforeEach(() => {
    createMockPinia();
  });

  it("state awal", () => {
    const store = useCashFlowsStore();
    expect(store.cashFlows).toEqual([]);
    expect(store.cashFlow).toBeNull();
    expect(store.stats).toEqual({});
    expect(store.labels).toEqual([]);
    expect(store.isCashFlow).toBe(false);
  });

  it.each(cases)("%s sukses: flag, pesan, dan argumen API", async (action, args, apiName, loading, done) => {
    api[apiName].mockResolvedValue(response);
    const store: any = useCashFlowsStore();
    const pending = store[action](...args);
    expect(store[loading]).toBe(true);
    expect(await pending).toBe(true);
    expect(api[apiName]).toHaveBeenCalledWith(...(expectedArgs[action] ?? args));
    expect(store[loading]).toBe(false);
    expect(store[done]).toBe(true);
    expect(store.message).toBe("ok");
    expect(store.error).toBe("");
  });

  it.each(cases)("%s gagal: menyimpan pesan error", async (action, args, apiName, loading, done) => {
    api[apiName].mockRejectedValue(new Error("gagal"));
    const store: any = useCashFlowsStore();
    expect(await store[action](...args)).toBe(false);
    expect(store.error).toBe("gagal");
    expect(store[loading]).toBe(false);
    expect(store[done]).toBe(false);
  });

  it("fetchCashFlows mengisi daftar dan statistik", async () => {
    api.getCashFlows.mockResolvedValue(response);
    const store = useCashFlowsStore();
    await store.fetchCashFlows({});
    expect(store.cashFlows).toEqual([{ id: 1 }]);
    expect(store.stats).toEqual({ cashflow: 100 });
  });

  it("fetchCashFlows memakai objek kosong jika statistik tidak dikirim", async () => {
    api.getCashFlows.mockResolvedValue({ message: "ok", data: { cash_flows: [] } });
    const store = useCashFlowsStore();
    await store.fetchCashFlows();
    expect(store.stats).toEqual({});
  });

  it("fetchCashFlow, fetchLabels, dan statistik mengisi state masing-masing", async () => {
    api.getCashFlow.mockResolvedValue(response);
    api.getLabels.mockResolvedValue(response);
    api.getStatsDaily.mockResolvedValue(response);
    api.getStatsMonthly.mockResolvedValue(response);
    const store = useCashFlowsStore();
    await store.fetchCashFlow(2);
    await store.fetchLabels();
    await store.fetchStatsDaily(7);
    await store.fetchStatsMonthly(6);
    expect(store.cashFlow).toEqual({ id: 2 });
    expect(store.labels).toEqual(["gaji"]);
    expect(store.statsDaily).toEqual({ "05-10-2024": 100 });
    expect(store.statsMonthly).toEqual({ "05-10-2024": 100 });
  });
});
