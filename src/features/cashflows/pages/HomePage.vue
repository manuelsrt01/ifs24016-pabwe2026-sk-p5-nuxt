<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { Eye, Pencil, Plus, RotateCcw, Trash2 } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { buildCashFlowQuery } from "../api/cashFlowApi";
import {
  confirmAndRun,
  formatDate,
  formatRupiah,
  getStat,
  showErrorDialog,
  sourceLabel,
  typeLabel,
} from "../../../helpers/toolsHelper";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore, type CashFlow } from "../states/cashFlowsStore";

const DAILY_TOTAL = 7;
const MONTHLY_TOTAL = 6;

const store = useCashFlowsStore();
const filters = reactive({ type: "", source: "", label: "", startDate: "", endDate: "" });
const showAdd = ref(false);
const editing = ref<CashFlow | null>(null);

const balanceOf = (source: string) =>
  getStat(store.stats, `total_inflow_${source}`) - getStat(store.stats, `total_outflow_${source}`);

const cards = computed(() => [
  { key: "net", title: "Total Saldo Kas Bersih", value: getStat(store.stats, "cashflow") },
  { key: "inflow", title: "Total Pemasukan (Inflow)", value: getStat(store.stats, "total_inflow") },
  { key: "outflow", title: "Total Pengeluaran (Outflow)", value: getStat(store.stats, "total_outflow") },
  { key: "cash", title: "Saldo Kas Tunai", value: balanceOf("cash") },
  { key: "savings", title: "Saldo Rekening Tabungan", value: balanceOf("savings") },
  { key: "loans", title: "Saldo Pinjaman", value: balanceOf("loans") },
]);

const dailyEntries = computed(() => Object.entries(store.statsDaily));
const monthlyEntries = computed(() => Object.entries(store.statsMonthly));

const badgeClass = (type: string) =>
  type === "inflow" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800";

async function load() {
  if (!(await store.fetchCashFlows(buildCashFlowQuery(filters)))) await showErrorDialog(store.error);
}

async function refreshAll() {
  await load();
  await store.fetchLabels();
  await store.fetchStatsDaily(DAILY_TOTAL);
  await store.fetchStatsMonthly(MONTHLY_TOTAL);
}

function resetFilters() {
  Object.assign(filters, { type: "", source: "", label: "", startDate: "", endDate: "" });
}

const removeOne = (item: CashFlow) =>
  confirmAndRun(
    "Hapus transaksi?",
    `Transaksi "${item.label}" akan dihapus permanen.`,
    () => store.removeCashFlow(item.id),
    store,
    refreshAll,
  );

const resetAll = () =>
  confirmAndRun(
    "Reset semua transaksi?",
    "Seluruh catatan arus kas Anda akan dihapus permanen.",
    () => store.removeAllCashFlows(),
    store,
    refreshAll,
  );

async function onSaved() {
  showAdd.value = false;
  editing.value = null;
  await refreshAll();
}

