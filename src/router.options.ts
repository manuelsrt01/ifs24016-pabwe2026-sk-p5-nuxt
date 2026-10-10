import type { RouterConfig } from "@nuxt/schema";
import { routes } from "./routes";

// Nuxt memakai rute ini (bukan rute otomatis dari folder pages/)
export default <RouterConfig>{
  routes: () => routes,
};
