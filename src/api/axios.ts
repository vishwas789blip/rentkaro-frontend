import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { RefreshResponse } from "../types/auth.types";

const BASE_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : "http://localhost:5000/api/v1";

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/* =====================================================
   REQUEST INTERCEPTOR
===================================================== */

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =====================================================
   RESPONSE INTERCEPTOR
===================================================== */

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("Refresh token missing");
        }

        const response =
          await axios.post<RefreshResponse>(
            `${BASE_URL}/auth/refresh`,
            {
              refreshToken,
            }
          );

        const newAccessToken =
          response.data.data.accessToken;

        const newRefreshToken =
          response.data.data.refreshToken;

        if (!newAccessToken) {
          throw new Error("Invalid refresh response");
        }

        localStorage.setItem(
          "accessToken",
          newAccessToken
        );

        if (newRefreshToken) {
          localStorage.setItem(
            "refreshToken",
            newRefreshToken
          );
        }

        originalRequest.headers =
          originalRequest.headers || {};

        (
          originalRequest.headers as Record<
            string,
            string
          >
        ).Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error(
          "Refresh token failed:",
          refreshError
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;