watch(filters, load);
onMounted(refreshAll);
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold">Ringkasan Arus Kas</h1>
        <p class="text-sm text-slate-600">Pantau saldo, pemasukan, dan pengeluaran Anda.</p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100"
          data-testid="reset-all-button"
          @click="resetAll"
        >
          <RotateCcw class="h-4 w-4" /> Reset Semua
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800"
          data-testid="add-button"
          @click="showAdd = true"
        >
          <Plus class="h-4 w-4" /> Tambah Transaksi
        </button>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="card in cards"
        :key="card.key"
        class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
        :data-testid="`metric-${card.key}`"
      >
        <p class="text-sm text-slate-600">{{ card.title }}</p>
        <p class="mt-1 text-2xl font-extrabold">{{ formatRupiah(card.value) }}</p>
      </div>
    </div>

    <div class="grid gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:grid-cols-2 xl:grid-cols-5">
      <div>
        <label for="filter-type" class="text-xs font-bold uppercase text-slate-600">Jenis</label>
        <select id="filter-type" v-model="filters.type" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
          <option value="">Semua</option>
          <option value="inflow">Pemasukan</option>
          <option value="outflow">Pengeluaran</option>
        </select>
      </div>
      <div>
        <label for="filter-source" class="text-xs font-bold uppercase text-slate-600">Sumber Dana</label>
        <select id="filter-source" v-model="filters.source" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
          <option value="">Semua</option>
          <option value="cash">Tunai</option>
          <option value="savings">Tabungan</option>
          <option value="loans">Pinjaman</option>
        </select>
      </div>
      <div>
        <label for="filter-label" class="text-xs font-bold uppercase text-slate-600">Label</label>
        <select id="filter-label" v-model="filters.label" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
          <option value="">Semua</option>
          <option v-for="item in store.labels" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>
      <div>
        <label for="filter-start" class="text-xs font-bold uppercase text-slate-600">Tanggal Awal</label>
        <input id="filter-start" v-model="filters.startDate" type="date" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label for="filter-end" class="text-xs font-bold uppercase text-slate-600">Tanggal Akhir</label>
        <input id="filter-end" v-model="filters.endDate" type="date" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div class="sm:col-span-2 xl:col-span-5">
        <button type="button" class="rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100" data-testid="reset-filter" @click="resetFilters">
          Reset Filter
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <h2 class="text-lg font-bold">Daftar Transaksi</h2>
      <p v-if="store.isCashFlow" class="text-slate-600" data-testid="loading">Memuat transaksi...</p>
      <p v-else-if="store.cashFlows.length === 0" class="rounded-2xl bg-white p-8 text-center text-slate-600" data-testid="empty">
        Belum ada transaksi.
      </p>
      <template v-else>
        <div class="hidden overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 md:block">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th scope="col" class="px-4 py-3">Jenis</th>
                <th scope="col" class="px-4 py-3">Label</th>
                <th scope="col" class="px-4 py-3">Sumber</th>
                <th scope="col" class="px-4 py-3">Nominal</th>
                <th scope="col" class="px-4 py-3">Tanggal</th>
                <th scope="col" class="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in store.cashFlows" :key="item.id" class="border-t border-slate-100" :data-testid="`row-${item.id}`">
                <td class="px-4 py-3">
                  <span :class="['rounded-full px-2.5 py-1 text-xs font-bold', badgeClass(item.type)]">{{ typeLabel(item.type) }}</span>
                </td>
                <td class="px-4 py-3 font-semibold">{{ item.label }}</td>
                <td class="px-4 py-3">{{ sourceLabel(item.source) }}</td>
                <td class="px-4 py-3 font-bold">{{ formatRupiah(item.nominal) }}</td>
                <td class="px-4 py-3 text-slate-600">{{ formatDate(item.created_at) }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-1">
                    <RouterLink :to="`/cash-flows/${item.id}`" class="rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Lihat detail" :data-testid="`detail-${item.id}`">
                      <Eye class="h-4 w-4" />
                    </RouterLink>
                    <button type="button" class="rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Ubah transaksi" :data-testid="`edit-${item.id}`" @click="editing = item">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button type="button" class="rounded-lg p-2 text-rose-700 hover:bg-rose-50" aria-label="Hapus transaksi" :data-testid="`delete-${item.id}`" @click="removeOne(item)">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-3 md:hidden">
          <article v-for="item in store.cashFlows" :key="item.id" class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100" :data-testid="`card-${item.id}`">
            <div class="flex items-center justify-between">
              <span :class="['rounded-full px-2.5 py-1 text-xs font-bold', badgeClass(item.type)]">{{ typeLabel(item.type) }}</span>
              <span class="text-xs text-slate-600">{{ formatDate(item.created_at) }}</span>
            </div>
            <p class="mt-2 font-bold">{{ item.label }}</p>
            <p class="text-sm text-slate-600">{{ sourceLabel(item.source) }}</p>
            <p class="mt-1 text-lg font-extrabold">{{ formatRupiah(item.nominal) }}</p>
            <div class="mt-2 flex gap-1">
              <RouterLink :to="`/cash-flows/${item.id}`" class="rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Lihat detail" :data-testid="`card-detail-${item.id}`">
                <Eye class="h-4 w-4" />
              </RouterLink>
              <button type="button" class="rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Ubah transaksi" :data-testid="`card-edit-${item.id}`" @click="editing = item">
                <Pencil class="h-4 w-4" />
              </button>
              <button type="button" class="rounded-lg p-2 text-rose-700 hover:bg-rose-50" aria-label="Hapus transaksi" :data-testid="`card-delete-${item.id}`" @click="removeOne(item)">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </article>
        </div>
      </template>
    </div>

    <div class="space-y-3">
      <h2 class="text-lg font-bold">Statistik Arus Kas Bersih</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 class="mb-2 font-bold">Harian</h3>
          <p v-if="dailyEntries.length === 0" class="text-sm text-slate-600" data-testid="daily-empty">Belum ada data harian.</p>
          <ul v-else class="divide-y divide-slate-100 text-sm" data-testid="daily-list">
            <li v-for="[day, value] in dailyEntries" :key="day" class="flex justify-between py-1.5">
              <span class="text-slate-600">{{ day }}</span>
              <span class="font-bold">{{ formatRupiah(value) }}</span>
            </li>
          </ul>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 class="mb-2 font-bold">Bulanan</h3>
          <p v-if="monthlyEntries.length === 0" class="text-sm text-slate-600" data-testid="monthly-empty">Belum ada data bulanan.</p>
          <ul v-else class="divide-y divide-slate-100 text-sm" data-testid="monthly-list">
            <li v-for="[month, value] in monthlyEntries" :key="month" class="flex justify-between py-1.5">
              <span class="text-slate-600">{{ month }}</span>
              <span class="font-bold">{{ formatRupiah(value) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <AddModal v-if="showAdd" @close="showAdd = false" @success="onSaved" />
    <ChangeModal v-if="editing" :cash-flow="editing" @close="editing = null" @success="onSaved" />
  </section>
</template>
