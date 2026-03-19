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
  phone?: string;
  role: "user" | "pg_owner" | "admin"; 
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
// 1️⃣ logout first
const logout = useCallback(() => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  setUser(null);
  window.location.href = "/login";
}, []);

// 2️⃣ then loadUser
// AuthContext.tsx ke loadUser ko isse replace karein
const loadUser = useCallback(async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const res = await authAPI.getMe();
    
    // Yahan check karein: Agar backend 'fullName' bhej raha hai toh use 'name' mein map karein
    const apiData = res.data?.data?.user || res.data?.user || res.data?.data;
    
    const userData: User = {
      id: apiData._id || apiData.id,
      name: apiData.name || apiData.fullName || "User", // Fallback chain
      email: apiData.email,
      role: apiData.role,
      phone: apiData.phone
    };

    if (userData.id) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  } catch (err: any) {
    if (err.response?.status === 401) logout();
  } finally {
    setLoading(false);
  }
}, [logout]);
// 3️⃣ then useEffect
useEffect(() => {
  loadUser();
}, [loadUser]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const userData = res.data?.data?.user || res.data?.user;
      const accessToken = res.data?.data?.accessToken || res.data?.accessToken;

      if (userData && accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
      throw new Error("Invalid login response");
    } finally {
      setLoading(false);
    }
  };

  const register = useCallback(async (data: any) => {
    setLoading(true);
    try {
      const res = await authAPI.register(data);
      const responseData = res.data?.data || res.data;
      const { user: userData, accessToken } = responseData;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }
    } finally {
      setLoading(false);
    }
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
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};