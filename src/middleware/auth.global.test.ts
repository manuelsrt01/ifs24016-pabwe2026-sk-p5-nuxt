import { describe, expect, it } from "vitest";
import { useAuthStore } from "../features/auth/states/authStore";
import { createMockPinia } from "../test-utils";
import middleware from "./auth.global";

describe("auth.global middleware", () => {
  it("mengarahkan user yang belum login ke /auth/login", () => {
    createMockPinia();
    useAuthStore();
    expect(middleware({ meta: { requiresAuth: true } } as any)).toBe(
      "/auth/login",
    );
  });

  it("mengarahkan user yang sudah login dari halaman auth ke /", () => {
    localStorage.setItem("accessToken", "tok");
    createMockPinia();
    useAuthStore();
    expect(middleware({ meta: { guestOnly: true } } as any)).toBe("/");
  });

  it("mengizinkan navigasi lainnya", () => {
    createMockPinia();
    useAuthStore();
    expect(middleware({ meta: {} } as any)).toBe(true);
  });
});
