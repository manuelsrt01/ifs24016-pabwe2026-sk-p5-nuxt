<script setup lang="ts">
import { onMounted } from "vue";
import { formatDate, showErrorDialog } from "../../../helpers/toolsHelper";
import UserAvatar from "../../common/components/UserAvatar.vue";
import { useUsersStore } from "../states/usersStore";

const store = useUsersStore();

onMounted(async () => {
  if (!(await store.fetchUsers())) await showErrorDialog(store.error);
});
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-extrabold">Direktori Pengguna</h1>
      <p class="text-sm text-slate-600">Seluruh pengguna yang terdaftar di Delcom Cash Flow.</p>
    </div>

    <div v-if="store.user" class="flex items-center gap-4 rounded-2xl bg-emerald-50 p-4" data-testid="selected-user">
      <UserAvatar :photo="store.user.photo" :name="store.user.name" size-class="h-14 w-14" />
      <div>
        <p class="font-bold">{{ store.user.name }}</p>
        <p class="text-sm text-slate-700">{{ store.user.email }}</p>
        <p class="text-xs text-slate-600">Bergabung {{ formatDate(store.user.created_at) }}</p>
      </div>
    </div>

    <p v-if="store.isUsersLoading" class="text-slate-600" data-testid="users-loading">Memuat pengguna...</p>
    <p v-else-if="store.users.length === 0" class="text-slate-600" data-testid="users-empty">
      Belum ada pengguna.
    </p>
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="item in store.users"
        :key="item.id"
        type="button"
        class="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100 hover:ring-emerald-300"
        data-testid="user-card"
        @click="store.selectUser(item)"
      >
        <UserAvatar :photo="item.photo" :name="item.name" />
        <div class="min-w-0">
          <p class="truncate font-bold">{{ item.name }}</p>
          <p class="truncate text-sm text-slate-600">{{ item.email }}</p>
        </div>
      </button>
    </div>
  </section>
</template>
