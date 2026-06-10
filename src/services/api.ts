import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { request } from "https";

/* =====================================================
   Types
===================================================== */

interface RegisterData {
  name:     string;
  email:    string;
  phone:    string;
  password: string;
  role:     "user" | "pg_owner";
}

interface LoginData {
  email:    string;
  password: string;
}

export interface UserProfile {
  id:     string;
  name:   string;
  email:  string;
  phone?: string;
  role:   "user" | "pg_owner" | "admin";
}

interface Booking {
  id:        string;
  listingId: string;
  userId:    string;
  startDate: string;
  endDate:   string;
  status:    "pending" | "approved" | "rejected" | "cancelled";
}

interface Review {
  id:        string;
  listingId: string;
  userId:    string;
  rating:    number;
  comment:   string;
  createdAt: string;
}

interface Listing {
  _id:           string;
  title:         string;
  description:   string;
  pricePerMonth: number;
  address: {
    street:  string;
    city:    string;
    state:   string;
    pincode: string;
  };
  rooms: {
    availableRooms: number;
    roomType:       "single" | "double" | "triple" | "quad";
  };
  images: { url: string; publicId: string }[];
  amenities: string[];
}

interface ListingFilters {
  search?:    string;
  city?:      string;
  location?:  string;
  roomType?:  string;
  minPrice?:  number;
  maxPrice?:  number;
  amenities?: string | string[];
  sort?:      string;
  page?:      number;
  limit?:     number;
}

/* =====================================================
   Axios instance
===================================================== */

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : "http://localhost:5000/api/v1";

const apiClient = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,
});

/* =====================================================
   Request interceptor — attach access token
===================================================== */

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =====================================================
   Response interceptor — auto-refresh on 401
===================================================== */

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        // FIX: correct endpoint — /auth/refresh (not /auth/refresh-token)
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });

        const newAccessToken  = res.data?.data?.accessToken;
        const newRefreshToken = res.data?.data?.refreshToken;

        if (!newAccessToken) throw new Error("Invalid refresh response");

        localStorage.setItem("accessToken", newAccessToken);
        // FIX: rotation — naya refresh token bhi save karo
        if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch {
        // Refresh failed — clear everything and redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

/* =====================================================
   Auth API
===================================================== */

export const authAPI = {
  // Registration flow
  register: (data: RegisterData) =>
    apiClient.post("/auth/register", data),

  verifyEmail: (data: { email: string; otp: string }) =>
    apiClient.post("/auth/verify-email", data),

  // FIX: resendOtp add kiya — VerifyEmail.tsx use karta hai
  resendOtp: (data: { email: string }) =>
    apiClient.post("/auth/resend-otp", data),

  // Login
  login: (data: LoginData) =>
    apiClient.post("/auth/login", data),

  // Current user
  getMe: () =>
    apiClient.get("/auth/me"),

  // Forgot / reset password (OTP flow)
  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),

  verifyResetOtp: (data: { email: string; otp: string }) =>
    apiClient.post("/auth/verify-reset-otp", data),

  resetPassword: (data: { resetToken: string; newPassword: string }) =>
    apiClient.post("/auth/reset-password", data),

  // Change password (authenticated)
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    apiClient.post("/auth/change-password", data),

  // Token refresh
  refresh: (refreshToken: string) =>
    apiClient.post("/auth/refresh", { refreshToken }),

  // FIX: logout backend ko call karta hai taaki token blacklist ho
  // Phir localStorage clear karta hai
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Backend error pe bhi logout karo
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  },
};

/* =====================================================
   Listing API
===================================================== */

export const listingAPI = {
  // FIX: params type updated — roomType, sort, page, limit support add kiya
  getAll: (params?: ListingFilters) =>
    apiClient.get("/pg-listings", { params }),

  getById: (id: string) =>
    apiClient.get(`/pg-listings/${id}`),

  create: (data: FormData) =>
    apiClient.post("/pg-listings", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: FormData) =>
    apiClient.put(`/pg-listings/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) =>
    apiClient.delete(`/pg-listings/${id}`),

  getOwnerListings: () =>
    apiClient.get("/pg-listings/owner/my-listings"),

  updateAvailability: (id: string, availableRooms: number) =>
    apiClient.patch(`/pg-listings/${id}/availability`, { availableRooms }),
};

/* =====================================================
   Booking API
===================================================== */

export const bookingAPI = {
  create: (data: any) =>
    apiClient.post("/bookings", data),

  getMyBookings: () =>
    apiClient.get("/bookings/my"),

  getOwnerBookings: () =>
    apiClient.get("/bookings/owner"),

  getAllBookings: () =>
    apiClient.get("/bookings/admin/all"),

  approve: (id: string) =>
    apiClient.patch(`/bookings/${id}/approve`),

  reject: (id: string, rejectionReason: string) =>
    apiClient.patch(`/bookings/${id}/reject`, { rejectionReason }),

  cancel: (id: string) =>
    apiClient.patch(`/bookings/${id}/cancel`),
};

/* =====================================================
   User / Profile API
===================================================== */

export const userAPI = {
  getProfile: () =>
    apiClient.get("/auth/profile"),

  // FIX: correct endpoint — PATCH /auth/profile (not PUT /auth/profile-update)
  updateProfile: (data: { name?: string; phone?: string }) =>
    apiClient.patch("/auth/profile", data),

  // FIX: correct endpoint — POST /auth/change-password
  updatePassword: (data: { oldPassword: string; newPassword: string }) =>
    apiClient.post("/auth/change-password", data),

  // Admin
  getAllUsers: (params?: { page?: number; limit?: number; role?: string }) =>
    apiClient.get("/admin/users", { params }),

  getDashboardStats: () =>
    apiClient.get("/admin/dashboard/stats"),
};

/* =====================================================
   Review API
===================================================== */

export const reviewAPI = {
  getByListing: (listingId: string | undefined) =>
    apiClient.get(`/reviews/listing/${listingId}`),

  create: (data: { listingId: string; rating: number; comment: string }) =>
    apiClient.post("/reviews", data),

  update: (reviewId: string, data: { rating: number; comment: string }) =>
    apiClient.put(`/reviews/${reviewId}`, data),

  markHelpful: (reviewId: string) =>
    apiClient.patch(`/reviews/${reviewId}/helpful`),

  delete: (reviewId: string) =>
    apiClient.delete(`/reviews/${reviewId}`),

  getMyReviews: () =>
    apiClient.get("/reviews/user/my-reviews"),
};

/* =====================================================
   Support API
===================================================== */

export const supportAPI = {
  create: (data: { name: string; email: string; subject: string; message: string }) =>
    apiClient.post("/support", data),

  getAll: () =>
    apiClient.get("/support"),

  reply: (id: string, data: { message: string }) =>
    apiClient.patch(`/support/${id}/reply`, data),

  getUserTickets: () =>
    apiClient.get("/support/my-tickets"),
};

/* =====================================================
   Wishlist API
===================================================== */

export const wishlistAPI = {
  getMyWishlist: () =>
    apiClient.get("/wishlist"),

  addToWishlist: (listingId: string) =>
    apiClient.post(`/wishlist/${listingId}`),

  removeFromWishlist: (listingId: string) =>
    apiClient.delete(`/wishlist/${listingId}`),
};

export default apiClient;