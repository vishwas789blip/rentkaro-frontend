import apiClient from "./axios";

interface UpdateProfileData {
  name?: string;
  phone?: string;
}

interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
}

interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: string;
}

export const userAPI = {
  /* =========================
     Profile
  ========================= */

  getProfile: () =>
    apiClient.get("/auth/profile"),

  updateProfile: (
    data: UpdateProfileData
  ) =>
    apiClient.patch(
      "/auth/profile",
      data
    ),

  /* =========================
     Password
  ========================= */

  updatePassword: (
    data: UpdatePasswordData
  ) =>
    apiClient.post(
      "/auth/change-password",
      data
    ),

  /* =========================
     Admin
  ========================= */

  getAllUsers: (
    params?: UserQueryParams
  ) =>
    apiClient.get(
      "/admin/users",
      {
        params,
      }
    ),

  getDashboardStats: () =>
    apiClient.get(
      "/admin/dashboard/stats"
    ),
};