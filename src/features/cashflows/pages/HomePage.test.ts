import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import HomePage from "./HomePage.vue";

const fire = Swal.fire as any;

vi.mock("../modals/AddModal.vue", async () => {
  const { createStub } = await import("../../../test-utils");
  return { default: createStub("AddModal") };
});
vi.mock("../modals/ChangeModal.vue", async () => {
  const { createStub } = await import("../../../test-utils");
  return { default: createStub("ChangeModal", ["cashFlow"]) };
});

const inflow = {
  id: 1, user_id: 1, type: "inflow", source: "cash", label: "gaji", description: "Gaji bulanan",
  nominal: 2500000, created_at: "2024-10-05T11:26:45.000000Z", updated_at: "2024-10-05T11:26:48.000000Z",
};
const outflow = {
  id: 2, user_id: 1, type: "outflow", source: "savings", label: "alat-elektronik", description: "Keyboard",
  nominal: 400000, created_at: "2024-10-05T12:09:16.000000Z", updated_at: "2024-10-05T12:09:16.000000Z",
};
const stats = {
  cashflow: 2000000,
  total_inflow: 2500000,
  total_outflow: 500000,
  total_inflow_cash: 2500000,
  total_outflow_cash: 100000,
  total_outflow_savings: 400000,
};

async function setup({
  ok = true,
  list = [inflow, outflow],
  withStats = true,
}: { ok?: boolean; list?: any[]; withStats?: boolean } = {}) {
  const pinia = createMockPinia();
  const store = useCashFlowsStore(pinia);
  const fetchCashFlows = vi.spyOn(store, "fetchCashFlows").mockImplementation(async () => {
    if (!ok) {
      store.error = "Gagal memuat transaksi";
      return false;
    }
    store.cashFlows = list;
    store.stats = stats;
    return true;
  });
  vi.spyOn(store, "fetchLabels").mockImplementation(async () => {
    store.labels = ["gaji", "alat-elektronik"];
    return true;
  });
  vi.spyOn(store, "fetchStatsDaily").mockImplementation(async () => {
    if (withStats) store.statsDaily = { "05-10-2024": 2000000 };
    return true;
  });
  vi.spyOn(store, "fetchStatsMonthly").mockImplementation(async () => {
    if (withStats) store.statsMonthly = { "10-2024": 2000000 };
    return true;
  });
  vi.spyOn(store, "removeCashFlow").mockImplementation(async () => {
    store.message = "Dihapus";
    return true;
  });
  vi.spyOn(store, "removeAllCashFlows").mockImplementation(async () => {
    store.message = "Semua dihapus";
    return true;
  });
  const result = await renderWithProviders(HomePage, { pinia, routes: [{ path: "/", component: HomePage }] });
  await flushPromises();
  return { ...result, store, fetchCashFlows };
}

