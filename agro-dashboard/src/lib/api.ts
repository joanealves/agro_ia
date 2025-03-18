
import axios from 'axios';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import Cookies from "js-cookie";

// Verificação de ambiente para evitar erros com 'process'
const BASE_URL = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL 
  : "http://localhost:8000";

// Aviso de fallback apenas em ambiente de desenvolvimento
if (typeof process !== 'undefined' && process.env && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn("⚠️ Atenção: NEXT_PUBLIC_API_URL não está definida! Usando 'http://localhost:8000' como fallback.");
}


const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, 
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Interceptor para adicionar token de autenticação em cada requisição
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros e renovar token quando necessário
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Guarda a configuração da requisição original
    const originalRequest = error.config;
    
    // Verifica se é erro 401 (não autorizado) e não é uma tentativa de login ou refresh
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/login/') &&
      !originalRequest.url?.includes('/api/auth/refresh/')
    ) {
      originalRequest._retry = true;
      
      try {
        console.log("🔄 Tentando renovar o token...");
        const refreshToken = Cookies.get("refresh_token");
        
        if (!refreshToken) {
          // Se não tiver refresh token, precisa fazer login novamente
          throw new Error("Refresh token não encontrado");
        }
        
        const refreshResponse = await axios.post(
          `${BASE_URL}/api/auth/refresh/`,
          { refresh: refreshToken },
          { withCredentials: true }
        );
        
        // Extrair o novo token de acesso (pode vir como access ou access_token)
        const newAccessToken = refreshResponse.data.access || refreshResponse.data.access_token;
        
        if (newAccessToken) {
          // Atualizar o cookie com o novo token
          Cookies.set("access_token", newAccessToken, {
            expires: 1, // 1 dia
            secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
            sameSite: "strict"
          });
          
          // Atualizar o cabeçalho da requisição original
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Tentar a requisição original novamente
          return axios(originalRequest);
        } else {
          throw new Error("Novo token de acesso não encontrado na resposta");
        }
      } catch (refreshError) {
        console.error("❌ Erro ao renovar token:", refreshError);
        
        // Limpar os tokens
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        
        // Redirecionar para a página de login
        if (typeof window !== 'undefined') {
          window.location.href = "/login";
        }
      }
    }
    
    // Se não for erro 401 ou não for possível renovar o token, rejeitar a promessa
    return Promise.reject(error);
  }
);

// Funções de API

export async function getDashboardData() {
  try {
    const response = await api.get("/api/dashboard/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    throw error;
  }
}

export async function getUsers() {
  try {
    const response = await api.get("/api/usuarios/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw error;
  }
}

export async function createUser(userData: {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: string;
}) {
  try {
    const response = await api.post("/api/auth/register/", userData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
}

export async function updateUser(id: string | number, userData: Record<string, any>) {
  try {
    const response = await api.put(`/api/usuarios/${id}/`, userData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw error;
  }
}

export async function deleteUser(id: string | number) {
  try {
    const response = await api.delete(`/api/usuarios/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    throw error;
  }
}

export default api;