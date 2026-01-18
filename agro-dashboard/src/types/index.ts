// // =============================================================================
// // TYPES - Tipos centralizados do projeto AgroIA Dashboard
// // =============================================================================

// // =============================================================================
// // USER & AUTH
// // =============================================================================

// export interface User {
//   id: number;
//   name: string;
//   email: string;
//   username: string;
//   role: "admin" | "user";
// }

// export interface LoginData {
//   email: string;
//   password: string;
// }

// export interface RegisterData {
//   name: string;
//   username: string;
//   email: string;
//   password: string;
//   role?: "admin" | "user";
// }

// export interface AuthResponse {
//   access: string;
//   refresh: string;
//   access_token?: string;
//   refresh_token?: string;
//   user: User;
// }

// export interface RefreshResponse {
//   access?: string;
//   access_token?: string;
// }

// // =============================================================================
// // FAZENDA
// // =============================================================================

// export interface Fazenda {
//   id: number;
//   nome: string;
//   latitude: number;
//   longitude: number;
//   localizacao: string;
//   usuario?: number;
// }

// export type FazendaCreate = Omit<Fazenda, "id" | "usuario">;
// export type FazendaUpdate = Partial<FazendaCreate>;

// // =============================================================================
// // CLIMA
// // =============================================================================

// export interface DadosClimaticos {
//   id: number;
//   fazenda: number;
//   fazenda_nome?: string;
//   temperatura: number;
//   umidade: number;
//   precipitacao: number;
//   data_coleta: string;
// }

// export interface ClimaResumo {
//   temp_media: number;
//   umidade_media: number;
//   chuva_total: number;
// }

// // =============================================================================
// // PRAGAS
// // =============================================================================

// export interface Praga {
//   id: number;
//   fazenda: number;
//   fazenda_nome?: string;
//   usuario: number;
//   nome: string;
//   descricao: string;
//   imagem?: string;
//   data_criacao: string;
//   status: "pendente" | "resolvido";
// }

// export interface PragaCreate {
//   fazenda: number;
//   nome: string;
//   descricao: string;
//   imagem?: File | string;
//   status?: "pendente" | "resolvido";
// }

// export type PragaUpdate = Partial<PragaCreate>;

// // =============================================================================
// // PRODUTIVIDADE
// // =============================================================================

// // =============================================================================
// // PRODUTIVIDADE - Substitua esta seção no seu types.ts
// // =============================================================================

// export interface DadosProdutividade {
//   id: number;
//   cultura: string;
//   area: number;
//   produtividade: number;
//   data: string;
//   // Fazenda como objeto completo (retornado pelo GET)
//   fazenda: {
//     id: number;
//     nome: string;
//   };
//   // Campos opcionais para compatibilidade
//   fazenda_id?: number;
//   fazenda_nome?: string;
// }

// export interface ProdutividadeCreate {
//   cultura: string;
//   area: number;
//   produtividade: number;
//   fazenda_id: number;
//   data: string;
// }

// export type ProdutividadeUpdate = Partial<ProdutividadeCreate>;

// export interface ProdutividadeResumo {
//   fazenda__nome: string;
//   media_produtividade: number;
// }

// export interface ProdutividadeSeriesTemporal {
//   dados: Array<{
//     data: string;
//     produtividade: number;
//     cultura: string;
//   }>;
//   total_registros: number;
// }
// // =============================================================================
// // MAPAS
// // =============================================================================

// export interface Mapa {
//   id: number;
//   fazenda: number;
//   nome: string;
//   latitude: number;
//   longitude: number;
//   zoom: number;
// }

// // =============================================================================
// // NOTIFICAÇÕES
// // =============================================================================

// export interface Notificacao {
//   id: number;
//   usuario: number;
//   mensagem: string;
//   tipo: "email" | "whatsapp";
//   enviada_em: string;
//   lida: boolean;
// }

// // =============================================================================
// // IRRIGAÇÃO
// // =============================================================================

// export interface Irrigacao {
//   id: number;
//   fazenda: number;
//   fazenda_nome?: string;
//   data: string;
//   quantidade_agua: number;
//   duracao: number;
//   status: "agendada" | "em_andamento" | "concluida" | "cancelada";
// }

// // =============================================================================
// // DASHBOARD
// // =============================================================================

// export interface DashboardData {
//   alertas: number;
//   total_irrigacoes: number;
//   total_pragas: number;
//   total_fazendas: number;
//   total_notificacoes: number;
//   clima: ClimaResumo;
//   produtividade: ProdutividadeResumo[];
// }

// // =============================================================================
// // CHART DATA
// // =============================================================================

// export interface ChartDataPoint {
//   date: string;
//   value: number;
//   name?: string;
// }

// export interface BarChartData {
//   name: string;
//   total: number;
// }

// // =============================================================================
// // API
// // =============================================================================

// export interface ApiError {
//   detail?: string;
//   message?: string;
//   errors?: Record<string, string[]>;
// }

// export interface PaginatedResponse<T> {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: T[];
// }




















// =============================================================================
// TYPES - Tipos centralizados do projeto AgroIA Dashboard
// Sprint 0 - Correção de campos (nivel vs status) e Role consistente
// =============================================================================

// =============================================================================
// USER & AUTH
// =============================================================================

// Tipo unificado para roles de usuário
export type UserRole = "admin" | "user" | "tecnico" | "auditor";

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  is_staff?: boolean;
  is_active?: boolean;
  created_at?: string;
}

// Tipo para formulário de usuário (aceita todos os roles)
export interface UserFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
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
  role?: UserRole;
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
  created_at?: string;
  updated_at?: string;
}

