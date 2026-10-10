import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../states/authStore";
import RegisterPage from "./RegisterPage.vue";

const fire = Swal.fire as any;

async function setup(registerResult = true) {
  const pinia = createMockPinia();
  const auth = useAuthStore(pinia);
  const register = vi.spyOn(auth, "register").mockImplementation(async () => {
    if (!registerResult) auth.error = "Email sudah dipakai";
    else auth.message = "Registrasi berhasil";
    return registerResult;
  });
  const result = await renderWithProviders(RegisterPage, { pinia });
  vi.spyOn(result.router, "push");
  return { ...result, auth, register };
}

async function fill(
  wrapper: any,
  { name = "Budi", email = "a@b.co", password = "123456", confirm = "123456" }: Record<string, string>,
) {
  await wrapper.find("#register-name-input").setValue(name);
  await wrapper.find("#register-email-input").setValue(email);
  await wrapper.find("#register-password-input").setValue(password);
  await wrapper.find("#register-confirm-input").setValue(confirm);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

describe("RegisterPage", () => {
  it("menampilkan form dan link ke login", async () => {
    const { wrapper } = await setup();
    expect(wrapper.find("h1").text()).toBe("Daftar Baru");
    expect(wrapper.find("#register-submit-button").exists()).toBe(true);
    expect(wrapper.find('a[href="/auth/login"]').exists()).toBe(true);
  });

  it.each([
    ["kolom kosong", { name: "" }, "Nama, email, dan kata sandi wajib diisi."],
    ["email kosong", { email: "" }, "Nama, email, dan kata sandi wajib diisi."],
    ["password kosong", { password: "", confirm: "" }, "Nama, email, dan kata sandi wajib diisi."],
    ["email tidak valid", { email: "salah" }, "Format email tidak valid."],
    ["password pendek", { password: "123", confirm: "123" }, "Kata sandi minimal 6 karakter."],
    ["konfirmasi beda", { confirm: "654321" }, "Konfirmasi kata sandi tidak sama."],
  ])("validasi: %s", async (_label, values, message) => {
    const { wrapper, register } = await setup();
    await fill(wrapper, values);
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning", text: message }));
    expect(register).not.toHaveBeenCalled();
  });

  it("register sukses lalu pindah ke login", async () => {
    const { wrapper, register, router } = await setup(true);
    await fill(wrapper, {});
    expect(register).toHaveBeenCalledWith("Budi", "a@b.co", "123456");
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Registrasi berhasil" }));
    expect(router.push).toHaveBeenCalledWith("/auth/login");
  });

  it("register gagal menampilkan error", async () => {
    const { wrapper, router } = await setup(false);
    await fill(wrapper, {});
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Email sudah dipakai" }));
    expect(router.push).not.toHaveBeenCalled();
  });
});
