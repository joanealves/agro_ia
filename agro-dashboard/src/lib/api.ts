// =============================================================================
// API - Cliente HTTP - Versão Simplificada (Axios 1.8+ compatível)
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
// CONFIGURAÇÃO BASE
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// =============================================================================
// INTERCEPTORS
// =============================================================================

// Adiciona token em todas as requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Trata erros e faz refresh do token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se 401 e não é retry, tenta refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refresh_token");
        if (refreshToken) {
          const { data } = await axios.post(`${BASE_URL}/api/auth/refresh/`, {
            refresh: refreshToken,
          });

          const newToken = data.access || data.access_token;
          if (newToken) {
            Cookies.set("access_token", newToken, { expires: 1 });
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// =============================================================================
// HELPER - Log de erros
// =============================================================================

function logError(context: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(`[${context}] ${error.response?.status}:`, error.response?.data);
  } else {
    console.error(`[${context}]`, error);
  }
}

// =============================================================================
// DASHBOARD
// =============================================================================

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const { data } = await api.get<DashboardData>("/api/dashboard/");
    return data;
  } catch (error) {
    logError("getDashboardData", error);
    return {
      alertas: 0,
      total_irrigacoes: 0,
      total_pragas: 0,
      total_fazendas: 0,
      total_notificacoes: 0,
      clima: { temp_media: 0, umidade_media: 0, chuva_total: 0 },
      produtividade: [],
    };
  }
}

// =============================================================================
// FAZENDAS - /api/fazenda/fazendas/
// =============================================================================

export async function getFazendas(): Promise<Fazenda[]> {
  try {
    const { data } = await api.get<Fazenda[]>("/api/fazenda/fazendas/");
    return data;
  } catch (error) {
    logError("getFazendas", error);
    return [];
  }
}

export async function getFazenda(id: number): Promise<Fazenda | null> {
  try {
    const { data } = await api.get<Fazenda>(`/api/fazenda/fazendas/${id}/`);
    return data;
  } catch (error) {
    logError("getFazenda", error);
    return null;
  }
}

export async function createFazenda(fazenda: FazendaCreate): Promise<Fazenda> {
  const { data } = await api.post<Fazenda>("/api/fazenda/fazendas/", fazenda);
  return data;
}

export async function updateFazenda(id: number, fazenda: Partial<FazendaCreate>): Promise<Fazenda> {
  const { data } = await api.patch<Fazenda>(`/api/fazenda/fazendas/${id}/`, fazenda);
  return data;
}

export async function deleteFazenda(id: number): Promise<void> {
  await api.delete(`/api/fazenda/fazendas/${id}/`);
}

export const getFarms = getFazendas;

// =============================================================================
// PRAGAS - /api/pragas/list/ e /api/pragas/upload/
// =============================================================================

export async function getPragas(): Promise<Praga[]> {
  try {
    const { data } = await api.get("/api/pragas/list/");
    return data.results ?? [];
  } catch (error) {
    logError("getPragas", error);
    return [];
  }
}


export async function getPraga(id: number): Promise<Praga | null> {
  try {
    const { data } = await api.get<Praga>(`/api/pragas/list/${id}/`);
    return data;
  } catch (error) {
    logError("getPraga", error);
    return null;
  }
}

