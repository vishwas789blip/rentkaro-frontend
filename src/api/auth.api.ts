import apiClient from "./axios";

import {
  LoginData,
  RegisterData,
} from "../types/auth.types";

export const authAPI = {
  /* =========================
     Register
  ========================= */

  register: (data: RegisterData) =>
    apiClient.post("/auth/register", data),

  verifyEmail: (data: {
    email: string;
    otp: string;
  }) =>
    apiClient.post(
      "/auth/verify-email",
      data
    ),

  resendOtp: (data: {
    email: string;
  }) =>
    apiClient.post(
      "/auth/resend-otp",
      data
    ),

  /* =========================
     Login
  ========================= */

  login: async (
    data: LoginData
  ) => {
    const response =
      await apiClient.post(
        "/auth/login",
        data
      );

    const accessToken =
      response.data?.data?.accessToken;

    const refreshToken =
      response.data?.data?.refreshToken;

    const user =
      response.data?.data?.user;

    if (accessToken) {
      localStorage.setItem(
        "accessToken",
        accessToken
      );
    }

    if (refreshToken) {
      localStorage.setItem(
        "refreshToken",
        refreshToken
      );
    }

    if (user) {
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );
    }

    return response;
  },

  /* =========================
     Current User
  ========================= */

  getMe: () =>
    apiClient.get("/auth/me"),

  /* =========================
     Password Reset
  ========================= */

  forgotPassword: (
    email: string
  ) =>
    apiClient.post(
      "/auth/forgot-password",
      {
        email,
      }
    ),

  verifyResetOtp: (data: {
    email: string;
    otp: string;
  }) =>
    apiClient.post(
      "/auth/verify-reset-otp",
      data
    ),

  resetPassword: (data: {
    resetToken: string;
    newPassword: string;
  }) =>
    apiClient.post(
      "/auth/reset-password",
      data
    ),

  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
  }) =>
    apiClient.post(
      "/auth/change-password",
      data
    ),

  /* =========================
     Refresh
  ========================= */

  refresh: (
    refreshToken: string
  ) =>
    apiClient.post(
      "/auth/refresh",
      {
        refreshToken,
      }
    ),

  /* =========================
     Logout
  ========================= */

  logout: async () => {
    try {
      await apiClient.post(
        "/auth/logout"
      );
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "refreshToken"
      );

      localStorage.removeItem(
        "user"
      );

      window.location.href =
        "/login";
    }
  },
};