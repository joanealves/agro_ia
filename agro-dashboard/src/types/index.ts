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








// =============================================================================
// TYPES - Tipos centralizados do projeto AgroIA Dashboard
// =============================================================================

// =============================================================================
// USER & AUTH
// =============================================================================

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: "admin" | "user";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

export interface AuthResponse {
  access: string;
  refresh: string;
  access_token?: string;
  refresh_token?: string;
  user: User;
}

export interface RefreshResponse {
  access?: string;
  access_token?: string;
}

// =============================================================================
// FAZENDA
// =============================================================================

export interface Fazenda {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  localizacao: string;
  usuario?: number;
}

export type FazendaCreate = Omit<Fazenda, "id" | "usuario">;
export type FazendaUpdate = Partial<FazendaCreate>;

// =============================================================================
// CLIMA
// =============================================================================

export interface DadosClimaticos {
  id: number;
  fazenda: number;
  fazenda_nome?: string;
  temperatura: number;
  umidade: number;
  precipitacao: number;
  data_coleta: string;
}

export interface ClimaResumo {
  temp_media: number;
  umidade_media: number;
  chuva_total: number;
}

// =============================================================================
// PRAGAS
// =============================================================================

export interface Praga {
  id: number;
  fazenda: number;
  fazenda_nome?: string;
  usuario: number;
  nome: string;
  descricao: string;
  imagem?: string;
  data_criacao: string;
  status: "pendente" | "resolvido";
}

export interface PragaCreate {
  fazenda: number;
  nome: string;
  descricao: string;
  imagem?: File | string;
  status?: "pendente" | "resolvido";
}

export type PragaUpdate = Partial<PragaCreate>;

// =============================================================================
// PRODUTIVIDADE
// =============================================================================

export interface DadosProdutividade {
  id: number;
  fazenda: number;
  fazenda_nome?: string;
  cultura: string;
  area: number;
  produtividade: number;
  data: string;
}

export interface ProdutividadeResumo {
  fazenda__nome: string;
  media_produtividade: number;
}

// =============================================================================
// MAPAS
// =============================================================================

export interface Mapa {
  id: number;
  fazenda: number;
  nome: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

// =============================================================================
// NOTIFICAÇÕES
// =============================================================================

export interface Notificacao {
  id: number;
  usuario: number;
  mensagem: string;
  tipo: "email" | "whatsapp";
  enviada_em: string;
  lida: boolean;
}

// =============================================================================
// IRRIGAÇÃO
// =============================================================================

export interface Irrigacao {
  id: number;
  fazenda: number;
  fazenda_nome?: string;
  data: string;
  quantidade_agua: number;
  duracao: number;
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
}

// =============================================================================
// DASHBOARD
// =============================================================================

export interface DashboardData {
  alertas: number;
  total_irrigacoes: number;
  total_pragas: number;
  total_fazendas: number;
  total_notificacoes: number;
  clima: ClimaResumo;
  produtividade: ProdutividadeResumo[];
}

// =============================================================================
// CHART DATA
// =============================================================================

export interface ChartDataPoint {
  date: string;
  value: number;
  name?: string;
}

export interface BarChartData {
  name: string;
  total: number;
}

// =============================================================================
// API
// =============================================================================

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}