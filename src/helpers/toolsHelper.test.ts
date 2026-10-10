import { describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import {
  confirmAndRun,
  formatDate,
  formatRupiah,
  getStat,
  isValidEmail,
  resolveAsset,
  runWithDialog,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
  sourceLabel,
  typeLabel,
  validateCashFlowForm,
} from "./toolsHelper";

const fire = Swal.fire as any;

describe("dialog SweetAlert2", () => {
  it("showSuccessDialog / showErrorDialog / showWarningDialog", async () => {
    await showSuccessDialog("ok");
    await showErrorDialog("gagal");
    await showWarningDialog("hati-hati");
    expect(fire).toHaveBeenNthCalledWith(1, expect.objectContaining({ icon: "success", text: "ok" }));
    expect(fire).toHaveBeenNthCalledWith(2, expect.objectContaining({ icon: "error", text: "gagal" }));
    expect(fire).toHaveBeenNthCalledWith(3, expect.objectContaining({ icon: "warning", text: "hati-hati" }));
  });

  it("showConfirmDialog mengembalikan isConfirmed", async () => {
    expect(await showConfirmDialog("Judul", "Teks")).toBe(true);
    expect(fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "question", title: "Judul", showCancelButton: true }),
    );
    fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("Judul", "Teks")).toBe(false);
  });
});

describe("format & util", () => {
  it("formatRupiah", () => {
    expect(formatRupiah(10000)).toMatch(/^Rp\s?10\.000$/);
    expect(formatRupiah("2500000")).toMatch(/^Rp\s?2\.500\.000$/);
  });

  it("formatDate valid dan tidak valid", () => {
    expect(formatDate("2024-10-05T12:09:16.000000Z")).toContain("2024");
    expect(formatDate("2024-10-05 22:00:00")).toContain("2024");
    expect(formatDate(undefined)).toBe("-");
  });

  it("isValidEmail", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("abc")).toBe(false);
  });

  it("typeLabel dan sourceLabel", () => {
    expect(typeLabel("inflow")).toBe("Pemasukan");
    expect(typeLabel("outflow")).toBe("Pengeluaran");
    expect(sourceLabel("cash")).toBe("Tunai");
    expect(sourceLabel("savings")).toBe("Tabungan");
    expect(sourceLabel("loans")).toBe("Pinjaman");
  });

  it("getStat memakai 0 untuk kunci yang belum ada", () => {
    expect(getStat({ total_inflow: 500 }, "total_inflow")).toBe(500);
    expect(getStat({ total_inflow: 500 }, "total_outflow")).toBe(0);
  });

  it("resolveAsset", () => {
    expect(resolveAsset("")).toBe("");
    expect(resolveAsset(null)).toBe("");
    expect(resolveAsset("http://x.test/a.png")).toBe("http://x.test/a.png");
    expect(resolveAsset("img/profile/1.png")).toBe("https://open-api.delcom.org/img/profile/1.png");
    expect(resolveAsset("/img/profile/1.png")).toBe("https://open-api.delcom.org/img/profile/1.png");
  });
});

describe("validateCashFlowForm", () => {
  const valid = { label: "gaji", nominal: "1000", description: "Gaji bulanan" };

  it("mengembalikan pesan untuk tiap kesalahan", () => {
    expect(validateCashFlowForm({ ...valid, label: " " })).toBe("Label wajib diisi.");
    expect(validateCashFlowForm({ ...valid, nominal: "0" })).toBe("Nominal harus lebih besar dari 0.");
    expect(validateCashFlowForm({ ...valid, nominal: "" })).toBe("Nominal harus lebih besar dari 0.");
    expect(validateCashFlowForm({ ...valid, description: "" })).toBe("Keterangan wajib diisi.");
  });

  it("mengembalikan string kosong jika valid", () => {
    expect(validateCashFlowForm(valid)).toBe("");
  });
});

describe("runWithDialog & confirmAndRun", () => {
  it("sukses: tampil dialog sukses lalu onSuccess", async () => {
    const onSuccess = vi.fn();
    const result = await runWithDialog(async () => true, { message: "Berhasil!", error: "" }, onSuccess);
    expect(result).toBe(true);
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Berhasil!" }));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("gagal: tampil dialog error tanpa onSuccess", async () => {
    const onSuccess = vi.fn();
    const result = await runWithDialog(async () => false, { message: "", error: "Ups" }, onSuccess);
    expect(result).toBe(false);
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Ups" }));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("confirmAndRun dibatalkan user", async () => {
    fire.mockResolvedValueOnce({ isConfirmed: false });
    const action = vi.fn();
    expect(await confirmAndRun("T", "x", action, { message: "", error: "" }, vi.fn())).toBe(false);
    expect(action).not.toHaveBeenCalled();
  });

  it("confirmAndRun dikonfirmasi lalu menjalankan action", async () => {
    const action = vi.fn().mockResolvedValue(true);
    expect(await confirmAndRun("T", "x", action, { message: "m", error: "" }, vi.fn())).toBe(true);
    expect(action).toHaveBeenCalledOnce();
  });
});
