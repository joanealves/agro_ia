"use client";

import { createContext, useContext, useEffect, useState } from "react";
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

// Rotas que não precisam de autenticação
const publicRoutes = ['/login', '/register'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Função para verificar se o usuário está autenticado
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

  // Verificação de autenticação e redirecionamento baseado na rota
  useEffect(() => {
    const initialize = async () => {
      if (!initializing) return;
      setInitializing(false);
      setLoading(true);
      
      try {
        // Verificar se o usuário está autenticado
        const isAuthenticated = await checkAuth();
        
        // Verificar se a rota atual é pública
        const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
        
        // Lógica de redirecionamento
        if (!isAuthenticated && !isPublicRoute) {
          // Se não estiver autenticado e a rota não for pública, redireciona para login
          console.log("Usuário não autenticado, redirecionando para login...");
          router.replace("/login");
        } else if (isAuthenticated && isPublicRoute && pathname !== '/register') {
          // Se autenticado e em rota pública (exceto registro), redirecione para dashboard/admin
          if (user?.role === 'admin') {
            router.replace("/admin");
          } else {
            router.replace("/dashboard");
          }
        }
      } catch (error) {
        console.error("Erro na inicialização do auth:", error);
        // Em caso de erro em rotas protegidas, redireciona para login
        if (!publicRoutes.some(route => pathname?.startsWith(route))) {
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [pathname]);

  // Função de login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      
      // Verificar se a resposta contém dados do usuário
      if (data.user) {
        setUser(data.user);
      } else {
        // Se o login for bem-sucedido mas não retornar dados do usuário,
        // buscar os dados do usuário separadamente
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      }
      
      // Redirecionar com base no papel do usuário
      if (user?.role === 'admin' || data.user?.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      
      return data;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo em caso de erro, redireciona para login
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};