export type FazendaCreate = Omit<Fazenda, "id" | "usuario" | "created_at" | "updated_at">;
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
// IMPORTANTE: Backend usa campo 'nivel' (baixo/medio/alto), não 'status'
// =============================================================================

// Níveis de severidade de pragas conforme banco de dados
export type NivelPraga = "baixo" | "medio" | "alto";

export interface Praga {
  id: number;
  fazenda: number;
  fazenda_nome?: string;
  usuario?: number;
  nome: string;
  descricao: string;
  imagem?: string;
  data_registro: string;
  // CORREÇÃO: Campo correto é 'nivel', não 'status'
  nivel: NivelPraga;
}

export interface PragaCreate {
  fazenda: number;
  nome: string;
  descricao: string;
  imagem?: File | string;
  // CORREÇÃO: Campo correto é 'nivel'
  nivel?: NivelPraga;
}

export type PragaUpdate = Partial<PragaCreate>;

// Helper para converter status legado para nivel
export function statusToNivel(status?: string): NivelPraga {
  switch (status) {
    case "resolvido":
      return "baixo";
    case "pendente":
    default:
      return "medio";
  }
}

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
  safra?: string;
  talhao_id?: number;
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
  fazenda_nome?: string;
  nome: string;
  latitude: number;
  longitude: number;
  zoom: number;
  data_criacao?: string;
}

// =============================================================================
// NOTIFICAÇÕES
// =============================================================================

export type TipoNotificacao = "email" | "whatsapp" | "push" | "sistema";

export interface Notificacao {
  id: number;
  usuario: number;
  mensagem: string;
  tipo: TipoNotificacao;
  enviada_em: string;
  lida: boolean;
  titulo?: string;
  link?: string;
}

// =============================================================================
// IRRIGAÇÃO
// =============================================================================

export type StatusIrrigacao = "agendada" | "em_andamento" | "concluida" | "cancelada";

export interface Irrigacao {
  id: number;
  fazenda: number;
  fazenda_nome?: string;
  nome: string;
  status: StatusIrrigacao;
  data?: string;
  quantidade_agua?: number;
  duracao?: number;
  created_at?: string;
}

export interface IrrigacaoHistorico {
  id: number;
  irrigacao_id: number;
  status: StatusIrrigacao;
  volume_agua?: number;
  duracao_minutos?: number;
  data_evento: string;
}

// =============================================================================
// TALHÕES (NOVO - Sprint 1)
// Core do produto agrícola
// =============================================================================

export interface Talhao {
  id: string; // UUID
  fazenda_id: number;
  fazenda_nome?: string;
  nome: string;
  codigo?: string;
  // Geometria GeoJSON para PostGIS
  geometria?: GeoJSONPolygon;
  area_hectares: number;
  cultura_atual?: string;
  safra_atual?: string;
  responsavel_tecnico_id?: number;
  responsavel_tecnico_nome?: string;
  created_at: string;
  updated_at: string;
}

export interface TalhaoCreate {
  fazenda_id: number;
  nome: string;
  codigo?: string;
  geometria?: GeoJSONPolygon;
  area_hectares?: number;
  cultura_atual?: string;
  safra_atual?: string;
  responsavel_tecnico_id?: number;
}

export type TalhaoUpdate = Partial<TalhaoCreate>;

// =============================================================================
// SAFRAS (NOVO - Sprint 2)
// =============================================================================

export interface Safra {
  id: string; // UUID
  nome: string; // Ex: "2025/2026"
  ano_inicio: number;
  ano_fim: number;
  data_inicio?: string;
  data_fim?: string;
  ativa: boolean;
  created_at: string;
}

export interface SafraTalhao {
  id: string;
  safra_id: string;
  talhao_id: string;
  cultura: string;
  area_plantada: number;
  data_plantio?: string;
  data_colheita?: string;
  produtividade_estimada?: number;
  produtividade_real?: number;
  status: "planejado" | "plantado" | "em_desenvolvimento" | "colhido";
}

// =============================================================================
// APLICAÇÕES (NOVO - Sprint 3)
// Rastreabilidade de defensivos/fertilizantes
// =============================================================================

export type TipoAplicacao = "defensivo" | "fertilizante" | "corretivo" | "herbicida" | "fungicida" | "inseticida";

export interface Aplicacao {
  id: string;
  talhao_id: string;
  talhao_nome?: string;
  safra_id: string;
  tipo: TipoAplicacao;
  produto: string;
  dose: number;
  unidade_dose: string; // L/ha, kg/ha, etc
  data_aplicacao: string;
  responsavel_id: number;
  responsavel_nome?: string;
  observacoes?: string;
  // Geometria da área aplicada (pode ser diferente do talhão inteiro)
  geometria_aplicacao?: GeoJSONPolygon;
  created_at: string;
}

// =============================================================================
// GEOJSON TYPES
// =============================================================================

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

// =============================================================================
// DASHBOARD
// =============================================================================

export interface DashboardData {
  alertas: number;
  total_irrigacoes: number;
  total_pragas: number;
  total_fazendas: number;
  total_talhoes?: number;
  total_notificacoes: number;
  notificacoes_nao_lidas?: number;
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
  color?: string;
}

// =============================================================================
// API
// =============================================================================

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// =============================================================================
// FILTROS
// =============================================================================

export interface FiltrosPragas {
  fazenda?: number;
  nivel?: NivelPraga;
  dataInicio?: string;
  dataFim?: string;
  search?: string;
}

export interface FiltrosProdutividade {
  fazenda?: number;
  cultura?: string;
  safra?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface FiltrosClima {
  fazenda?: number;
  dataInicio?: string;
  dataFim?: string;
}