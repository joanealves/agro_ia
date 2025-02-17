import {api } from './api'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData extends LoginData { 
  name: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export async function loginUser(data: LoginData) {
  const response = await api.post('/auth/login', data)
  localStorage.setItem('token', response.data.token)
  return response.data
}

export async function registerUser(data: RegisterData) {
  const response = await api.post('/auth/register', data)
  return response.data
}

export async function logoutUser() {
  localStorage.removeItem('token')
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get('/auth/me')
    return response.data
  } catch (error) {
    return null
  }
}