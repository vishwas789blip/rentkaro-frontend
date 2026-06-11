import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import { authAPI } from "@/api/auth.api";
import {
  UserProfile,
  RegisterData,
} from "@/types/auth.types";

/* =========================================
   Types
========================================= */

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;

  setUser: React.Dispatch<
    React.SetStateAction<UserProfile | null>
  >;

  login: (
    email: string,
    password: string
  ) => Promise<UserProfile>;

  register: (
    data: RegisterData
  ) => Promise<{ email: string }>;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

/* =========================================
   Hook
========================================= */

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

/* =========================================
   Helper
========================================= */

const parseUser = (
  userData: any
): UserProfile | null => {
  if (!userData) return null;

  return {
    id:
      userData._id ||
      userData.id,
    name:
      userData.name ||
      "User",
    email:
      userData.email,
    phone:
      userData.phone,
    role:
      userData.role,
  };
};

/* =========================================
   Provider
========================================= */

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] =
    useState<UserProfile | null>(
      () => {
        try {
          const stored =
            localStorage.getItem(
              "user"
            );

          return stored
            ? JSON.parse(stored)
            : null;
        } catch {
          return null;
        }
      }
    );

  const [loading, setLoading] =
    useState(true);

  /* =========================================
     Load User
  ========================================= */

  const loadUser =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          "accessToken"
        );

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response =
          await authAPI.getMe();

        const apiUser =
          response.data?.data
            ?.user ||
          response.data?.user ||
          response.data?.data;

        const parsed =
          parseUser(apiUser);

        if (!parsed) {
          throw new Error(
            "Invalid user"
          );
        }

        setUser(parsed);

        localStorage.setItem(
          "user",
          JSON.stringify(parsed)
        );
      } catch {
        setUser(null);

        localStorage.removeItem(
          "user"
        );

        localStorage.removeItem(
          "accessToken"
        );

        localStorage.removeItem(
          "refreshToken"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /* =========================================
     Login
  ========================================= */

  const login = async (
    email: string,
    password: string
  ): Promise<UserProfile> => {
    const response =
      await authAPI.login({
        email,
        password,
      });

    const data =
      response.data?.data;

    const accessToken =
      data?.accessToken;

    const refreshToken =
      data?.refreshToken;

    const parsed =
      parseUser(data?.user);

    if (
      !parsed ||
      !accessToken
    ) {
      throw new Error(
        "Invalid login response"
      );
    }

    localStorage.setItem(
      "accessToken",
      accessToken
    );

    if (refreshToken) {
      localStorage.setItem(
        "refreshToken",
        refreshToken
      );
    }

    localStorage.setItem(
      "user",
      JSON.stringify(parsed)
    );

    setUser(parsed);

    return parsed;
  };

  /* =========================================
     Register
  ========================================= */

  const register =
    async (
      data: RegisterData
    ): Promise<{
      email: string;
    }> => {
      const response =
        await authAPI.register(
          data
        );

      return {
        email:
          response.data
            ?.email ??
          data.email,
      };
    };

  /* =========================================
     Logout
  ========================================= */

  const logout =
    async (): Promise<void> => {
      try {
        await authAPI.logout();
      } catch {}

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "refreshToken"
      );

      localStorage.removeItem(
        "user"
      );

      setUser(null);

      window.location.href =
        "/login";
    };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated:
          !!user,
        setUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};