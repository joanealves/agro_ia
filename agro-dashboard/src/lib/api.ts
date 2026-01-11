
import axios from "axios";
import Cookies from "js-cookie";

/* ================================
   TYPES
================================ */

export interface DashboardData {
  total_pragas: number;
  clima: {
    temp_media: number;
    umidade_media: number;
    chuva_total: number;
  };
  produtividade: {
    fazenda__nome: string;
    media_produtividade: number;
  }[];
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Fazenda {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  localizacao: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

/* ================================
   AXIOS INSTANCE
================================ */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// adiciona token na request
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

/* ================================
   API FUNCTIONS
================================ */

export async function getDashboardData(): Promise<DashboardData> {
  const response = await api.get<DashboardData>("/api/dashboard/");
  return response.data;
}
