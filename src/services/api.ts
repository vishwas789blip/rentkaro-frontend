import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "user" | "pg_owner"; 
}

interface LoginData {
  email: string;
  password: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "pg_owner" | "admin";
}

interface Booking {
  id: string;
  listingId: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
}

interface Review {
  id: string;
  listingId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Listing {
  _id: string;
  title: string;
  description: string;
  pricePerMonth: number;

  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  rooms: {
    availableRooms: number;
    roomType: "single" | "double" | "triple" | "quad";
  };

  images: {
    url: string;
    publicId: string;
  }[];

  amenities: string[];
}

interface ListingFilters {
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}

/* =====================================================
   Axios Instance
===================================================== */

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1` || "http://localhost:5000/api/v1",
  withCredentials: true,
});

/* =====================================================
   Request Interceptor
===================================================== */

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =====================================================
   Response Interceptor
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

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh-token`,
          { refreshToken }
        );

        const newAccessToken =
          (res.data as any)?.data?.accessToken || (res.data as any)?.accessToken;

        if (!newAccessToken) {
          throw new Error("Invalid refresh token response");
        }

        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);

        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      const serverMessage =
        (error.response.data as any)?.message || "Insufficient permissions";

      console.error("403 Forbidden:", serverMessage);
    }

    return Promise.reject(error);
  }
);

/* =====================================================
   AUTH API
===================================================== */

export const authAPI = {
  login: (data: LoginData) => apiClient.post("/auth/login", data),
  
  register: (data: RegisterData) => apiClient.post("/auth/register", data),
  
  getMe: () => apiClient.get("/auth/me"),
  
  verifyEmail: (userId: string) =>
    apiClient.get(`/auth/verify-email/${userId}`),

  sendPasswordResetOTP: (email: string) =>
    apiClient.post("/auth/forgot-password-otp", { email }),

  verifyOTP: (data: { email: string; otp: string }) =>
    apiClient.post("/auth/verify-otp", data),

  resetPasswordWithOTP: (data: { email: string; otp: string; password: any }) =>
    apiClient.post("/auth/reset-password-otp", data),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post(`/auth/reset-password/${token}`, {
      newPassword,
    }),

  logout: () => {
    localStorage.clear();
    window.location.href = "/login";
  },
};

/* =====================================================
   LISTING API
===================================================== */

export const listingAPI = {

  getAll: (params?: ListingFilters) =>
    apiClient.get<{ data: Listing[] }>("/pg-listings", { params }),

  getById: (id: string) =>
    apiClient.get<{ data: Listing }>(`/pg-listings/${id}`),

  create: (data: FormData) =>
    apiClient.post("/pg-listings", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getOwnerListings: () =>
    apiClient.get<{ success: boolean; data: Listing[] }>(
      "/pg-listings/owner/my-listings"
    ),

  /* ================= UPDATE LISTING ================= */

  update: (id: string, data: FormData) =>
    apiClient.put(`/pg-listings/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /* ================= DELETE LISTING ================= */

  delete: (id: string) =>
    apiClient.delete(`/pg-listings/${id}`),
};

/* =====================================================
   BOOKINGS API
===================================================== */

export const bookingAPI = {
  create: (data: any) =>
    apiClient.post("/bookings", data),

  getMyBookings: () =>
    apiClient.get<{ data: Booking[] }>("/bookings/my"),

  getOwnerBookings: () =>
    apiClient.get<{ data: Booking[] }>("/bookings/owner"),

  getAllBookings: () =>
    apiClient.get<{ data: Booking[] }>("/bookings/admin/all"),

  approve: (id: string) =>
    apiClient.post(`/bookings/${id}/approve`),

  reject: (id: string, rejectionReason: string) =>
    apiClient.post(`/bookings/${id}/reject`, { rejectionReason }),

  cancel: (id: string) =>
    apiClient.post(`/bookings/${id}/cancel`),
};

/* =====================================================
   USERS API
===================================================== */

export const userAPI = {

  getProfile: () =>
    apiClient.get("/auth/me"),

  updateProfile: (data: FormData | { name?: string; email?: string }) =>
    apiClient.put("/auth/profile-update", data),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put("/users/password", data),

  deleteAccount: () =>
    apiClient.delete("/users/account"),

  /* ================= ADMIN ================= */
  getAllUsers: () =>
    apiClient.get("/admin/users"),

  getDashboardStats: () =>
    apiClient.get("/admin/dashboard/stats"),

};

/* =====================================================
   REVIEWS API
===================================================== */

export const reviewAPI = {
  getByListing: (listingId: string) =>
    apiClient.get<{ data: Review[] }>(`/reviews/listing/${listingId}`),

  create: (data: {
    listingId: string;
    rating: number;
    comment: string;
  }) => apiClient.post("/reviews", data),

  delete: (reviewId: string) =>
    apiClient.delete(`/reviews/${reviewId}`),
};

/* =====================================================
   SUPPORT API
===================================================== */

export const supportAPI = {
  create: (data: {
    name: string;
    email: string;
    subject: string; // ✅ Add this line
    message: string;
  }) => apiClient.post("/support", data),

  getAll: () => apiClient.get("/support"),

  reply: (id: string, data: { message: string }) => 
    apiClient.patch(`/support/${id}/reply`, data),

  getUserTickets: () => apiClient.get("/support/my-tickets"), // We will create this route
};

/* =====================================================
   WISHLIST API
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