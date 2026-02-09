'use client';

import { ReactNode } from 'react';
import { AuthContext, useAuthState, useAuth } from '@/hooks/useAuth';

/**
 * AuthProvider - Fornece contexto de autenticação global
 * Usa useAuthState hook que gerencia login/logout/refresh automático
 * Disponibiliza useAuth() em qualquer componente filho
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

// Re-export useAuth para conveniência
export { useAuth } from '@/hooks/useAuth';




