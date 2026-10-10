import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "../../../test-utils";
import AuthLayout from "./AuthLayout.vue";

const Child = defineComponent({ render: () => h("p", "isi halaman auth") });

describe("AuthLayout", () => {
  it("menampilkan banner, landmark main, dan konten rute anak", async () => {
    const { wrapper } = await renderRoutes(
      [{ path: "/auth", component: AuthLayout, children: [{ path: "login", component: Child }] }],
      "/auth/login",
    );
    expect(wrapper.find('[data-testid="auth-banner"]').exists()).toBe(true);
    expect(wrapper.find("main").exists()).toBe(true);
    expect(wrapper.text()).toContain("Delcom Cash Flow");
    expect(wrapper.text()).toContain("isi halaman auth");
    expect(wrapper.find("img").attributes("src")).toBe("/logo.svg");
  });
});
