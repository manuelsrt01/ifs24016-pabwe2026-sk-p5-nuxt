import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import DetailPage from "./DetailPage.vue";

const fire = Swal.fire as any;

vi.mock("../modals/ChangeModal.vue", async () => {
  const { createStub } = await import("../../../test-utils");
  return { default: createStub("ChangeModal", ["cashFlow"]) };
});

const outflow = {
  id: 4, user_id: 1, type: "outflow", source: "savings", label: "alat-elektronik",
  description: "Membeli keyboard dan mouse", nominal: 400000,
  created_at: "2024-10-05T12:09:16.000000Z", updated_at: "2024-10-06T08:00:00.000000Z",
};
const inflow = { ...outflow, id: 5, type: "inflow", source: "cash", label: "gaji" };

async function setup({ cashFlow = outflow, ok = true }: { cashFlow?: any; ok?: boolean } = {}) {
  const pinia = createMockPinia();
  const store = useCashFlowsStore(pinia);
  const fetchCashFlow = vi.spyOn(store, "fetchCashFlow").mockImplementation(async () => {
    if (ok) store.cashFlow = cashFlow;
    else store.error = "Tidak ditemukan";
    return ok;
  });
  vi.spyOn(store, "removeCashFlow").mockImplementation(async () => {
    store.message = "Dihapus";
    return true;
  });
  const result = await renderWithProviders(DetailPage, {
    pinia,
    route: "/cash-flows/4",
    routes: [
      { path: "/cash-flows/:cashFlowId", component: DetailPage },
      { path: "/", component: { render: () => null } },
    ],
  });
  await flushPromises();
  vi.spyOn(result.router, "push");
  return { ...result, store, fetchCashFlow };
}

describe("DetailPage", () => {
  it("memuat detail berdasarkan parameter rute dan menampilkan rincian lengkap", async () => {
    const { wrapper, fetchCashFlow } = await setup();
    expect(fetchCashFlow).toHaveBeenCalledWith("4");
    expect(wrapper.find("h1").text()).toBe("Detail Transaksi");
    expect(wrapper.get('[data-testid="label"]').text()).toBe("alat-elektronik");
    expect(wrapper.get('[data-testid="source"]').text()).toBe("Tabungan");
    expect(wrapper.get('[data-testid="nominal"]').text()).toMatch(/Rp\s?400\.000/);
    expect(wrapper.get('[data-testid="description"]').text()).toBe("Membeli keyboard dan mouse");
    expect(wrapper.get('[data-testid="created-at"]').text()).toContain("2024");
    expect(wrapper.get('[data-testid="updated-at"]').text()).toContain("2024");
  });

  it("badge pengeluaran berwarna merah dan pemasukan berwarna hijau", async () => {
    const out = await setup();
    expect(out.wrapper.get('[data-testid="type-badge"]').text()).toBe("Pengeluaran");
    expect(out.wrapper.get('[data-testid="type-badge"]').classes()).toContain("bg-rose-50");

    const inn = await setup({ cashFlow: inflow });
    expect(inn.wrapper.get('[data-testid="type-badge"]').text()).toBe("Pemasukan");
    expect(inn.wrapper.get('[data-testid="type-badge"]').classes()).toContain("bg-emerald-50");
  });

  it("menampilkan loading", async () => {
    const { wrapper, store } = await setup();
    store.isCashFlow = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true);
  });

  it("menampilkan pesan tidak ditemukan dan dialog error jika gagal memuat", async () => {
    const { wrapper } = await setup({ ok: false });
    expect(wrapper.find('[data-testid="not-found"]').exists()).toBe(true);
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Tidak ditemukan" }));
  });

  it("hapus transaksi: konfirmasi lalu kembali ke ringkasan", async () => {
    const { wrapper, store, router } = await setup();
    await wrapper.get('[data-testid="delete-button"]').trigger("click");
    await flushPromises();
    expect(store.removeCashFlow).toHaveBeenCalledWith("4");
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("hapus transaksi dibatalkan", async () => {
    const { wrapper, store } = await setup();
    fire.mockResolvedValueOnce({ isConfirmed: false });
    await wrapper.get('[data-testid="delete-button"]').trigger("click");
    await flushPromises();
    expect(store.removeCashFlow).not.toHaveBeenCalled();
  });

  it("modal ubah: buka, tutup, lalu sukses memuat ulang detail", async () => {
    const { wrapper, fetchCashFlow } = await setup();
    await wrapper.get('[data-testid="edit-button"]').trigger("click");
    await wrapper.get('[data-testid="ChangeModal-close"]').trigger("click");
    expect(wrapper.find('[data-testid="ChangeModal"]').exists()).toBe(false);

    await wrapper.get('[data-testid="edit-button"]').trigger("click");
    await wrapper.get('[data-testid="ChangeModal-success"]').trigger("click");
    await flushPromises();
    expect(wrapper.find('[data-testid="ChangeModal"]').exists()).toBe(false);
    expect(fetchCashFlow).toHaveBeenCalledTimes(2);
  });
});
