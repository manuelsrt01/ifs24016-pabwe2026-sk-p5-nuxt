import { defineStore } from "pinia";
import { getAccessToken, putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import { runTask } from "../../../helpers/storeHelper";
import { postLogin, postRegister } from "../api/authApi";

export interface AuthState {
  token: string | null;
  error: string;
  message: string;
  isAuthLogin: boolean; // sedang proses login
  isAuthLoggedIn: boolean; // login berhasil
  isAuthRegister: boolean; // sedang proses register
  isAuthRegistered: boolean; // register berhasil
  isAuthLogout: boolean; // sudah logout
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: getAccessToken(),
    error: "",
    message: "",
    isAuthLogin: false,
    isAuthLoggedIn: false,
    isAuthRegister: false,
    isAuthRegistered: false,
    isAuthLogout: false,
  }),
  getters: {
    isAuthenticated: (state): boolean => Boolean(state.token),
  },
  actions: {
    login(email: string, password: string) {
      return runTask(this, "isAuthLogin", "isAuthLoggedIn", async () => {
        const response = await postLogin(email, password);
        this.token = response.data.token;
        putAccessToken(this.token);
        this.isAuthLogout = false;
        return response.message;
      });
    },
    register(name: string, email: string, password: string) {
      return runTask(this, "isAuthRegister", "isAuthRegistered", async () => {
        const response = await postRegister(name, email, password);
        return response.message;
      });
    },
    logout() {
      removeAccessToken();
      this.token = null;
      this.isAuthLoggedIn = false;
      this.isAuthLogout = true;
    },
  },
});
