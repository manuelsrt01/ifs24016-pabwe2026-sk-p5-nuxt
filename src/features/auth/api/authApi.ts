import { apiPost } from "../../../helpers/apiHelper";

export const postLogin = (email: string, password: string) => apiPost("/auth/login", { email, password });

export const postRegister = (name: string, email: string, password: string) =>
  apiPost("/auth/register", { name, email, password });
