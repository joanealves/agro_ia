# AUTENTICAÇÃO - IMPLEMENTAÇÃO COMPLETA (Sprint 0-1)

> Status: ✅ PRONTO PARA TESTE
> Data: 07 de fevereiro de 2026

---

## 📊 O Que Foi Implementado

### Backend (Django) ✅
- [x] JWT com SimpleJWT (access + refresh tokens)
- [x] Cookies HTTP-only
- [x] CustomTokenObtainPairView (login)
- [x] CustomTokenRefreshView (refresh automático)
- [x] CustomUserView (GET /api/auth/me/)
- [x] CustomLogoutView (logout)
- [x] RegisterView (register)
- [x] Multi-tenancy com filtro por usuário em todos ViewSets

### Frontend (Next.js) ✅
- [x] Hook `useAuth` completo
  - login(credentials) → POST /api/auth/login/
  - register(data) → POST /api/auth/register/
  - logout() → DELETE cookies
  - refreshUser() → GET /api/auth/me/
- [x] AuthProvider com contexto global
- [x] Interceptadores axios (request + response)
- [x] Refresh automático de token (401 → refresh → retry)
- [x] Tipos TypeScript: User, LoginData, AuthResponse, etc.

---

## 🔐 Fluxo de Segurança

### 1. Login
```
POST /api/auth/login/
  {email, password}
  ↓
JWT gerados (access + refresh)
  ↓
Cookies HTTP-only definidos automaticamente
  ↓
Frontend salva também em localStorage/cookies (fallback)
  ↓
Redirect para /dashboard
```

### 2. Requisições Autenticadas
```
GET /api/fazendas/
  ↓
Interceptor adiciona: Authorization: Bearer <token>
  ↓
Backend valida JWT
  ↓
Retorna apenas dados do usuário (get_queryset filtrado)
```

### 3. Token Expirado
```
Token expira após 1h (ACCESS_TOKEN_LIFETIME)
  ↓
Frontend recebe 401
  ↓
Interceptor faz: POST /api/auth/refresh/ {refresh_token}
  ↓
Novo access_token gerado
  ↓
Retry da requisição original
  ↓
Sem interruption para o usuário
```

### 4. Logout
```
DELETE cookies (access_token, refresh_token)
  ↓
Redirect para /login
  ↓
Próximas requisições não terão Authorization
```

---

## 🧪 Como Testar

### Teste 1: Login Básico

Via Swagger/ReDoc:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

Resposta esperada:
```json
{
  "access": "eyJhbGc...",
  "refresh": "eyJhbGc...",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "João Silva",
    "username": "joao"
  }
}
```

### Teste 2: Requisição Autenticada (Usar o token)

```bash
curl -X GET http://localhost:8000/api/fazendas/ \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

Resposta esperada:
```json
[
  {
    "id": 1,
    "nome": "Fazenda Alpha",
    "latitude": -15.789,
    "longitude": -48.123,
    "usuario": 1
  }
]
```

### Teste 3: Multi-tenancy (Garantir que não acessa dados de outro)

```bash
# Token do usuário A
curl -X GET http://localhost:8000/api/fazendas/ \
  -H "Authorization: Bearer <token_usuario_A>" 

# Resultado: Apenas fazendas de A (não vê fazendas de B)
```

### Teste 4: Refresh Token

```bash
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "eyJhbGc..."}'
```

### Teste 5: GET /api/auth/me/ (Usuário Atual)

```bash
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 🍪 Verificar Cookies (Browser Dev Tools)

1. Abra: DevTools → Application → Cookies → http://localhost:3000
2. Procure por: `access_token`, `refresh_token`
3. Propriedades esperadas:
   - HttpOnly: ✅ true
   - Secure: ❌ false (em dev), ✅ true (em produção)
   - SameSite: Lax (ou Strict)

---

## 📝 Endpoints de Auth

| Método | Endpoint | Descrição | Requer Auth |
|--------|----------|-----------|-------------|
| POST | /api/auth/login/ | Login com email/password | ❌ |
| POST | /api/auth/register/ | Registro novo usuário | ❌ |
| POST | /api/auth/refresh/ | Obter novo access_token | ❌ |
| POST | /api/auth/logout/ | Logout | ✅ |
| GET | /api/auth/me/ | Dados do usuário logado | ✅ |

---

## 🐛 Troubleshooting

### "401 Unauthorized" em requisições autenticadas

Causas possíveis:
1. Token expirado → use refresh endpoint
2. Token inválido → fazer novo login
3. CORS headers não configurados → verificar backend/settings.py CORS_ALLOWED_ORIGINS

### "useAuth deve ser usado dentro de AuthProvider"

Causa: useAuth() chamado fora de <AuthProvider>
Solução: Verificar que componente está envolvido por AuthProvider em layout.tsx

### Tokens não aparecem em Cookies

Causa: Backend não está setando cookies corretamente
Solução: Verificar backend/custom_auth/views.py - response.set_cookie()

### "Cannot read property 'user' of undefined"

Causa: Usando useAuth() antes de AuthProvider renderizar
Solução: Adicionar "use client" no início do componente

---

## ✨ Features Adicionais Configuradas

### 1. Auto-refresh de Token
```typescript
// api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh automático
      const newToken = await post('/api/auth/refresh/', {refresh})
      return api(originalRequest) // Retry
    }
  }
)
```

### 2. Redirect Automático ao Fazer Login
```typescript
// hooks/useAuth.ts
const login = () => {
  // ... fazer login
  router.push('/dashboard') // Automático
}
```

### 3. Verificação de Autenticação ao Montar
```typescript
useEffect(() => {
  const token = Cookies.get('access_token')
  if (token) {
    api.get('/auth/me/').then(setUser)
  }
}, [])
```

---

## 📚 Documentação Relacionada

- [GUIA_AUTH.md](GUIA_AUTH.md) - Como usar useAuth em componentes
- [AVALIACAO_ESTADO_ATUAL.md](AVALIACAO_ESTADO_ATUAL.md) - Análise geral
- [SPRINT0_EXECUTADO.md](SPRINT0_EXECUTADO.md) - O que foi implementado

---

## ✅ Checklist de Validação

Backend:
- [ ] `python manage.py runserver` executa sem erro
- [ ] GET /api/swagger/ carrega documentação
- [ ] POST /api/auth/login/ retorna tokens
- [ ] GET /api/fazendas/ retorna apenas dados do usuário logado

Frontend:
- [ ] `npm run dev` executa sem erro
- [ ] Página /login carrega
- [ ] Login redireciona para /dashboard
- [ ] Dashboard mostra dados do usuário logado
- [ ] Logout limpa tokens e redireciona para /login
- [ ] useAuth() disponível em todos componentes

---

## 🚀 Próximos Passos (Sprint 2)

1. ✅ Implementar useAuth hook com todos métodos
2. ✅ Configurar autenticação no layout raiz
3. ⏳ Adaptar página /login para usar useAuth
4. ⏳ Adaptar página /register para usar useAuth
5. ⏳ Criar componente PrivateRoute (rotas protegidas)
6. ⏳ Integrar clima real (Open-Meteo)
7. ⏳ Implementar Talhões no frontend

---

**Status:** ✅ Sprint 1 - Autenticação Completa  
**Tempo Estimado para Testes:** 30-45 minutos  
**Bloqueador para Next Sprint:** Nenhum (pode começar Sprint 2)
