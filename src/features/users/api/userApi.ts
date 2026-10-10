import { apiGet, apiPost, apiPut } from "../../../helpers/apiHelper";

export const getUsers = () => apiGet("/users");

export const getMe = () => apiGet("/users/me");

export const putMe = (name: string, email: string) => apiPut("/users/me", { name, email });

export function postPhoto(file: File) {
  const form = new FormData();
  form.append("photo", file);
  return apiPost("/users/me/photo", form);
}

// Sesuai dokumentasi Delcom: PUT /users/password
export const putPassword = (password: string, newPassword: string, confirmation: string) =>
  apiPut("/users/password", {
    password,
    new_password: newPassword,
    new_password_confirmation: confirmation,
  });
