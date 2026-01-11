"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { getCurrentUser, loginUser, logoutUser } from "../../lib/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ só carrega usuário
  const refreshUser = async () => {
    try {
      const token = Cookies.get("access_token");
      if (!token) {
        setUser(null);
        return;
      }

      const data = await getCurrentUser();
      setUser(data ?? null);
    } catch {
      setUser(null);
    }
  };

  // ✅ roda uma vez ao iniciar a app
  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  // ✅ login só faz login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      if (data?.user) setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  // ✅ logout só limpa estado
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } finally {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      setUser(null);
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshUser }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
