import { defineStore } from "pinia";
import { runTask } from "../../../helpers/storeHelper";
import {
  deleteAllCashFlows,
  deleteCashFlow,
  getCashFlow,
  getCashFlows,
  getLabels,
  getStatsDaily,
  getStatsMonthly,
  postCashFlow,
  putCashFlow,
  type CashFlowPayload,
} from "../api/cashFlowApi";

export interface CashFlow {
  id: number;
  user_id: number;
  type: string; // inflow | outflow
  source: string; // cash | savings | loans
  label: string;
  description: string;
  nominal: number;
  created_at: string;
  updated_at: string;
}

// Ringkasan saldo dari API, mis. cashflow, total_inflow, total_outflow_cash, dst.
export type CashFlowStats = Record<string, number>;

export type CashFlowQueryParams = Record<string, string>;

export interface CashFlowsState {
  error: string;
  message: string;
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats;
  labels: string[];
  statsDaily: Record<string, number>;
  statsMonthly: Record<string, number>;
  isCashFlow: boolean; // sedang memuat daftar / detail
  isCashFlowLoaded: boolean;
  isLabels: boolean;
  isLabelsLoaded: boolean;
  isStatsDaily: boolean;
  isStatsDailyLoaded: boolean;
  isStatsMonthly: boolean;
  isStatsMonthlyLoaded: boolean;
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => ({
    error: "",
    message: "",
    cashFlows: [],
    cashFlow: null,
    stats: {},
    labels: [],
    statsDaily: {},
    statsMonthly: {},
    isCashFlow: false,
    isCashFlowLoaded: false,
    isLabels: false,
    isLabelsLoaded: false,
    isStatsDaily: false,
    isStatsDailyLoaded: false,
    isStatsMonthly: false,
    isStatsMonthlyLoaded: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),
  actions: {
    fetchCashFlows(query?: CashFlowQueryParams) {
      return runTask(this, "isCashFlow", "isCashFlowLoaded", async () => {
        const response = await getCashFlows(query);
        this.cashFlows = response.data.cash_flows;
        this.stats = response.data.stats ?? {};
        return response.message;
      });
    },
    fetchCashFlow(id: number | string) {
      return runTask(this, "isCashFlow", "isCashFlowLoaded", async () => {
        const response = await getCashFlow(id);
        this.cashFlow = response.data.cash_flow;
        return response.message;
      });
    },
    fetchLabels() {
      return runTask(this, "isLabels", "isLabelsLoaded", async () => {
        const response = await getLabels();
        this.labels = response.data.labels;
        return response.message;
      });
    },
    fetchStatsDaily(totalData: number) {
      return runTask(this, "isStatsDaily", "isStatsDailyLoaded", async () => {
        const response = await getStatsDaily({ total_data: totalData });
        this.statsDaily = response.data.stats_cashflow;
        return response.message;
      });
    },
    fetchStatsMonthly(totalData: number) {
      return runTask(this, "isStatsMonthly", "isStatsMonthlyLoaded", async () => {
        const response = await getStatsMonthly({ total_data: totalData });
        this.statsMonthly = response.data.stats_cashflow;
        return response.message;
      });
    },
    addCashFlow(payload: CashFlowPayload) {
      return runTask(this, "isCashFlowAdd", "isCashFlowAdded", async () => (await postCashFlow(payload)).message);
    },
    changeCashFlow(id: number | string, payload: CashFlowPayload) {
      return runTask(this, "isCashFlowChange", "isCashFlowChanged", async () => (await putCashFlow(id, payload)).message);
    },
    removeCashFlow(id: number | string) {
      return runTask(this, "isCashFlowDelete", "isCashFlowDeleted", async () => (await deleteCashFlow(id)).message);
    },
    removeAllCashFlows() {
      return runTask(
        this,
        "isCashFlowDeleteAll",
        "isCashFlowDeletedAll",
        async () => (await deleteAllCashFlows()).message,
      );
    },
  },
});
