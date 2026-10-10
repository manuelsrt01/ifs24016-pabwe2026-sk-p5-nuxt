import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import ChangeModal from "./ChangeModal.vue";

const fire = Swal.fire as any;

const cashFlow = {
  id: 7,
  user_id: 1,
  type: "outflow",
  source: "cash",
  label: "alat-mandi",
  description: "Sabun dan odol",
  nominal: 100000,
  created_at: "2024-10-05T11:28:02.000000Z",
  updated_at: "2024-10-05T11:28:02.000000Z",
};

async function setup(ok = true) {
  const pinia = createMockPinia();
  const store = useCashFlowsStore(pinia);
  const changeCashFlow = vi.spyOn(store, "changeCashFlow").mockImplementation(async () => {
    if (ok) store.message = "Transaksi diubah";
    else store.error = "Gagal mengubah";
    return ok;
  });
  const result = await renderWithProviders(ChangeModal, { pinia, props: { cashFlow } });
  return { ...result, store, changeCashFlow };
}

describe("ChangeModal", () => {
  it("mengisi form dari data transaksi", async () => {
    const { wrapper } = await setup();
    expect(wrapper.find("#change-type").element.value).toBe("outflow");
    expect(wrapper.find("#change-source").element.value).toBe("cash");
    expect(wrapper.find("#change-label").element.value).toBe("alat-mandi");
    expect(wrapper.find("#change-nominal").element.value).toBe("100000");
    expect(wrapper.find("#change-description").element.value).toBe("Sabun dan odol");
  });

  it("tombol X dan Batal mengirim close", async () => {
    const { wrapper } = await setup();
    await wrapper.get('[data-testid="modal-close"]').trigger("click");
    await wrapper.findAll("button").find((b: any) => b.text() === "Batal").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });

  it("validasi: label kosong", async () => {
    const { wrapper, changeCashFlow } = await setup();
    await wrapper.find("#change-label").setValue("");
    await wrapper.get('[data-testid="change-form"]').trigger("submit");
    await flushPromises();
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning", text: "Label wajib diisi." }));
    expect(changeCashFlow).not.toHaveBeenCalled();
  });

  it("submit sukses mengirim payload dan emit success", async () => {
    const { wrapper, changeCashFlow } = await setup(true);
    await wrapper.find("#change-type").setValue("inflow");
    await wrapper.find("#change-source").setValue("loans");
    await wrapper.find("#change-label").setValue("gaji");
    await wrapper.find("#change-nominal").setValue("2500000");
    await wrapper.find("#change-description").setValue("Gaji bulanan");
    await wrapper.get('[data-testid="change-form"]').trigger("submit");
    await flushPromises();
    expect(changeCashFlow).toHaveBeenCalledWith(7, {
      type: "inflow",
      source: "loans",
      label: "gaji",
      description: "Gaji bulanan",
      nominal: 2500000,
    });
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Transaksi diubah" }));
    expect(wrapper.emitted("success")).toHaveLength(1);
  });

  it("submit gagal menampilkan dialog error", async () => {
    const { wrapper } = await setup(false);
    await wrapper.get('[data-testid="change-form"]').trigger("submit");
    await flushPromises();
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal mengubah" }));
    expect(wrapper.emitted("success")).toBeUndefined();
  });
});
