# GUIA DE USO - useAuth Hook

## 📋 Resumo

O hook `useAuth` fornece acesso ao contexto de autenticação da aplicação. Está disponível em qualquer componente dentro de `<AuthProvider>`.

---

## ✅ Setup (Já Configurado)

### 1. Layout.tsx
```tsx
import { AuthProvider } from "./providers/AuthProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. Hook useAuth
```typescript
// src/hooks/useAuth.ts
export function useAuth(): AuthContextType {
  // Retorna:
  // - user: User | null
  // - isLoading: boolean
  // - isAuthenticated: boolean
  // - error: string | null
  // - login(credentials): Promise<void>
  // - register(data): Promise<void>
  // - logout(): Promise<void>
  // - refreshUser(): Promise<void>
}
```

---

## 🔐 Exemplo 1: Login

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login({ email, password });
      // Redirect automático para /dashboard (feito dentro de login)
    } catch (err) {
      // error contém mensagem de erro
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Senha" required />
      
      {error && <p className="text-red-500">{error}</p>}
      
      <button disabled={isLoading} type="submit">
        {isLoading ? 'Entrando...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## 📓 Exemplo 2: Register

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    
    try {
      await register({
        name: formData.get('name') as string,
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      });
      // Redirect automático para /dashboard
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Nome" required />
      <input type="text" name="username" placeholder="Usuário" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Senha" required />
      
      {error && <p className="text-red-500">{error}</p>}
      
      <button disabled={isLoading}>{isLoading ? 'Registrando...' : 'Register'}</button>
    </form>
  );
}
```

---

## 👤 Exemplo 3: Mostrar Usuário Logado

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p>Carregando...</p>;

  if (!user) return <p>Não autenticado</p>;

  return (
    <div>
      <h1>Bem-vindo, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

---

## 🚪 Exemplo 4: Logout

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    // Redirect para /login é feito automaticamente em logout()
  };

  return (
    <div className="flex items-center gap-4">
      <span>{user?.name}</span>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

---

## 🛡️ Exemplo 5: PrivateRoute (Rotas Protegidas)

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Carregando autenticação...</div>;
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  return <>{children}</>;
}

// Uso:
export default function SecretPage() {
  return (
    <PrivateRoute>
      <h1>Conteúdo Privado</h1>
    </PrivateRoute>
  );
}
```

---

## 🔄 Exemplo 6: Recarregar Dados do Usuário

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function UserProfile() {
  const { user, refreshUser } = useAuth();

  const handleUpdateProfile = async () => {
    // ... fazer alguma mudança no backend
    
    // Recarregar dados do usuário
    await refreshUser();
  };

  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={handleUpdateProfile}>Atualizar Perfil</button>
    </div>
  );
}
```

---

## 📊 Interface Completa

```typescript
interface AuthContextType {
  // Estado
  user: User | null;                    // Dados do usuário logado
  isLoading: boolean;                   // Carregando dados
  isAuthenticated: boolean;              // Tem token válido?
  error: string | null;                 // Mensagem de erro

  // Funções
  login: (credentials: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

---

## 🔐 Fluxo de Autenticação

```
1. App monta → AuthProvider inicia → useAuthState()
   ↓
2. useAuthState verifica se há token em cookies
   ↓
3. Se houver token → GET /api/auth/me/ carrega usuário
   ↓
4. isLoading = false, user = dados
   ↓
5. Componentes podem usar useAuth() para acessar dados
```

---

## ⚠️ Tokens HTTP-Only Cookies

Os tokens são **automaticamente** salvos em cookies HTTP-only pelo backend:
- `access_token` - JWT de acesso (1 hora)
- `refresh_token` - JWT de refresh (7 dias)

Não precisa fazer nada disso manualmente! O interceptor do axios em `api.ts` cuida de tudo:

```typescript
// api.ts - Interceptor automático
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🧪 Teste Rápido (Dev)

No console do navegador:
```javascript
// Verificar token
document.cookie

// Testar API
fetch('http://localhost:8000/api/auth/me/', {
  headers: { 'Authorization': 'Bearer SEU_TOKEN' }
}).then(r => r.json())
```

---

## 📋 Checklist de Implementação

- [x] useAuth hook criado
- [x] AuthProvider configurado
- [x] api.ts com interceptadores JWT
- [x] Login/Logout/Register
- [x] Refresh automático de token
- [x] Layout.tsx usando AuthProvider
- [ ] Componentes adaptados para usar useAuth

**Próximo Passo:** Adaptar login/register/dashboard para usar o novo hook

---

**Status:** ✅ Autenticação pronta para usar  
**Data:** 07 de fevereiro de 2026  
**Sprint:** 1 - Autenticação
