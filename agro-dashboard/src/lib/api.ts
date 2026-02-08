import axios, { AxiosResponse } from "axios";
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
  Irrigacao,
  PaginatedResponse,
} from "../types";

// =============================================================================
// CONFIGURAÇÃO DO AXIOS
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Helper para log de erros
function logError(context: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(`[${context}] ${error.response?.status}:`, error.response?.data);
  } else {
    console.error(`[${context}]`, error);
  }
}

// Helper para extrair dados de resposta (array ou paginado)
// CORREÇÃO: Tipagem explícita para evitar inferência de 'never'
function extractData<T>(data: T[] | PaginatedResponse<T> | unknown): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'results' in data) {
    return (data as PaginatedResponse<T>).results || [];
  }
  return [];
}

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh de token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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
// DASHBOARD - /api/dashboard/
// =============================================================================

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const { data } = await api.get<DashboardData>("/api/dashboard/");
    return data;
  } catch (error) {
    logError("getDashboardData", error);
    // Retorna dados padrão em caso de erro
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
// NOTA: Backend expõe em /api/fazenda/, ViewSet registra como /fazendas/
// =============================================================================

export async function getFazendas(): Promise<Fazenda[]> {
  try {
    const response: AxiosResponse = await api.get("/api/fazenda/fazendas/");
    return extractData<Fazenda>(response.data);
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

// Alias para compatibilidade
export const getFarms = getFazendas;

// =============================================================================
// PRAGAS - /api/pragas/
// NOTA: Backend usa 'nivel' (baixo/medio/alto), não 'status'
// =============================================================================

export async function getPragas(fazendaId?: number): Promise<Praga[]> {
  try {
    const url = fazendaId 
      ? `/api/pragas/?fazenda=${fazendaId}` 
      : "/api/pragas/";
    const response: AxiosResponse = await api.get(url);
    return extractData<Praga>(response.data);
  } catch (error) {
    logError("getPragas", error);
    return [];
  }
}

export async function getPraga(id: number): Promise<Praga | null> {
  try {
    const { data } = await api.get<Praga>(`/api/pragas/${id}/`);
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
  formData.append("descricao", praga.descricao || "");
  // CORREÇÃO: Backend espera 'nivel', não 'status'
  formData.append("nivel", praga.nivel || "baixo");
  
  if (praga.imagem && praga.imagem instanceof File) {
    formData.append("imagem", praga.imagem);
  }

  const { data } = await api.post<Praga>("/api/pragas/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updatePraga(id: number, praga: Partial<PragaCreate>): Promise<Praga> {
  // Converter 'status' para 'nivel' se necessário
  const payload: Record<string, unknown> = { ...praga };
  if ('status' in praga && !('nivel' in praga)) {
    payload.nivel = praga.status;
    delete payload.status;
  }
  
  const { data } = await api.patch<Praga>(`/api/pragas/${id}/`, payload);
  return data;
}

export async function deletePraga(id: number): Promise<void> {
  await api.delete(`/api/pragas/${id}/`);
}

// =============================================================================
// NOTIFICAÇÕES - /api/notificacoes/
// =============================================================================

export async function getNotificacoes(): Promise<Notificacao[]> {
  try {
    const response: AxiosResponse = await api.get("/api/notificacoes/");
    return extractData<Notificacao>(response.data);
  } catch (error) {
    logError("getNotificacoes", error);
    return [];
  }
}

export async function getNotificacoesRecentes(limit = 5): Promise<Notificacao[]> {
  try {
    const response: AxiosResponse = await api.get(`/api/notificacoes/?limit=${limit}&ordering=-enviada_em`);
    return extractData<Notificacao>(response.data);
  } catch (error) {
    logError("getNotificacoesRecentes", error);
    return [];
  }
}

export async function getNotificacoesNaoLidas(): Promise<number> {
  try {
    const notificacoes = await getNotificacoes();
    return notificacoes.filter(n => !n.lida).length;
  } catch (error) {
    logError("getNotificacoesNaoLidas", error);
    return 0;
  }
}

export async function marcarNotificacaoLida(id: number): Promise<void> {
  await api.patch(`/api/notificacoes/${id}/`, { lida: true });
}

export async function marcarTodasLidas(): Promise<void> {
  const notificacoes = await getNotificacoes();
  await Promise.all(
    notificacoes.filter(n => !n.lida).map(n => marcarNotificacaoLida(n.id))
  );
}

// =============================================================================
// CLIMA - /api/irrigacao/clima/ (dados climáticos estão no módulo irrigação)
// =============================================================================

export async function getDadosClimaticos(fazendaId?: number): Promise<DadosClimaticos[]> {
  try {
    const url = fazendaId
      ? `/api/irrigacao/clima/historico/?fazenda=${fazendaId}`
      : "/api/irrigacao/clima/historico/";
    const response: AxiosResponse = await api.get(url);
    return extractData<DadosClimaticos>(response.data);
  } catch (error) {
    logError("getDadosClimaticos", error);
    return [];
  }
}

export async function getClimaAtual(fazendaId: number): Promise<DadosClimaticos | null> {
  try {
    const { data } = await api.get<DadosClimaticos>(`/api/irrigacao/clima/atual/${fazendaId}/`);
    return data;
  } catch (error) {
    logError("getClimaAtual", error);
    return null;
  }
}

export async function getClimaResumo(): Promise<{ temp_media: number; umidade_media: number; chuva_total: number }> {
  try {
    const { data } = await api.get("/api/irrigacao/clima/resumo/");
    return data;
  } catch (error) {
    logError("getClimaResumo", error);
    return { temp_media: 0, umidade_media: 0, chuva_total: 0 };
  }
}

// =============================================================================
// IRRIGAÇÃO - /api/irrigacao/
// =============================================================================

export async function getIrrigacoes(fazendaId?: number): Promise<Irrigacao[]> {
  try {
    const url = fazendaId 
      ? `/api/irrigacao/irrigacoes/?fazenda=${fazendaId}` 
      : "/api/irrigacao/irrigacoes/";
    const response: AxiosResponse = await api.get(url);
    return extractData<Irrigacao>(response.data);
  } catch (error) {
    logError("getIrrigacoes", error);
    return [];
  }
}

export async function getIrrigacao(id: number): Promise<Irrigacao | null> {
  try {
    const { data } = await api.get<Irrigacao>(`/api/irrigacao/irrigacoes/${id}/`);
    return data;
  } catch (error) {
    logError("getIrrigacao", error);
    return null;
  }
}

// =============================================================================
// PRODUTIVIDADE - /api/produtividade/
// =============================================================================

export async function getDadosProdutividade(fazendaId?: number): Promise<DadosProdutividade[]> {
  try {
    const url = fazendaId 
      ? `/api/produtividade/?fazenda=${fazendaId}` 
      : "/api/produtividade/";
    const response: AxiosResponse = await api.get(url);
    return extractData<DadosProdutividade>(response.data);
  } catch (error) {
    logError("getDadosProdutividade", error);
    return [];
  }
}

export async function getProdutividadeResumo(): Promise<{ fazenda__nome: string; media_produtividade: number }[]> {
  try {
    const { data } = await api.get("/api/produtividade/resumo/");
    return data;
  } catch (error) {
    logError("getProdutividadeResumo", error);
    return [];
  }
}

// =============================================================================
// MAPAS - /api/maps/
// =============================================================================

// MAPAS CRUD
export async function getMapas(fazendaId: number): Promise<Mapa[]> {
  try {
    const response: AxiosResponse = await api.get(`/api/maps/fazenda/${fazendaId}/mapas/`);
    return response.data;
  } catch (error) {
    logError("getMapas", error);
    return [];
  }
}

export async function getMapa(fazendaId: number, mapaId: number): Promise<Mapa | null> {
  try {
    const { data } = await api.get<Mapa>(`/api/maps/fazenda/${fazendaId}/mapas/${mapaId}/`);
    return data;
  } catch (error) {
    logError("getMapa", error);
    return null;
  }
}

export async function createMapa(fazendaId: number, mapa: Partial<Mapa>): Promise<Mapa> {
  const { data } = await api.post<Mapa>(`/api/maps/fazenda/${fazendaId}/mapas/`, mapa);
  return data;
}

export async function updateMapa(fazendaId: number, mapaId: number, mapa: Partial<Mapa>): Promise<Mapa> {
  const { data } = await api.put<Mapa>(`/api/maps/fazenda/${fazendaId}/mapas/${mapaId}/`, mapa);
  return data;
}

export async function deleteMapa(fazendaId: number, mapaId: number): Promise<void> {
  await api.delete(`/api/maps/fazenda/${fazendaId}/mapas/${mapaId}/`);
}

// =============================================================================
// USUÁRIOS (Admin) - /api/usuarios/
// =============================================================================

export async function getUsers(): Promise<User[]> {
  try {
    const response: AxiosResponse = await api.get("/api/usuarios/");
    return extractData<User>(response.data);
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

export async function createUser(userData: Partial<User> & { password: string }): Promise<User> {
  const { data } = await api.post<User>("/api/usuarios/", userData);
  return data;
}

export async function updateUser(id: number, userData: Partial<User>): Promise<User> {
  const { data } = await api.patch<User>(`/api/usuarios/${id}/`, userData);
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/usuarios/${id}/`);
}