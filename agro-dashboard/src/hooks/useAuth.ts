'use client';

import { useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '../lib/api'; 
import type { User, LoginData, RegisterData, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// AUTH CONTEXT (será usado no AuthProvider)
// ============================================================================

import { createContext } from 'react';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// useAuth Hook
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

// ============================================================================
// useAuthState Hook (lógica pura para ser usada no Provider)
// ============================================================================

export function useAuthState() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Carregar usuário ao montar
  const loadUser = useCallback(async () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // GET /api/auth/me/ retorna usuário atual
      const response = await api.get<{ user?: User; data?: User }>('/api/auth/me/');
      const userData = response.data.user || response.data.data || response.data as any;
      
      if (userData && userData.id) {
        setUser(userData as User);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      console.error('Erro ao carregar usuário:', err);
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Login
  const login = useCallback(async (credentials: LoginData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<AuthResponse>('/api/auth/login/', {
        email: credentials.email,
        password: credentials.password,
      });

      const { access, access_token, refresh, refresh_token, user: userData } = response.data;
      
      // Salvar tokens em cookies (backend já faz, mas fazemos manual também)
      const accessToken = access || access_token;
      const refreshToken = refresh || refresh_token;
      
      if (accessToken) {
        Cookies.set('access_token', accessToken, { 
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }
      
      if (refreshToken) {
        Cookies.set('refresh_token', refreshToken, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }

      // Salvar usuário
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Se não veio user na resposta, tentar carregar
        await loadUser();
      }

      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Erro ao fazer login';
      setError(errorMsg);
      setIsAuthenticated(false);
      setUser(null);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [router, loadUser]);

  // ✅ Register
  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/api/auth/register/', {
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.name || '',
      });

      // Após registrar, fazer login automático
      await login({ email: data.email, password: data.password });
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.email?.[0] || 'Erro ao registrar';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [login, router]);

  // ✅ Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Chamar endpoint de logout (opcional, o backend pode apenas fechar sessão)
      try {
        await api.post('/api/auth/logout/', {});
      } catch (e) {
        // Mesmo que falhe, remover tokens localmente
      }

      // Limpar estado local
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);

      router.push('/login');
    } catch (err: any) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // ✅ Refresh do usuário (recarregar dados)
  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  // ✅ Carregar usuário ao montar
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    refreshUser,
  };
}
