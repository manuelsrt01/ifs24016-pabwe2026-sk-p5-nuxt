import { createRouter, type RouteLocationNormalized, type RouterHistory } from "vue-router";
import { useAuthStore } from "./features/auth/states/authStore";
import { routes } from "./routes";

// Belum login -> /auth/login. Sudah login -> tidak perlu ke halaman auth.
export function authGuard(to: RouteLocationNormalized): true | string {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return "/auth/login";
  if (to.meta.guestOnly && auth.isAuthenticated) return "/";
  return true;
}

// Dipakai pada pengujian; di aplikasi, Nuxt membuat router sendiri dari src/router.options.ts
export function createAppRouter(history: RouterHistory) {
  const router = createRouter({ history, routes });
  router.beforeEach(authGuard);
  return router;
}
