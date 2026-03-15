import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "@/services/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Added phone for profile consistency
  role: "user" | "pg_owner" | "admin"; 
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // ADDED THIS
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      // Check both keys to match your api.ts interceptor
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await authAPI.getMe();
      const userData = res.data?.data?.user || res.data?.data || res.data?.user;

      if (userData) {
        setUser(userData);
        // Sync localStorage with fresh data from server
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        throw new Error("No user data found");
      }
    } catch (err) {
      console.error("Auth initialization failed:", err);
      // Don't clear everything on a single failed network request, 
      // only if it's a 401 Unauthorized
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      
      const userData = res.data?.data?.user || res.data?.user;
      const accessToken = res.data?.data?.accessToken || res.data?.accessToken;
      const refreshToken = res.data?.data?.refreshToken || res.data?.refreshToken;

      if (!userData || !accessToken) throw new Error("Invalid server response");

      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      return userData; 
    } catch (error) {
      setUser(null);
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  const register = useCallback(async (data: any) => {
    setLoading(true);
    try {
      const res = await authAPI.register(data);
      const responseData = res.data?.data || res.data;
      const { user: userData, accessToken, refreshToken } = responseData;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        isAuthenticated: !!user, 
        setUser, // EXPOSED HERE
        login, 
        register, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};