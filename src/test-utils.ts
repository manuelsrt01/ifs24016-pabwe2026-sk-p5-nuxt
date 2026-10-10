import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";
import { vi } from "vitest";

const Empty = defineComponent({ render: () => h("div", { "data-testid": "empty" }) });

export function createMockPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

export function createTestRouter(routes: any[] = [], history = createMemoryHistory()) {
  return createRouter({
    history,
    routes: [...routes, { path: "/:pathMatch(.*)*", component: Empty }],
  });
}

// Render komponen tunggal dengan Pinia + Memory Router
export async function renderWithProviders(component: any, options: any = {}) {
  const pinia = options.pinia || createMockPinia();
  const router = createTestRouter(options.routes || []);
  await router.push(options.route || "/");
  await router.isReady();
  const wrapper = mount(component, {
    props: options.props,
    attachTo: options.attachTo,
    global: { plugins: [pinia, router] },
  });
  return { wrapper, router, pinia };
}

// Render lewat <RouterView> (untuk layout dan App)
export async function renderRoutes(routes: any[], route: string, pinia: any = createMockPinia(), root: any = RouterView) {
  const router = createTestRouter(routes);
  await router.push(route);
  await router.isReady();
  const wrapper = mount(root, { global: { plugins: [pinia, router] } });
  return { wrapper, router, pinia };
}

// Komponen palsu: setiap event menjadi tombol dengan data-testid="<Nama>-<event>"
export function createStub(name: string, props: string[] = [], emits: string[] = ["close", "success"]) {
  return defineComponent({
    name,
    props,
    emits,
    setup(_props, { emit }) {
      return () =>
        h(
          "div",
          { "data-testid": name },
          emits.map((event) =>
            h("button", { "data-testid": `${name}-${event}`, onClick: () => emit(event as any, "uji") }, event),
          ),
        );
    },
  });
}

export function mockFetch(json: unknown) {
  const fn = vi.fn().mockResolvedValue({ ok: true, json: async () => json });
  globalThis.fetch = fn as any;
  return fn;
}
