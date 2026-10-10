import { apiDelete, apiGet, apiPost, apiPut } from "../../../helpers/apiHelper";

export interface CashFlowPayload {
  type: string;
  source: string;
  label: string;
  description: string;
  nominal: number;
}

export interface CashFlowFilters {
  type: string;
  source: string;
  label: string;
  startDate: string;
  endDate: string;
}

// Hanya filter yang terisi yang dikirim ke API
export function buildCashFlowQuery(filters: CashFlowFilters): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.type) query.type = filters.type;
  if (filters.source) query.source = filters.source;
  if (filters.label) query.label = filters.label;
  if (filters.startDate) query.start_date = `${filters.startDate} 00:00:00`;
  if (filters.endDate) query.end_date = `${filters.endDate} 23:59:59`;
  return query;
}

export const getCashFlows = (query?: Record<string, string>) => apiGet("/cash-flows", query);

export const getCashFlow = (id: number | string) => apiGet(`/cash-flows/${id}`);

export const postCashFlow = (payload: CashFlowPayload) => apiPost("/cash-flows", payload);

export const putCashFlow = (id: number | string, payload: CashFlowPayload) =>
  apiPut(`/cash-flows/${id}`, payload);

export const deleteCashFlow = (id: number | string) => apiDelete(`/cash-flows/${id}`);

export const getLabels = () => apiGet("/cash-flows/labels");

export const getStatsDaily = (query?: Record<string, number>) => apiGet("/cash-flows/stats/daily", query);

export const getStatsMonthly = (query?: Record<string, number>) => apiGet("/cash-flows/stats/monthly", query);

export const deleteAllCashFlows = () => apiDelete("/cash-flows");
