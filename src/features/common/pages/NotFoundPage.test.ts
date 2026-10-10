import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import NotFoundPage from "./NotFoundPage.vue";

describe("NotFoundPage", () => {
  it("menampilkan pesan 404, landmark main, dan link kembali", async () => {
    const { wrapper } = await renderWithProviders(NotFoundPage);
    expect(wrapper.find("main").exists()).toBe(true);
    expect(wrapper.text()).toContain("404");
    expect(wrapper.find("h1").text()).toBe("Halaman tidak ditemukan");
    expect(wrapper.find('a[href="/"]').exists()).toBe(true);
  });
});
