import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../states/authStore";
import LoginPage from "./LoginPage.vue";

const fire = Swal.fire as any;

async function setup(loginResult = true) {
  const pinia = createMockPinia();
  const auth = useAuthStore(pinia);
  const login = vi.spyOn(auth, "login").mockImplementation(async () => {
    if (!loginResult) auth.error = "Kredensial salah";
    else auth.message = "Login berhasil";
    return loginResult;
  });
  const result = await renderWithProviders(LoginPage, { pinia });
  vi.spyOn(result.router, "push");
  return { ...result, auth, login };
}

async function fill(wrapper: any, email: string, password: string) {
  await wrapper.find("#login-email-input").setValue(email);
  await wrapper.find("#login-password-input").setValue(password);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

describe("LoginPage", () => {
  it("menampilkan form login (id selector grader) dan link ke register", async () => {
    const { wrapper } = await setup();
    expect(wrapper.find("h1").text()).toBe("Masuk Akun");
    expect(wrapper.find("#login-email-input").exists()).toBe(true);
    expect(wrapper.find("#login-password-input").exists()).toBe(true);
    expect(wrapper.find("#login-submit-button").exists()).toBe(true);
    expect(wrapper.find('a[href="/auth/register"]').exists()).toBe(true);
  });

  it("memperingatkan jika kolom kosong", async () => {
    const { wrapper, login } = await setup();
    await fill(wrapper, "", "");
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning", text: "Email dan kata sandi wajib diisi." }));
    expect(login).not.toHaveBeenCalled();
  });

  it("memperingatkan jika password kosong", async () => {
    const { wrapper, login } = await setup();
    await fill(wrapper, "a@b.co", "");
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning" }));
    expect(login).not.toHaveBeenCalled();
  });

  it("memperingatkan jika format email salah", async () => {
    const { wrapper, login } = await setup();
    await fill(wrapper, "bukan-email", "123456");
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Format email tidak valid." }));
    expect(login).not.toHaveBeenCalled();
  });

  it("login sukses menampilkan dialog dan pindah ke beranda", async () => {
    const { wrapper, login, router } = await setup(true);
    await fill(wrapper, " a@b.co ", "123456");
    expect(login).toHaveBeenCalledWith("a@b.co", "123456");
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Login berhasil" }));
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("login gagal menampilkan dialog error", async () => {
    const { wrapper, router } = await setup(false);
    await fill(wrapper, "a@b.co", "salah1");
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Kredensial salah" }));
    expect(router.push).not.toHaveBeenCalled();
  });

  it("tombol dinonaktifkan saat proses login", async () => {
    const { wrapper, auth } = await setup();
    auth.isAuthLogin = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find("#login-submit-button").attributes("disabled")).toBeDefined();
  });
});
