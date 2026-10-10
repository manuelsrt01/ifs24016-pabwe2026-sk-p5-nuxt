// SweetAlert2 dimuat saat dialog pertama kali dibutuhkan agar JavaScript awal lebih kecil
const loadSwal = async () => (await import("sweetalert2")).default;

const COLOR = "#047857";

const fire = async (icon: "success" | "error" | "warning", title: string, text: string) => {
  const Swal = await loadSwal();
  return Swal.fire({ icon, title, text, confirmButtonColor: COLOR });
};

export const showSuccessDialog = (text: string) => fire("success", "Berhasil", text);
export const showErrorDialog = (text: string) => fire("error", "Gagal", text);
export const showWarningDialog = (text: string) => fire("warning", "Perhatian", text);

export async function showConfirmDialog(title: string, text: string): Promise<boolean> {
  const Swal = await loadSwal();
  const result = await Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
    confirmButtonColor: COLOR,
  });
  return result.isConfirmed;
}

export const formatRupiah = (value: number | string): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));

// Menerima ISO ("2024-10-05T12:09:16.000000Z") maupun "2024-10-05 22:00:00"
export function formatDate(value: unknown): string {
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export const isValidEmail = (value: string): boolean => /^\S+@\S+\.\S+$/.test(value);

export const typeLabel = (type: string): string => (type === "inflow" ? "Pemasukan" : "Pengeluaran");

const SOURCE_LABELS: Record<string, string> = {
  cash: "Tunai",
  savings: "Tabungan",
  loans: "Pinjaman",
};

export const sourceLabel = (source: string): string => SOURCE_LABELS[source];

// Kunci statistik yang belum ada (belum ada transaksi) dianggap 0
export const getStat = (stats: Record<string, number>, key: string): number => stats[key] ?? 0;

export function validateCashFlowForm(form: {
  label: string;
  nominal: string | number;
  description: string;
}): string {
  if (!form.label.trim()) return "Label wajib diisi.";
  if (!(Number(form.nominal) > 0)) return "Nominal harus lebih besar dari 0.";
  if (!form.description.trim()) return "Keterangan wajib diisi.";
  return "";
}

// Foto profil dari /users/me berupa path relatif ("img/profile/3.png")
export function resolveAsset(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${new URL(DELCOM_BASEURL).origin}/${path.replace(/^\//, "")}`;
}

interface MessageSource {
  message: string;
  error: string;
}

export async function runWithDialog(
  action: () => Promise<boolean>,
  source: MessageSource,
  onSuccess: () => unknown,
): Promise<boolean> {
  if (await action()) {
    await showSuccessDialog(source.message);
    await onSuccess();
    return true;
  }
  await showErrorDialog(source.error);
  return false;
}

export async function confirmAndRun(
  title: string,
  text: string,
  action: () => Promise<boolean>,
  source: MessageSource,
  onSuccess: () => unknown,
): Promise<boolean> {
  if (!(await showConfirmDialog(title, text))) return false;
  return runWithDialog(action, source, onSuccess);
}
