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
