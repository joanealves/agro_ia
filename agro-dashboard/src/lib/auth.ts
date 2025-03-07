import api from './api';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

export interface LoginData {
  email: string;  
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  username: string;
}

interface LoginResponse {
  access_token?: string;
  access?: string;
  refresh_token?: string;
  refresh?: string;
  user?: User;
}

interface RefreshResponse {
  access?: string;
  access_token?: string;
}

// Interface para mensagens de erro da API
interface ApiErrorResponse {
  detail?: string;
}

export async function loginUser(data: LoginData): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/api/auth/login/', {
      email: data.email,
      password: data.password
    });

    // Extrair tokens da resposta (podem vir com nomes diferentes)
    const accessToken = response.data.access_token || response.data.access;
    const refreshToken = response.data.refresh_token || response.data.refresh;

    if (accessToken) {
      Cookies.set("access_token", accessToken, { 
        expires: 1, // 1 dia
        secure: typeof window !== 'undefined' && window.location.protocol === 'https:', 
        sameSite: "strict" 
      });
    }
    
    if (refreshToken) {
      Cookies.set("refresh_token", refreshToken, { 
        expires: 7, // 7 dias
        secure: typeof window !== 'undefined' && window.location.protocol === 'https:', 
        sameSite: "strict" 
      });
    }

    return response.data;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

export async function registerUser(data: RegisterData): Promise<User> {
  try {
    const response = await api.post<User>('/api/auth/register/', data);
    return response.data;
  } catch (error: unknown) {
    // Com TypeScript moderno, precisamos fazer verificação de tipo primeiro
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      // Agora podemos usar a verificação seguramente com a função helper
      throw new Error(error.response?.data?.detail || 'Falha no registro');
    }
    // Para outros tipos de erros
    throw error instanceof Error ? error : new Error('Falha no registro');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<User>('/api/auth/me/');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
}

export async function refreshToken(): Promise<RefreshResponse> {
  try {
    const refreshTokenValue = Cookies.get("refresh_token");
    
    if (!refreshTokenValue) {
      throw new Error("Refresh token não encontrado");
    }
    
    const apiUrl = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await axios.post<RefreshResponse>(
      `${apiUrl}/api/auth/refresh/`,
      { refresh: refreshTokenValue },
      { withCredentials: true }
    );
    
    // Extrair o novo token de acesso (pode vir como access ou access_token)
    const newAccessToken = response.data.access || response.data.access_token;
    
    if (newAccessToken) {
      Cookies.set('access_token', newAccessToken, { 
        expires: 1, 
        secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
        sameSite: "strict"
      });
      
      return response.data;
    } else {
      throw new Error("Token de acesso não encontrado na resposta");
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    // Remover tokens em caso de erro
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await api.post('/api/auth/logout/', {}, {
      withCredentials: true 
    });
  } catch (error) {
    console.error('Erro no logout:', error);
  } finally {
    // Mesmo em caso de erro na API, remover os cookies
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  }
}