export async function createPraga(praga: PragaCreate): Promise<Praga> {
  const formData = new FormData();
  formData.append("fazenda", praga.fazenda.toString());
  formData.append("nome", praga.nome);
  formData.append("descricao", praga.descricao);
  if (praga.imagem) formData.append("imagem", praga.imagem);
  if (praga.status) formData.append("status", praga.status);

  const { data } = await api.post<Praga>("/api/pragas/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updatePraga(id: number, praga: Partial<PragaCreate>): Promise<Praga> {
  const { data } = await api.patch<Praga>(`/api/pragas/${id}/`, praga);
  return data;
}

export async function updatePragaStatus(id: number, status: "pendente" | "resolvido"): Promise<void> {
  await api.patch(`/api/pragas/${id}/atualizar_status/`, { status });
}

export async function deletePraga(id: number): Promise<void> {
  await api.delete(`/api/pragas/${id}/`);
}

// =============================================================================
// NOTIFICAÇÕES - /api/notificacoes/notificacoes/
// =============================================================================

export async function getNotificacoes(): Promise<Notificacao[]> {
  try {
    const { data } = await api.get<Notificacao[]>("/api/notificacoes/notificacoes/");
    return data;
  } catch (error) {
    logError("getNotificacoes", error);
    return [];
  }
}

export async function getNotificacoesRecentes(limit = 5): Promise<Notificacao[]> {
  try {
    const { data } = await api.get<Notificacao[]>(`/api/notificacoes/notificacoes/?limit=${limit}`);
    return data;
  } catch (error) {
    logError("getNotificacoesRecentes", error);
    return [];
  }
}

export async function marcarNotificacaoLida(id: number): Promise<void> {
  await api.post(`/api/notificacoes/notificacoes/${id}/ler/`);
}

export async function marcarTodasLidas(): Promise<void> {
  const notificacoes = await getNotificacoes();
  await Promise.all(notificacoes.filter((n) => !n.lida).map((n) => marcarNotificacaoLida(n.id)));
}

// =============================================================================
// CLIMA / IRRIGAÇÃO - /api/irrigacao/
// =============================================================================

export async function getDadosClimaticos(fazendaId?: number): Promise<DadosClimaticos[]> {
  try {
    const url = fazendaId ? `/api/irrigacao/clima/?fazenda=${fazendaId}` : "/api/irrigacao/clima/";
    const { data } = await api.get<DadosClimaticos[]>(url);
    return data;
  } catch (error) {
    logError("getDadosClimaticos", error);
    return [];
  }
}

export async function getClimaAtual(fazendaId: number): Promise<DadosClimaticos | null> {
  try {
    const { data } = await api.get<DadosClimaticos>(`/api/irrigacao/clima/?fazenda=${fazendaId}&latest=true`);
    return data;
  } catch (error) {
    logError("getClimaAtual", error);
    return null;
  }
}

export async function getSugestaoIrrigacao(fazendaId: number): Promise<{ sugestao: string }> {
  try {
    const { data } = await api.get<{ sugestao: string }>(`/api/irrigacao/sugestao-irrigacao/${fazendaId}/`);
    return data;
  } catch (error) {
    logError("getSugestaoIrrigacao", error);
    return { sugestao: "Sem dados disponíveis" };
  }
}

// =============================================================================
// PRODUTIVIDADE - /api/produtividade/list/
// =============================================================================

export async function getDadosProdutividade(fazendaId?: number): Promise<DadosProdutividade[]> {
  try {
    const url = fazendaId ? `/api/produtividade/list/?fazenda=${fazendaId}` : "/api/produtividade/list/";
    const { data } = await api.get<DadosProdutividade[]>(url);
    return data;
  } catch (error) {
    logError("getDadosProdutividade", error);
    return [];
  }
}

export async function createDadosProdutividade(dados: {
  fazenda: number;
  cultura: string;
  area: number;
  produtividade: number;
  data: string;
}): Promise<DadosProdutividade> {
  const { data } = await api.post<DadosProdutividade>("/api/produtividade/dados/", dados);
  return data;
}

export async function getProdutividadeSeriesTemporal(fazendaId?: number): Promise<{ dados: Array<{ data: string; produtividade: number }> }> {
  try {
    const url = fazendaId
      ? `/api/dashboard/produtividade/${fazendaId}/serie-temporal/`
      : "/api/produtividade/serie-temporal/";
    const { data } = await api.get<{ dados: Array<{ data: string; produtividade: number }> }>(url);
    return data;
  } catch (error) {
    logError("getProdutividadeSeriesTemporal", error);
    return { dados: [] };
  }
}

// =============================================================================
// MAPAS - /api/maps/fazenda/{fazenda_id}/mapas/
// =============================================================================

export async function getMapas(fazendaId: number): Promise<Mapa[]> {
  try {
    const { data } = await api.get<Mapa[]>(`/api/maps/fazenda/${fazendaId}/mapas/`);
    return data;
  } catch (error) {
    logError("getMapas", error);
    return [];
  }
}

export const getMapasPorFazenda = getMapas;

export async function createMapa(fazendaId: number, mapa: { nome: string; latitude: number; longitude: number; zoom: number }): Promise<Mapa> {
  const { data } = await api.post<Mapa>(`/api/maps/fazenda/${fazendaId}/mapas/`, mapa);
  return data;
}

export async function getTodosMapas(): Promise<Mapa[]> {
  try {
    const fazendas = await getFazendas();
    const mapas = await Promise.all(fazendas.map((f) => getMapas(f.id)));
    return mapas.flat();
  } catch (error) {
    logError("getTodosMapas", error);
    return [];
  }
}

// =============================================================================
// USUÁRIOS - /api/usuarios/
// =============================================================================

export async function getUsers(): Promise<User[]> {
  try {
    const { data } = await api.get<User[]>("/api/usuarios/");
    return data;
  } catch (error) {
    logError("getUsers", error);
    return [];
  }
}

export async function getUser(id: number): Promise<User | null> {
  try {
    const { data } = await api.get<User>(`/api/usuarios/${id}/`);
    return data;
  } catch (error) {
    logError("getUser", error);
    return null;
  }
}

export async function createUser(user: Partial<User> & { password: string }): Promise<User> {
  const { data } = await api.post<User>("/api/usuarios/", user);
  return data;
}

export async function updateUser(id: number, user: Partial<User>): Promise<User> {
  const { data } = await api.patch<User>(`/api/usuarios/${id}/`, user);
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/usuarios/${id}/`);
}

// =============================================================================
// IRRIGAÇÃO - Sistemas
// =============================================================================

export interface Irrigacao {
  id: number;
  fazenda: number;
  nome: string;
  status: "ativo" | "inativo";
}

export async function getIrrigacoes(fazendaId?: number): Promise<Irrigacao[]> {
  try {
    const url = fazendaId ? `/api/irrigacao/?fazenda=${fazendaId}` : "/api/irrigacao/";
    const { data } = await api.get<Irrigacao[]>(url);
    return data;
  } catch (error) {
    logError("getIrrigacoes", error);
    return [];
  }
}

export async function updateIrrigacaoStatus(id: number, status: "ativo" | "inativo"): Promise<void> {
  await api.patch(`/api/irrigacao/${id}/atualizar_status/`, { status });
}