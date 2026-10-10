import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import { describe, expect, it, vi } from "vitest";
import App from "./App.vue";
import { createAppRouter } from "./router";
import { createMockPinia } from "./test-utils";

function mockApi() {
  globalThis.fetch = vi.fn(async (url: string) => {
    const path = new URL(url).pathname;
    let data: any = {};
    if (path.endsWith("/users/me")) {
      data = { user: { id: 1, name: "Budi", email: "budi@x.co", photo: null } };
    } else if (path.endsWith("/cash-flows/labels")) {
      data = { labels: ["gaji"] };
    } else if (path.includes("/cash-flows/stats/")) {
      data = { stats_cashflow: { "10-2024": 2000000 } };
    } else if (path.endsWith("/cash-flows")) {
      data = {
        cash_flows: [
          {
            id: 1, user_id: 1, type: "inflow", source: "cash", label: "gaji", description: "Gaji bulanan",
            nominal: 2500000, created_at: "2024-10-05T11:26:45.000000Z", updated_at: "2024-10-05T11:26:48.000000Z",
          },
        ],
        stats: { cashflow: 2000000, total_inflow: 2500000 },
      };
    }
    return { json: async () => ({ status: "success", message: "ok", data }) };
  }) as any;
}

async function render(path: string) {
  const pinia = createMockPinia();
  const router = createAppRouter(createMemoryHistory());
  await router.push(path);
  await router.isReady();
  const wrapper = mount(App, { global: { plugins: [pinia, router] } });
  await flushPromises();
  return { wrapper, router };
}

describe("App", () => {
  it("user belum login melihat halaman login", async () => {
    const { wrapper, router } = await render("/");
    expect(router.currentRoute.value.path).toBe("/auth/login");
    expect(wrapper.text()).toContain("Masuk Akun");
  });

  it("user login melihat ringkasan arus kas lengkap dengan navbar dan sidebar", async () => {
    localStorage.setItem("accessToken", "tok");
    mockApi();
    const { wrapper } = await render("/");
    expect(wrapper.text()).toContain("Ringkasan Arus Kas");
    expect(wrapper.text()).toContain("gaji");
    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.text()).toContain("Direktori Pengguna");
  });

  it("rute tidak dikenal menampilkan 404", async () => {
    const { wrapper } = await render("/tidak/ada");
    expect(wrapper.text()).toContain("404");
  });
});