describe("HomePage", () => {
  it("memuat data saat dibuka dan menampilkan kartu metrik", async () => {
    const { wrapper, store, fetchCashFlows } = await setup();
    expect(fetchCashFlows).toHaveBeenCalledWith({});
    expect(store.fetchLabels).toHaveBeenCalledOnce();
    expect(store.fetchStatsDaily).toHaveBeenCalledWith(7);
    expect(store.fetchStatsMonthly).toHaveBeenCalledWith(6);
    expect(wrapper.find("h1").text()).toBe("Ringkasan Arus Kas");
    expect(wrapper.get('[data-testid="metric-net"]').text()).toMatch(/Rp\s?2\.000\.000/);
    expect(wrapper.get('[data-testid="metric-inflow"]').text()).toMatch(/Rp\s?2\.500\.000/);
    expect(wrapper.get('[data-testid="metric-outflow"]').text()).toMatch(/Rp\s?500\.000/);
    expect(wrapper.get('[data-testid="metric-cash"]').text()).toMatch(/Rp\s?2\.400\.000/);
    expect(wrapper.get('[data-testid="metric-savings"]').text()).toMatch(/-\s?Rp\s?400\.000/);
    expect(wrapper.get('[data-testid="metric-loans"]').text()).toMatch(/Rp\s?0/);
  });

  it("menampilkan tabel dan kartu transaksi dengan badge jenis", async () => {
    const { wrapper } = await setup();
    const row = wrapper.get('[data-testid="row-1"]');
    expect(row.text()).toContain("Pemasukan");
    expect(row.text()).toContain("gaji");
    expect(row.text()).toContain("Tunai");
    expect(row.find("span").classes()).toContain("bg-emerald-50");
    expect(wrapper.get('[data-testid="row-2"]').text()).toContain("Pengeluaran");
    expect(wrapper.get('[data-testid="row-2"]').find("span").classes()).toContain("bg-rose-50");
    expect(wrapper.get('[data-testid="card-1"]').text()).toContain("Pemasukan");
    expect(wrapper.get('[data-testid="card-2"]').text()).toContain("Tabungan");
    expect(wrapper.get('[data-testid="detail-1"]').attributes("href")).toBe("/cash-flows/1");
    expect(wrapper.get('[data-testid="card-detail-2"]').attributes("href")).toBe("/cash-flows/2");
  });

  it("menampilkan statistik harian dan bulanan", async () => {
    const { wrapper } = await setup();
    expect(wrapper.get('[data-testid="daily-list"]').text()).toContain("05-10-2024");
    expect(wrapper.get('[data-testid="monthly-list"]').text()).toContain("10-2024");
    expect(wrapper.find('[data-testid="daily-empty"]').exists()).toBe(false);
  });

  it("menampilkan keadaan kosong untuk transaksi dan statistik", async () => {
    const { wrapper } = await setup({ list: [], withStats: false });
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="daily-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="monthly-empty"]').exists()).toBe(true);
  });

  it("menampilkan loading", async () => {
    const { wrapper, store } = await setup();
    store.isCashFlow = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true);
  });

  it("menampilkan dialog error jika gagal memuat", async () => {
    await setup({ ok: false });
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal memuat transaksi" }));
  });

  it("filter jenis, sumber, label, dan tanggal memuat ulang dengan query yang benar", async () => {
    const { wrapper, fetchCashFlows } = await setup();
    await wrapper.find("#filter-type").setValue("outflow");
    await flushPromises();
    expect(fetchCashFlows).toHaveBeenLastCalledWith({ type: "outflow" });
    await wrapper.find("#filter-source").setValue("savings");
    await flushPromises();
    expect(fetchCashFlows).toHaveBeenLastCalledWith({ type: "outflow", source: "savings" });
    await wrapper.find("#filter-label").setValue("alat-elektronik");
    await flushPromises();
    expect(fetchCashFlows).toHaveBeenLastCalledWith({
      type: "outflow",
      source: "savings",
      label: "alat-elektronik",
    });
    await wrapper.find("#filter-start").setValue("2024-10-01");
    await wrapper.find("#filter-end").setValue("2024-10-31");
    await flushPromises();
    expect(fetchCashFlows).toHaveBeenLastCalledWith({
      type: "outflow",
      source: "savings",
      label: "alat-elektronik",
      start_date: "2024-10-01 00:00:00",
      end_date: "2024-10-31 23:59:59",
    });
  });

  it("reset filter mengembalikan query kosong", async () => {
    const { wrapper, fetchCashFlows } = await setup();
    await wrapper.find("#filter-type").setValue("inflow");
    await flushPromises();
    await wrapper.get('[data-testid="reset-filter"]').trigger("click");
    await flushPromises();
    expect(fetchCashFlows).toHaveBeenLastCalledWith({});
    expect(wrapper.find("#filter-type").element.value).toBe("");
  });

  it("hapus transaksi dari tabel dan dari kartu: dikonfirmasi lalu memuat ulang", async () => {
    const { wrapper, store, fetchCashFlows } = await setup();
    await wrapper.get('[data-testid="delete-1"]').trigger("click");
    await flushPromises();
    expect(store.removeCashFlow).toHaveBeenLastCalledWith(1);
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Dihapus" }));
    expect(fetchCashFlows).toHaveBeenCalledTimes(2);

    await wrapper.get('[data-testid="card-delete-2"]').trigger("click");
    await flushPromises();
    expect(store.removeCashFlow).toHaveBeenLastCalledWith(2);
    expect(fetchCashFlows).toHaveBeenCalledTimes(3);
  });

  it("hapus transaksi dibatalkan", async () => {
    const { wrapper, store } = await setup();
    fire.mockResolvedValueOnce({ isConfirmed: false });
    await wrapper.get('[data-testid="delete-1"]').trigger("click");
    await flushPromises();
    expect(store.removeCashFlow).not.toHaveBeenCalled();
  });

  it("reset semua transaksi dengan konfirmasi dialog", async () => {
    const { wrapper, store, fetchCashFlows } = await setup();
    await wrapper.get('[data-testid="reset-all-button"]').trigger("click");
    await flushPromises();
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ title: "Reset semua transaksi?" }));
    expect(store.removeAllCashFlows).toHaveBeenCalledOnce();
    expect(fetchCashFlows).toHaveBeenCalledTimes(2);
  });

  it("modal tambah: buka, tutup, lalu sukses memuat ulang", async () => {
    const { wrapper, fetchCashFlows } = await setup();
    expect(wrapper.find('[data-testid="AddModal"]').exists()).toBe(false);
    await wrapper.get('[data-testid="add-button"]').trigger("click");
    await wrapper.get('[data-testid="AddModal-close"]').trigger("click");
    expect(wrapper.find('[data-testid="AddModal"]').exists()).toBe(false);

    await wrapper.get('[data-testid="add-button"]').trigger("click");
    await wrapper.get('[data-testid="AddModal-success"]').trigger("click");
    await flushPromises();
    expect(wrapper.find('[data-testid="AddModal"]').exists()).toBe(false);
    expect(fetchCashFlows).toHaveBeenCalledTimes(2);
  });

  it("modal ubah dari tabel dan kartu: buka, tutup, lalu sukses memuat ulang", async () => {
    const { wrapper, fetchCashFlows } = await setup();
    await wrapper.get('[data-testid="edit-1"]').trigger("click");
    expect(wrapper.find('[data-testid="ChangeModal"]').exists()).toBe(true);
    await wrapper.get('[data-testid="ChangeModal-close"]').trigger("click");
    expect(wrapper.find('[data-testid="ChangeModal"]').exists()).toBe(false);

    await wrapper.get('[data-testid="card-edit-2"]').trigger("click");
    await wrapper.get('[data-testid="ChangeModal-success"]').trigger("click");
    await flushPromises();
    expect(wrapper.find('[data-testid="ChangeModal"]').exists()).toBe(false);
    expect(fetchCashFlows).toHaveBeenCalledTimes(2);
  });
});
