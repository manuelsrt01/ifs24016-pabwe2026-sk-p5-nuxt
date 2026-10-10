import { defineStore } from "pinia";
import { runTask } from "../../../helpers/storeHelper";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "../api/userApi";

export interface User {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  created_at?: string;
}

export interface UsersState {
  error: string;
  message: string;
  users: User[];
  user: User | null; // pengguna yang dipilih di halaman daftar
  profile: User | null; // profil akun yang sedang login
  isUsersLoading: boolean;
  isUsersLoaded: boolean;
  isProfileLoading: boolean;
  isProfileLoaded: boolean;
  isProfileChange: boolean;
  isProfileChanged: boolean;
  isPhotoChange: boolean;
  isPhotoChanged: boolean;
  isPasswordChange: boolean;
  isPasswordChanged: boolean;
}

export const useUsersStore = defineStore("users", {
  state: (): UsersState => ({
    error: "",
    message: "",
    users: [],
    user: null,
    profile: null,
    isUsersLoading: false,
    isUsersLoaded: false,
    isProfileLoading: false,
    isProfileLoaded: false,
    isProfileChange: false,
    isProfileChanged: false,
    isPhotoChange: false,
    isPhotoChanged: false,
    isPasswordChange: false,
    isPasswordChanged: false,
  }),
  actions: {
    fetchUsers() {
      return runTask(this, "isUsersLoading", "isUsersLoaded", async () => {
        const response = await getUsers();
        this.users = response.data.users;
        return response.message;
      });
    },
    fetchProfile() {
      return runTask(this, "isProfileLoading", "isProfileLoaded", async () => {
        const response = await getMe();
        this.profile = response.data.user;
        return response.message;
      });
    },
    changeProfile(name: string, email: string) {
      return runTask(this, "isProfileChange", "isProfileChanged", async () => {
        const response = await putMe(name, email);
        this.profile = response.data.user;
        return response.message;
      });
    },
    changePhoto(file: File) {
      return runTask(this, "isPhotoChange", "isPhotoChanged", async () => {
        const response = await postPhoto(file);
        const me = await getMe();
        this.profile = me.data.user;
        return response.message;
      });
    },
    changePassword(password: string, newPassword: string, confirmation: string) {
      return runTask(this, "isPasswordChange", "isPasswordChanged", async () => {
        const response = await putPassword(password, newPassword, confirmation);
        return response.message;
      });
    },
    selectUser(selected: User) {
      this.user = selected;
    },
  },
});
