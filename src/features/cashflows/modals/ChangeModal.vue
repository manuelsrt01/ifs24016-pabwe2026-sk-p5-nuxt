<script setup lang="ts">
import type { PropType } from "vue";
import { X } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { runWithDialog, showWarningDialog, validateCashFlowForm } from "../../../helpers/toolsHelper";
import { useCashFlowsStore, type CashFlow } from "../states/cashFlowsStore";

const props = defineProps({
  cashFlow: { type: Object as PropType<CashFlow>, required: true },
});
const emit = defineEmits<{ (e: "close"): void; (e: "success"): void }>();

const store = useCashFlowsStore();
const { value: type, onChange: onType } = useInput(props.cashFlow.type);
const { value: source, onChange: onSource } = useInput(props.cashFlow.source);
const { value: label, onChange: onLabel } = useInput(props.cashFlow.label);
const { value: nominal, onChange: onNominal } = useInput(String(props.cashFlow.nominal));
const { value: description, onChange: onDescription } = useInput(props.cashFlow.description);

async function submit() {
  const message = validateCashFlowForm({
    label: label.value,
    nominal: nominal.value,
    description: description.value,
  });
  if (message) {
    await showWarningDialog(message);
    return;
  }
  await runWithDialog(
    () =>
      store.changeCashFlow(props.cashFlow.id, {
        type: type.value,
        source: source.value,
        label: label.value.trim(),
        description: description.value.trim(),
        nominal: Number(nominal.value),
      }),
    store,
    () => emit("success"),
  );
}
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" data-testid="change-modal">
    <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-extrabold">Ubah Transaksi</h2>
        <button type="button" aria-label="Tutup" class="rounded-lg p-1 hover:bg-slate-100" data-testid="modal-close" @click="emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>
      <form class="space-y-4" novalidate data-testid="change-form" @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="change-type" class="text-xs font-bold uppercase text-slate-600">Jenis</label>
            <select id="change-type" :value="type" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" @change="onType">
              <option value="inflow">Pemasukan (Inflow)</option>
              <option value="outflow">Pengeluaran (Outflow)</option>
            </select>
          </div>
          <div>
            <label for="change-source" class="text-xs font-bold uppercase text-slate-600">Sumber Dana</label>
            <select id="change-source" :value="source" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" @change="onSource">
              <option value="cash">Tunai</option>
              <option value="savings">Tabungan</option>
              <option value="loans">Pinjaman</option>
            </select>
          </div>
        </div>
        <div>
          <label for="change-label" class="text-xs font-bold uppercase text-slate-600">Label Kategori</label>
          <input id="change-label" type="text" :value="label" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" @input="onLabel" />
        </div>
        <div>
          <label for="change-nominal" class="text-xs font-bold uppercase text-slate-600">Nominal (Rp)</label>
          <input id="change-nominal" type="number" min="1" :value="nominal" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" @input="onNominal" />
        </div>
        <div>
          <label for="change-description" class="text-xs font-bold uppercase text-slate-600">Keterangan</label>
          <textarea id="change-description" rows="3" :value="description" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" @input="onDescription"></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-100" @click="emit('close')">Batal</button>
          <button type="submit" :disabled="store.isCashFlowChange" class="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
