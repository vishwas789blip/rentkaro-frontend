import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "@/services/api";

/* =====================================================
   Types
===================================================== */

export interface User {
  id:     string;
  name:   string;
  email:  string;
  phone?: string;
  role:   "user" | "pg_owner" | "admin";
}

interface AuthContextType {
  user:            User | null;
  loading:         boolean;
  isAuthenticated: boolean;
  setUser:         React.Dispatch<React.SetStateAction<User | null>>;
  login:           (email: string, password: string) => Promise<User>;
  register:        (data: any) => Promise<{ email: string }>;
  logout:          () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

/* =====================================================
   Helper — parse user from API response
===================================================== */

function parseUser(apiData: any): User | null {
  if (!apiData) return null;
  const id = apiData._id || apiData.id;
  if (!id) return null;
  return {
    id,
    name:  apiData.name  || "User",
    email: apiData.email,
    role:  apiData.role,
    phone: apiData.phone,
  };
}

/* =====================================================
   Provider
===================================================== */

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  // Hydrate from localStorage on first render (avoids flash)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  /* ── logout ── */
  const logout = useCallback(() => {
    authAPI.logout().catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  }, []);

  /* ── loadUser — silently verify on app start ── */
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res     = await authAPI.getMe();
      const apiData = res.data?.data?.user || res.data?.user || res.data?.data;
      const parsed  = parseUser(apiData);

      if (parsed) {
        setUser(parsed);
        localStorage.setItem("user", JSON.stringify(parsed));
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setUser(null);
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /* ── login ── */
  const login = async (email: string, password: string): Promise<User> => {
    const res = await authAPI.login({ email, password });

    const data         = res.data?.data;
    const userData     = data?.user;
    const accessToken  = data?.accessToken;
    const refreshToken = data?.refreshToken;

    if (!userData || !accessToken) {
      throw new Error("Invalid login response from server");
    }

    const parsed = parseUser(userData);
    if (!parsed) throw new Error("Could not parse user data");

    localStorage.setItem("accessToken",  accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(parsed));
    setUser(parsed);

    return parsed;
  };

  /* ── register ── */
  const register = useCallback(async (data: any): Promise<{ email: string }> => {
    const res   = await authAPI.register(data);
    const email = res.data?.email || data.email;
    // No tokens at this stage — user must verify OTP first
    return { email };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
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