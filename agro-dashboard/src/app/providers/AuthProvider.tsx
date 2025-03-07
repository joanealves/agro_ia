"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ["/login", "/register"];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async (): Promise<boolean> => {
    try {
      const userData = await getCurrentUser();
      if (userData) {
        setUser({
          ...userData,
          role: userData.role as "admin" | "user",
        });
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Erro ao verificar usuário:", error);
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (!initializing) return;
      setInitializing(false);
      setLoading(true);

      try {
        const isAuthenticated = await checkAuth();
        const isPublicRoute = publicRoutes.some((route) =>
          pathname?.startsWith(route)
        );

        if (!isAuthenticated && !isPublicRoute) {
          router.replace("/login");
        } else if (isAuthenticated && isPublicRoute && pathname !== "/register") {
          if (user?.role === "admin") {
            router.replace("/admin");
          } else {
            router.replace("/dashboard");
          }
        }
      } catch (error) {
        console.error("Erro na inicialização do auth:", error);
        if (!publicRoutes.some((route) => pathname?.startsWith(route))) {
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [pathname]);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const data = await loginUser({ email, password });

      if (data.user) {
        setUser(data.user);
      } else {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      }

      if (user?.role === "admin" || data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  const contextValue = useMemo(
    () => ({ user, loading, login, logout, checkAuth }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
