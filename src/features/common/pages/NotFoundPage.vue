<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
    <p class="text-7xl font-extrabold text-emerald-700">404</p>
    <h1 class="text-2xl font-bold">Halaman tidak ditemukan</h1>
    <p class="text-slate-600">Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.</p>
    <RouterLink to="/" class="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">
      Kembali ke Beranda
    </RouterLink>
  </main>
</template>
