import type { RouteRecordRaw } from "vue-router";
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";
import NotFoundPage from "./features/common/pages/NotFoundPage.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: AuthLayout,
    meta: { guestOnly: true },
    redirect: "/auth/login",
    children: [
      { path: "login", component: LoginPage },
      { path: "register", component: RegisterPage },
    ],
  },
  {
    path: "/",
    component: () => import("./features/cashflows/layouts/CashFlowLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", component: () => import("./features/cashflows/pages/HomePage.vue") },
      {
        path: "cash-flows/:cashFlowId",
        component: () => import("./features/cashflows/pages/DetailPage.vue"),
      },
      { path: "users", component: () => import("./features/users/pages/UsersPage.vue") },
      { path: "profile", component: () => import("./features/users/pages/ProfilePage.vue") },
    ],
  },
  { path: "/:pathMatch(.*)*", component: NotFoundPage },
];
