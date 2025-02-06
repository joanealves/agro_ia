import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

export default api;

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

