<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ArrowLeft, Pencil, Trash2 } from "lucide-vue-next";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  confirmAndRun,
  formatDate,
  formatRupiah,
  showErrorDialog,
  sourceLabel,
  typeLabel,
} from "../../../helpers/toolsHelper";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";

const route = useRoute();
const router = useRouter();
const store = useCashFlowsStore();
const showChange = ref(false);

const cashFlowId = computed(() => route.params.cashFlowId as string);
const isInflow = computed(() => store.cashFlow.type === "inflow");

async function load() {
  store.cashFlow = null;
  if (!(await store.fetchCashFlow(cashFlowId.value))) await showErrorDialog(store.error);
}

const removeThis = () =>
  confirmAndRun(
    "Hapus transaksi?",
    "Transaksi ini akan dihapus permanen.",
    () => store.removeCashFlow(cashFlowId.value),
    store,
    () => router.push("/"),
  );

async function onChanged() {
  showChange.value = false;
  await load();
}

onMounted(load);
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-extrabold">Detail Transaksi</h1>
    <RouterLink to="/" class="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800">
      <ArrowLeft class="h-4 w-4" /> Kembali ke ringkasan
    </RouterLink>

    <p v-if="store.isCashFlow" class="text-slate-600" data-testid="loading">Memuat detail transaksi...</p>

    <div v-else-if="store.cashFlow" class="max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div class="flex flex-wrap items-center gap-2">
        <span
          :class="['rounded-full px-3 py-1 text-xs font-bold', isInflow ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800']"
          data-testid="type-badge"
        >{{ typeLabel(store.cashFlow.type) }}</span>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700" data-testid="source">
          {{ sourceLabel(store.cashFlow.source) }}
        </span>
      </div>
      <h2 class="text-xl font-extrabold" data-testid="label">{{ store.cashFlow.label }}</h2>
      <p class="text-3xl font-extrabold" data-testid="nominal">{{ formatRupiah(store.cashFlow.nominal) }}</p>
      <div>
        <p class="text-xs font-bold uppercase text-slate-600">Keterangan</p>
        <p class="text-slate-800" data-testid="description">{{ store.cashFlow.description }}</p>
      </div>
      <dl class="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt class="text-xs text-slate-600">Dibuat</dt>
          <dd class="font-semibold" data-testid="created-at">{{ formatDate(store.cashFlow.created_at) }}</dd>
        </div>
        <div>
          <dt class="text-xs text-slate-600">Diperbarui</dt>
          <dd class="font-semibold" data-testid="updated-at">{{ formatDate(store.cashFlow.updated_at) }}</dd>
        </div>
      </dl>
      <div class="flex gap-2">
        <button type="button" class="flex items-center gap-1 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800" data-testid="edit-button" @click="showChange = true">
          <Pencil class="h-4 w-4" /> Ubah
        </button>
        <button type="button" class="flex items-center gap-1 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100" data-testid="delete-button" @click="removeThis">
          <Trash2 class="h-4 w-4" /> Hapus
        </button>
      </div>
    </div>

    <p v-else class="rounded-2xl bg-white p-8 text-center text-slate-600" data-testid="not-found">Transaksi tidak ditemukan.</p>

    <ChangeModal v-if="showChange" :cash-flow="store.cashFlow" @close="showChange = false" @success="onChanged" />
  </section>
</template>
