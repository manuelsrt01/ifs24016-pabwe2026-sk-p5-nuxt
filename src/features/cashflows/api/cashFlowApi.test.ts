import { beforeEach, describe, expect, it, vi } from "vitest";
import * as apiModule from "../../../helpers/apiHelper";
import {
  buildCashFlowQuery,
  deleteAllCashFlows,
  deleteCashFlow,
  getCashFlow,
  getCashFlows,
  getLabels,
  getStatsDaily,
  getStatsMonthly,
  postCashFlow,
  putCashFlow,
} from "./cashFlowApi";

vi.mock("../../../helpers/apiHelper", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

const api = apiModule as any;
const empty = { type: "", source: "", label: "", startDate: "", endDate: "" };
const payload = { type: "inflow", source: "cash", label: "gaji", description: "Gaji", nominal: 1000 };

describe("buildCashFlowQuery", () => {
  it("filter kosong menghasilkan query kosong", () => {
    expect(buildCashFlowQuery(empty)).toEqual({});
  });

  it("semua filter terisi, tanggal diberi jam awal/akhir hari", () => {
    expect(
      buildCashFlowQuery({
        type: "outflow",
        source: "savings",
        label: "alat-mandi",
        startDate: "2024-10-01",
        endDate: "2024-10-31",
      }),
    ).toEqual({
      type: "outflow",
      source: "savings",
      label: "alat-mandi",
      start_date: "2024-10-01 00:00:00",
      end_date: "2024-10-31 23:59:59",
    });
  });

  it("hanya memasukkan filter yang terisi", () => {
    expect(buildCashFlowQuery({ ...empty, type: "inflow" })).toEqual({ type: "inflow" });
    expect(buildCashFlowQuery({ ...empty, endDate: "2024-10-31" })).toEqual({ end_date: "2024-10-31 23:59:59" });
  });
});

describe("cashFlowApi", () => {
  beforeEach(() => {
    api.apiGet.mockResolvedValue("get");
    api.apiPost.mockResolvedValue("post");
    api.apiPut.mockResolvedValue("put");
    api.apiDelete.mockResolvedValue("delete");
  });

  it("getCashFlows meneruskan query", async () => {
    expect(await getCashFlows({ type: "inflow" })).toBe("get");
    expect(api.apiGet).toHaveBeenCalledWith("/cash-flows", { type: "inflow" });
  });

  it("getCashFlow -> GET /cash-flows/:id", async () => {
    await getCashFlow(5);
    expect(api.apiGet).toHaveBeenCalledWith("/cash-flows/5");
  });

  it("postCashFlow -> POST /cash-flows", async () => {
    expect(await postCashFlow(payload)).toBe("post");
    expect(api.apiPost).toHaveBeenCalledWith("/cash-flows", payload);
  });

  it("putCashFlow -> PUT /cash-flows/:id", async () => {
    await putCashFlow(5, payload);
    expect(api.apiPut).toHaveBeenCalledWith("/cash-flows/5", payload);
  });

  it("deleteCashFlow -> DELETE /cash-flows/:id", async () => {
    expect(await deleteCashFlow(5)).toBe("delete");
    expect(api.apiDelete).toHaveBeenCalledWith("/cash-flows/5");
  });

  it("getLabels -> GET /cash-flows/labels", async () => {
    await getLabels();
    expect(api.apiGet).toHaveBeenCalledWith("/cash-flows/labels");
  });

  it("getStatsDaily dan getStatsMonthly meneruskan total_data", async () => {
    await getStatsDaily({ total_data: 7 });
    await getStatsMonthly({ total_data: 6 });
    expect(api.apiGet).toHaveBeenCalledWith("/cash-flows/stats/daily", { total_data: 7 });
    expect(api.apiGet).toHaveBeenCalledWith("/cash-flows/stats/monthly", { total_data: 6 });
  });

  it("deleteAllCashFlows -> DELETE /cash-flows", async () => {
    await deleteAllCashFlows();
    expect(api.apiDelete).toHaveBeenCalledWith("/cash-flows");
  });
});
