import { api } from './api';
import axios from 'axios';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function loginUser(data: LoginData) {
  try {
    const response = await api.post('/auth/login/', data);
    
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }
      await getCurrentUser(); // Buscar dados do usuário após login
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Falha na autenticação');
    }
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get('/auth/me/');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Tentar refresh token antes de logout
      try {
        await refreshToken();
        const retryResponse = await api.get('/auth/me/');
        return retryResponse.data;
      } catch (refreshError) {
        await logoutUser();
        return null;
      }
    }
    return null;
  }
}

export async function refreshToken() {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) throw new Error('No refresh token');

  try {
    const response = await api.post('/auth/refresh/', { refresh });
    localStorage.setItem('token', response.data.access);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function logoutUser() {
  try {
    await api.post('/auth/logout/');
  } catch (error) {
    console.error('Erro no logout:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}
