<script setup lang="ts">
import { RouterView } from "vue-router";

// Path dari folder public/ (dibuat variabel agar tidak diproses sebagai impor aset)
const logoUrl = "/logo.svg";
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <section
      class="hidden flex-col justify-between bg-gradient-to-br from-emerald-700 to-cyan-800 p-12 text-white lg:flex"
      data-testid="auth-banner"
    >
      <div class="flex items-center gap-3">
        <img :src="logoUrl" alt="Logo Delcom Cash Flow" class="h-10 w-10 rounded-xl" />
        <span class="text-xl font-extrabold">Delcom Cash Flow</span>
      </div>
      <div class="space-y-4">
        <p class="text-4xl font-extrabold leading-tight">Catat setiap rupiah, kendalikan keuanganmu.</p>
        <p class="text-emerald-50">
          Pantau pemasukan dan pengeluaran, saldo tunai, tabungan, hingga pinjaman dalam satu dashboard.
        </p>
      </div>
      <p class="text-sm text-emerald-50">&copy; Delcom Cash Flow</p>
    </section>
    <main class="flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <RouterView />
      </div>
    </main>
  </div>
</template>
