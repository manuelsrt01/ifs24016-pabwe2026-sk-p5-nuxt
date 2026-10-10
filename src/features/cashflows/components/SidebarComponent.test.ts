import { flushPromises } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import SidebarComponent from "./SidebarComponent.vue";

const linkByText = (wrapper: any, text: string) => wrapper.findAll("a").find((link: any) => link.text() === text);

describe("SidebarComponent", () => {
  it("menampilkan tiga menu", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent);
    expect(wrapper.findAll("a").map((link: any) => link.text())).toEqual([
      "Ringkasan Arus Kas",
      "Direktori Pengguna",
      "Profil Saya",
    ]);
  });

  it("menandai menu aktif sesuai rute", async () => {
    const home = await renderWithProviders(SidebarComponent, { route: "/" });
    expect(linkByText(home.wrapper, "Ringkasan Arus Kas").classes()).toContain("bg-emerald-50");
    expect(linkByText(home.wrapper, "Profil Saya").classes()).not.toContain("bg-emerald-50");

    const users = await renderWithProviders(SidebarComponent, { route: "/users" });
    expect(linkByText(users.wrapper, "Direktori Pengguna").classes()).toContain("bg-emerald-50");
    expect(linkByText(users.wrapper, "Ringkasan Arus Kas").classes()).not.toContain("bg-emerald-50");
  });

  it("tertutup secara default tanpa overlay", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent);
    expect(wrapper.get('[data-testid="sidebar"]').classes()).toContain("-translate-x-full");
    expect(wrapper.find('[data-testid="sidebar-overlay"]').exists()).toBe(false);
  });

  it("terbuka: overlay tampil dan klik overlay mengirim close", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    expect(wrapper.get('[data-testid="sidebar"]').classes()).toContain("translate-x-0");
    await wrapper.get('[data-testid="sidebar-overlay"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("klik menu mengirim close", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    await linkByText(wrapper, "Profil Saya").trigger("click");
    await flushPromises();
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
