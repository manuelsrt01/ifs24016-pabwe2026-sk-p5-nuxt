import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import AddModal from "./AddModal.vue";

const fire = Swal.fire as any;

async function setup(ok = true) {
  const pinia = createMockPinia();
  const store = useCashFlowsStore(pinia);
  const addCashFlow = vi.spyOn(store, "addCashFlow").mockImplementation(async () => {
    if (ok) store.message = "Transaksi dicatat";
    else store.error = "Gagal mencatat";
    return ok;
  });
  const result = await renderWithProviders(AddModal, { pinia });
  return { ...result, store, addCashFlow };
}

async function fill(
  wrapper: any,
  { label = "gaji", nominal = "2500000", description = "Gaji bulanan" }: Record<string, string> = {},
) {
  await wrapper.find("#add-type").setValue("outflow");
  await wrapper.find("#add-source").setValue("savings");
  await wrapper.find("#add-label").setValue(label);
  await wrapper.find("#add-nominal").setValue(nominal);
  await wrapper.find("#add-description").setValue(description);
  await wrapper.get('[data-testid="add-form"]').trigger("submit");
  await flushPromises();
}

describe("AddModal", () => {
  it("menampilkan form dengan nilai awal inflow dan tunai", async () => {
    const { wrapper } = await setup();
    expect(wrapper.text()).toContain("Tambah Transaksi");
    expect(wrapper.find("#add-type").element.value).toBe("inflow");
    expect(wrapper.find("#add-source").element.value).toBe("cash");
  });

  it("tombol X dan Batal mengirim close", async () => {
    const { wrapper } = await setup();
    await wrapper.get('[data-testid="modal-close"]').trigger("click");
    await wrapper.findAll("button").find((b: any) => b.text() === "Batal").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });

  it.each([
    ["label kosong", { label: " " }, "Label wajib diisi."],
    ["nominal 0", { nominal: "0" }, "Nominal harus lebih besar dari 0."],
    ["keterangan kosong", { description: "" }, "Keterangan wajib diisi."],
  ])("validasi: %s", async (_label, values, message) => {
    const { wrapper, addCashFlow } = await setup();
    await fill(wrapper, values);
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning", text: message }));
    expect(addCashFlow).not.toHaveBeenCalled();
  });

  it("submit sukses mengirim payload dan emit success", async () => {
    const { wrapper, addCashFlow } = await setup(true);
    await fill(wrapper, { label: " gaji " });
    expect(addCashFlow).toHaveBeenCalledWith({
      type: "outflow",
      source: "savings",
      label: "gaji",
      description: "Gaji bulanan",
      nominal: 2500000,
    });
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Transaksi dicatat" }));
    expect(wrapper.emitted("success")).toHaveLength(1);
  });

  it("submit gagal menampilkan dialog error tanpa emit success", async () => {
    const { wrapper } = await setup(false);
    await fill(wrapper);
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal mencatat" }));
    expect(wrapper.emitted("success")).toBeUndefined();
  });
});
