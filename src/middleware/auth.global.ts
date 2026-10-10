import type { RouteLocationNormalized } from "vue-router";
import { authGuard } from "../router";

// Middleware global Nuxt: melindungi rute yang butuh login dan mengarahkan user yang sudah login dari halaman auth
export default function authMiddleware(to: RouteLocationNormalized) {
  return authGuard(to);
}
