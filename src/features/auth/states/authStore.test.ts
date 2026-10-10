import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockPinia } from "../../../test-utils";
import * as authApi from "../api/authApi";
import { useAuthStore } from "./authStore";

vi.mock("../api/authApi", () => ({ postLogin: vi.fn(), postRegister: vi.fn() }));

const api = authApi as any;

describe("authStore", () => {
  beforeEach(() => {
    createMockPinia();
  });

  it("state awal tanpa token", () => {
    const store = useAuthStore();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.isAuthLogout).toBe(false);
  });

  it("membaca token yang tersimpan di localStorage", () => {
    localStorage.setItem("accessToken", "saved");
    const store = useAuthStore();
    expect(store.token).toBe("saved");
    expect(store.isAuthenticated).toBe(true);
  });

  it("login sukses menyimpan token", async () => {
    api.postLogin.mockResolvedValue({ message: "Login ok", data: { token: "tok" } });
    const store = useAuthStore();
    const pending = store.login("a@b.co", "123456");
    expect(store.isAuthLogin).toBe(true);
    expect(await pending).toBe(true);
    expect(store.isAuthLogin).toBe(false);
    expect(store.isAuthLoggedIn).toBe(true);
    expect(store.token).toBe("tok");
    expect(store.isAuthenticated).toBe(true);
    expect(store.message).toBe("Login ok");
    expect(localStorage.getItem("accessToken")).toBe("tok");
    expect(api.postLogin).toHaveBeenCalledWith("a@b.co", "123456");
  });

  it("login gagal menyimpan pesan error", async () => {
    api.postLogin.mockRejectedValue(new Error("Kredensial akun tidak ditemukan"));
    const store = useAuthStore();
    expect(await store.login("a@b.co", "x")).toBe(false);
    expect(store.error).toBe("Kredensial akun tidak ditemukan");
    expect(store.isAuthLoggedIn).toBe(false);
    expect(store.isAuthenticated).toBe(false);
  });

  it("register sukses dan gagal", async () => {
    const store = useAuthStore();
    api.postRegister.mockResolvedValue({ message: "Terdaftar" });
    const pending = store.register("Budi", "a@b.co", "123456");
    expect(store.isAuthRegister).toBe(true);
    expect(await pending).toBe(true);
    expect(store.isAuthRegistered).toBe(true);
    expect(store.message).toBe("Terdaftar");
    expect(api.postRegister).toHaveBeenCalledWith("Budi", "a@b.co", "123456");

    api.postRegister.mockRejectedValue(new Error("Email dipakai"));
    expect(await store.register("Budi", "a@b.co", "123456")).toBe(false);
    expect(store.error).toBe("Email dipakai");
    expect(store.isAuthRegistered).toBe(false);
  });

  it("logout menghapus token dan menandai isAuthLogout", async () => {
    api.postLogin.mockResolvedValue({ message: "ok", data: { token: "tok" } });
    const store = useAuthStore();
    await store.login("a@b.co", "123456");
    store.logout();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.isAuthLoggedIn).toBe(false);
    expect(store.isAuthLogout).toBe(true);
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("login setelah logout mereset isAuthLogout", async () => {
    api.postLogin.mockResolvedValue({ message: "ok", data: { token: "t2" } });
    const store = useAuthStore();
    store.logout();
    expect(store.isAuthLogout).toBe(true);
    await store.login("a@b.co", "123456");
    expect(store.isAuthLogout).toBe(false);
  });
});
