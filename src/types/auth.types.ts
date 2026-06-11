export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "user" | "pg_owner";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "pg_owner" | "admin";
}

export interface RefreshResponse {
  data: {
    accessToken: string;
    refreshToken?: string;
  };
}