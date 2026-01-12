
// import axios from "axios";
// import Cookies from "js-cookie";

// /* ================================
//    TYPES
// ================================ */

// export interface DashboardData {
//   total_pragas: number;
//   clima: {
//     temp_media: number;
//     umidade_media: number;
//     chuva_total: number;
//   };
//   produtividade: {
//     fazenda__nome: string;
//     media_produtividade: number;
//   }[];
// }

// export interface User {
//   id: number;
//   username: string;
//   email: string;
// }

// export interface Fazenda {
//   id: number;
//   nome: string;
//   latitude: number;
//   longitude: number;
//   localizacao: string;
// }

// export interface AuthResponse {
//   access: string;
//   refresh: string;
//   user: User;
// }

// /* ================================
//    AXIOS INSTANCE
// ================================ */

// const BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true,
// });

// // adiciona token na request
// api.interceptors.request.use((config) => {
//   const token = Cookies.get("access_token");

//   if (token && config.headers) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default api;

// /* ================================
//    API FUNCTIONS
// ================================ */

// export async function getDashboardData(): Promise<DashboardData> {
//   const response = await api.get<DashboardData>("/api/dashboard/");
//   return response.data;
// }




// =============================================================================
// API - Cliente HTTP e funções de API
// =============================================================================

import axios from "axios";
import Cookies from "js-cookie";
import type {
  DashboardData,
  Fazenda,
  FazendaCreate,
  Praga,
  PragaCreate,
  Notificacao,
  DadosClimaticos,
  DadosProdutividade,
  Mapa,
  User,
} from "../types";

// =============================================================================
// AXIOS INSTANCE
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Interceptor para adicionar token na request
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refresh_token");
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/api/auth/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access || response.data.access_token;
          if (newAccessToken) {
            Cookies.set("access_token", newAccessToken, { expires: 1 });
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh falhou, limpar cookies
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// =============================================================================
// DASHBOARD
// =============================================================================

export async function getDashboardData(): Promise<DashboardData> {
  const response = await api.get<DashboardData>("/api/dashboard/");
  return response.data;
}

// =============================================================================
// FAZENDAS
// =============================================================================

export async function getFazendas(): Promise<Fazenda[]> {
  const response = await api.get<Fazenda[]>("/api/fazendas/");
  return response.data;
}

export async function getFazenda(id: number): Promise<Fazenda> {
  const response = await api.get<Fazenda>(`/api/fazendas/${id}/`);
  return response.data;
}

export async function createFazenda(data: FazendaCreate): Promise<Fazenda> {
  const response = await api.post<Fazenda>("/api/fazendas/", data);
  return response.data;
}

export async function updateFazenda(id: number, data: Partial<FazendaCreate>): Promise<Fazenda> {
  const response = await api.patch<Fazenda>(`/api/fazendas/${id}/`, data);
  return response.data;
}

export async function deleteFazenda(id: number): Promise<void> {
  await api.delete(`/api/fazendas/${id}/`);
}

// Alias para compatibilidade
export const getFarms = getFazendas;

// =============================================================================
// PRAGAS
// =============================================================================

export async function getPragas(): Promise<Praga[]> {
  const response = await api.get<Praga[]>("/api/pragas/");
  return response.data;
}

export async function getPraga(id: number): Promise<Praga> {
  const response = await api.get<Praga>(`/api/pragas/${id}/`);
  return response.data;
}

export async function createPraga(data: PragaCreate): Promise<Praga> {
  const formData = new FormData();
  formData.append("fazenda", data.fazenda.toString());
  formData.append("nome", data.nome);
  formData.append("descricao", data.descricao);
  if (data.imagem) {
    formData.append("imagem", data.imagem);
  }
  if (data.status) {
    formData.append("status", data.status);
  }

  const response = await api.post<Praga>("/api/pragas/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updatePraga(id: number, data: Partial<PragaCreate>): Promise<Praga> {
  const response = await api.patch<Praga>(`/api/pragas/${id}/`, data);
  return response.data;
}

export async function deletePraga(id: number): Promise<void> {
  await api.delete(`/api/pragas/${id}/`);
}

// =============================================================================
// NOTIFICAÇÕES
// =============================================================================

export async function getNotificacoes(): Promise<Notificacao[]> {
  const response = await api.get<Notificacao[]>("/api/notificacoes/");
  return response.data;
}

export async function getNotificacoesRecentes(): Promise<Notificacao[]> {
  const response = await api.get<Notificacao[]>("/api/notificacoes/recentes/");
  return response.data;
}

export async function marcarNotificacaoLida(id: number): Promise<void> {
  await api.post(`/api/notificacoes/${id}/ler/`);
}

export async function marcarTodasLidas(): Promise<void> {
  await api.post("/api/notificacoes/ler-todas/");
}

// =============================================================================
// CLIMA
// =============================================================================

export async function getDadosClimaticos(fazendaId?: number): Promise<DadosClimaticos[]> {
  const url = fazendaId 
    ? `/api/clima/?fazenda=${fazendaId}` 
    : "/api/clima/";
  const response = await api.get<DadosClimaticos[]>(url);
  return response.data;
}

export async function getClimaAtual(fazendaId: number): Promise<DadosClimaticos> {
  const response = await api.get<DadosClimaticos>(`/api/clima/atual/${fazendaId}/`);
  return response.data;
}

// =============================================================================
// PRODUTIVIDADE
// =============================================================================

export async function getDadosProdutividade(fazendaId?: number): Promise<DadosProdutividade[]> {
  const url = fazendaId 
    ? `/api/produtividade/?fazenda=${fazendaId}` 
    : "/api/produtividade/";
  const response = await api.get<DadosProdutividade[]>(url);
  return response.data;
}

// =============================================================================
// MAPAS
// =============================================================================

export async function getMapas(): Promise<Mapa[]> {
  const response = await api.get<Mapa[]>("/api/mapas/");
  return response.data;
}

export async function getMapa(id: number): Promise<Mapa> {
  const response = await api.get<Mapa>(`/api/mapas/${id}/`);
  return response.data;
}

// =============================================================================
// USUÁRIOS (Admin)
// =============================================================================

export async function getUsers(): Promise<User[]> {
  const response = await api.get<User[]>("/api/usuarios/");
  return response.data;
}

export async function getUser(id: number): Promise<User> {
  const response = await api.get<User>(`/api/usuarios/${id}/`);
  return response.data;
}

export async function createUser(data: Partial<User> & { password: string }): Promise<User> {
  const response = await api.post<User>("/api/usuarios/", data);
  return response.data;
}

export async function updateUser(id: number, data: Partial<User>): Promise<User> {
  const response = await api.patch<User>(`/api/usuarios/${id}/`, data);
  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/usuarios/${id}/`);
}