<script setup lang="ts">
import { CircleUser, LayoutDashboard, Users } from "lucide-vue-next";
import { RouterLink, useRoute } from "vue-router";

defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits<{ (e: "close"): void }>();

const route = useRoute();

const items = [
  { label: "Ringkasan Arus Kas", to: "/", icon: LayoutDashboard },
  { label: "Direktori Pengguna", to: "/users", icon: Users },
  { label: "Profil Saya", to: "/profile", icon: CircleUser },
];

const isActive = (to: string) => route.path === to;
</script>

<template>
  <div>
    <div
      v-if="open"
      class="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
      data-testid="sidebar-overlay"
      @click="emit('close')"
    ></div>
    <aside
      :class="[
        'fixed bottom-0 left-0 top-16 z-40 w-64 border-r border-slate-200 bg-white p-4 transition-transform md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      ]"
      data-testid="sidebar"
    >
      <nav class="space-y-1">
        <RouterLink
          v-for="item in items"
          :key="item.label"
          :to="item.to"
          :class="[
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold',
            isActive(item.to) ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-100',
          ]"
          @click="emit('close')"
        >
          <component :is="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>
  </div>
</template>
