import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

export default api;

// Funções para gerenciar usuários
export const getUsers = async () => {
  const { data } = await api.get("/users/");
  return data;
};

export const createUser = async (user: { name: string; email: string; password: string; role: string }) => {
  const { data } = await api.post("/users/", user);
  return data;
};

export const updateUser = async (id: string, user: Partial<{ name: string; email: string; role: string }>) => {
  const { data } = await api.put(`/users/${id}/`, user);
  return data;
};

export const deleteUser = async (id: string) => {
  await api.delete(`/users/${id}/`);
};

// Funções para gerenciar fazendas
export const getFarms = async () => {
  const { data } = await api.get("/fazendas/");
  return data;
};

export const createFarm = async (farm: { nome: string; localizacao: string; latitude: number; longitude: number }) => {
  const { data } = await api.post("/fazendas/", farm);
  return data;
};

export const updateFarm = async (id: string, farm: Partial<{ nome: string; localizacao: string; latitude: number; longitude: number }>) => {
  const { data } = await api.put(`/fazendas/${id}/`, farm);
  return data;
};

export const deleteFarm = async (id: string) => {
  await api.delete(`/fazendas/${id}/`);
};

// Funções para gerenciar dados climáticos
export const getWeatherData = async () => {
  const { data } = await api.get("/clima/");
  return data;
};

export const createWeatherData = async (weather: { temperatura: number; umidade: number; precipitacao: number }) => {
  const { data } = await api.post("/clima/", weather);
  return data;
};

// Funções para gerenciar pragas
export const getPests = async () => {
  const { data } = await api.get("/pragas/");
  return data;
};

export const createPest = async (pest: { nome: string; descricao: string; imagem: string }) => {
  const { data } = await api.post("/pragas/", pest);
  return data;
};

export const updatePest = async (id: string, pest: Partial<{ nome: string; descricao: string; imagem: string }>) => {
  const { data } = await api.put(`/pragas/${id}/`, pest);
  return data;
};

export const deletePest = async (id: string) => {
  await api.delete(`/pragas/${id}/`);
};

// Funções para gerenciar produtividade
export const getProductivityData = async () => {
  const { data } = await api.get("/produtividade/");
  return data;
};

export const createProductivityData = async (productivity: { cultura: string; area: number; produtividade: number }) => {
  const { data } = await api.post("/produtividade/", productivity);
  return data;
};

export const updateProductivityData = async (id: string, productivity: Partial<{ cultura: string; area: number; produtividade: number }>) => {
  const { data } = await api.put(`/produtividade/${id}/`, productivity);
  return data;
};

export const deleteProductivityData = async (id: string) => {
  await api.delete(`/produtividade/${id}/`);
};