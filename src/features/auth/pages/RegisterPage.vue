<script setup lang="ts">
import { Lock, Mail, User, UserPlus } from "lucide-vue-next";
import { RouterLink, useRouter } from "vue-router";
import { useInput } from "../../../hooks/useInput";
import { isValidEmail, runWithDialog, showWarningDialog } from "../../../helpers/toolsHelper";
import { useAuthStore } from "../states/authStore";

const router = useRouter();
const auth = useAuthStore();
const { value: name, onChange: onName } = useInput("");
const { value: email, onChange: onEmail } = useInput("");
const { value: password, onChange: onPassword } = useInput("");
const { value: confirm, onChange: onConfirm } = useInput("");

async function submit() {
  if (!name.value.trim() || !email.value.trim() || !password.value) {
    await showWarningDialog("Nama, email, dan kata sandi wajib diisi.");
    return;
  }
  if (!isValidEmail(email.value.trim())) {
    await showWarningDialog("Format email tidak valid.");
    return;
  }
  if (password.value.length < 6) {
    await showWarningDialog("Kata sandi minimal 6 karakter.");
    return;
  }
  if (password.value !== confirm.value) {
    await showWarningDialog("Konfirmasi kata sandi tidak sama.");
    return;
  }
  await runWithDialog(
    () => auth.register(name.value.trim(), email.value.trim(), password.value),
    auth,
    () => router.push("/auth/login"),
  );
}
</script>

<template>
  <div class="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
    <h1 class="text-2xl font-extrabold">Daftar Baru</h1>
    <p class="mt-1 text-sm text-slate-600">Buat akun untuk mulai mencatat arus kas.</p>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
      <div>
        <label for="register-name-input" class="text-xs font-bold uppercase tracking-wide text-slate-600">Nama Lengkap</label>
        <div class="relative mt-1">
          <User class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input id="register-name-input" type="text" placeholder="Nama Anda" :value="name"
            class="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600"
            @input="onName" />
        </div>
      </div>
      <div>
        <label for="register-email-input" class="text-xs font-bold uppercase tracking-wide text-slate-600">Alamat Email</label>
        <div class="relative mt-1">
          <Mail class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input id="register-email-input" type="email" placeholder="nama@email.com" :value="email"
            class="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600"
            @input="onEmail" />
        </div>
      </div>
      <div>
        <label for="register-password-input" class="text-xs font-bold uppercase tracking-wide text-slate-600">Kata Sandi</label>
        <div class="relative mt-1">
          <Lock class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input id="register-password-input" type="password" placeholder="Minimal 6 karakter" :value="password"
            class="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600"
            @input="onPassword" />
        </div>
      </div>
      <div>
        <label for="register-confirm-input" class="text-xs font-bold uppercase tracking-wide text-slate-600">Konfirmasi Kata Sandi</label>
        <div class="relative mt-1">
          <Lock class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input id="register-confirm-input" type="password" placeholder="Ulangi kata sandi" :value="confirm"
            class="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600"
            @input="onConfirm" />
        </div>
      </div>
      <button id="register-submit-button" type="submit" :disabled="auth.isAuthRegister"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
        <UserPlus class="h-4 w-4" /> Daftar Sekarang
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-600">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-bold text-emerald-700">Masuk</RouterLink>
    </p>
  </div>
</template>
