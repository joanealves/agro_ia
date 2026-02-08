# PLANO DE DESENVOLVIMENTO - AGROÍA 2026

> Roadmap de execução baseado na Avaliação de Estado Atual
> Período: Fevereiro - Maio 2026 (Sprint 0 a Sprint 4)

---

## 📋 ÍNDICE

1. [Vision e Timeline](#1-vision-e-timeline)
2. [Sprint 0: Semana 1 (Crítico)](#2-sprint-0-semana-1-crítico)
3. [Sprint 1: Semanas 2-3 (Fundação)](#3-sprint-1-semanas-2-3-fundação)
4. [Sprint 2: Semanas 4-5 (Clima Real)](#4-sprint-2-semanas-4-5-clima-real)
5. [Sprint 3: Semanas 6-7 (Talhões)](#5-sprint-3-semanas-6-7-talhões)
6. [Sprint 4: Semanas 8+ (MVP Validado)](#6-sprint-4-semanas-8-mvp-validado)
7. [Matriz de Dependências](#7-matriz-de-dependências)
8. [Métricas de Sucesso](#8-métricas-de-sucesso)
9. [Riscos e Mitigação](#9-riscos-e-mitigação)

---

## 1. VISION E TIMELINE

### Objetivo Principal
```
Transformar AgroIA de "estrutura bonita com dados fake"
para "MVP com produto real e 100 usuários testadores"
em 12 semanas
```

### Timeline
```
Sprint 0: FEV 07-14       (1 semana)  → Segurança + Limpeza
Sprint 1: FEV 14-28       (2 semanas) → Unificação de modelos
Sprint 2: MAR 01-14       (2 semanas) → Clima real
Sprint 3: MAR 15-28       (2 semanas) → Talhões funcionais
Sprint 4: MAR 29-ABR 30   (4 semanas) → MVP + Testes
Beta:     MAI 01-31       (1 mês)     → 100 usuários testadores
```

### Métricas de Sucesso por Fase

| Sprint | Métrica | Target | Critério |
|--------|---------|--------|----------|
| **Sprint 0** | Segurança | 100% | .env removido, 0 credenciais públicas |
| **Sprint 1** | Models | 1x Fazenda | Duplicação eliminada |
| **Sprint 2** | Dados Reais | 7-day forecast | Open-Meteo integrando |
| **Sprint 3** | Geometria | 100% talhões | CRUD funcional frontend |
| **Sprint 4** | Testes | 80% coverage | pytest + integration tests |
| **Beta** | Usuários | 100 ativos | Validação de demanda |

---

## 2. SPRINT 0: Semana 1 (Crítico)

### ⚠️ OBJETIVO
Remover vulnerabilidades críticas de segurança e limpeza de código.

### 📌 TAREFAS

#### Backend: Segurança
```
[ ] 0.1 - Remover credenciais do git
   - git rm --cached .env
   - git rm --cached db.sqlite3
   - git rm -r --cached backend/**/__pycache__
   
[ ] 0.2 - Criar .gitignore proper
   - Adicionar: .env, .env.local, *.sqlite3
   - Adicionar: **/__pycache__/, .pytest_cache/
   - Adicionar: node_modules/, .next/, dist/
   
[ ] 0.3 - Validar SECRET_KEY no settings
   - Remover hardcoded SECRET_KEY
   - Forçar leitura de .env
   - Usar python-decouple ou python-dotenv
   
[ ] 0.4 - Criar .env.example
   - Exemplo de variáveis necessárias
   - Sem valores sensíveis
   - Documentar cada uma

[ ] 0.5 - Limpar print() de debug
   - Remover todos print() de backend/
   - Adicionar logging.debug() no lugar
   - Verificar: backend/maps/views.py
```

#### Frontend: Limpeza
```
[ ] 0.6 - Remover console.log() de produção
   - Grep: "console.log" em src/
   - Manter apenas em development
   - Adicionar fonte: "@ts-ignore"
   
[ ] 0.7 - Validar .env frontend
   - next.config.ts tem NEXT_PUBLIC_*?
   - Variables não-sensíveis apenas
```

#### Git/CI
```
[ ] 0.8 - Forçar limpeza do histórico
   - git filter-branch (opcional, se crítico)
   - Ou: novo repositório sem histórico
   - Push force com signed commits
   
[ ] 0.9 - Configurar pre-commit hooks
   - Bloquear commits com .env
   - Bloquear console.log em main
   - Usar husky + lint-staged
```

### ✅ Critério de Aceitação (DoD)

```
✓ Zero ocorrências de .env ou credenciais no git
✓ git log mostra zero commits com secrets
✓ .gitignore bloqueia `node_modules`, `__pycache__`, `.env`
✓ Todos print() de debug foram removidos
✓ Código passa em linting local
✓ Build frontend sem warnings
✓ Backend carrega com sucesso (python manage.py runserver)
```

### 📊 Esforço
- Backend: 2h
- Frontend: 2h
- DevOps: 3h
- **Total: 7h (1 dia)**

---

## 3. SPRINT 1: Semanas 2-3 (Fundação)

### 🎯 OBJETIVO
Eliminar duplicações, unificar modelo de dados, adicionar segurança por usuário.

### 📌 TAREFAS

#### Backend: Modelos
```
[ ] 1.1 - Auditar modelo Fazenda duplicado
   - Comparar: backend/usuarios/models.py vs backend/fazenda/models.py
   - Documentar diferenças
   - Escolher qual é "canonical"
   
[ ] 1.2 - Unificar modelo Fazenda
   - Mover versão "melhor" para backend/fazenda/
   - Deletar versão duplicada
   - Atualizar migrations
   - Manter ForeignKey em Usuário
   
[ ] 1.3 - Criar migration para consolidação
   - pytest para validar
   - Testar em dev database
   
[ ] 1.4 - Atualizar Serializers
   - FazendaSerializer único
   - Remover serializers duplicados
   - Adicionar user info no retorno
```

#### Backend: Segurança Multi-tenancy
```
[ ] 1.5 - Adicionar get_queryset() em ViewSets
   Implementar em TODOS ViewSets:
   - PragaViewSet
   - MapaViewSet
   - IrrigacaoViewSet
   - ProdutividadeViewSet
   - NotificacaoViewSet
   - AplicacaoViewSet
   
   Implementação:
   ```python
   def get_queryset(self):
       user = self.request.user
       return super().get_queryset().filter(usuario=user)
   ```

[ ] 1.6 - Adicionar permission checks
   - IsAuthenticated em todas rotas
   - Adicionar IsOwner customizado
   - Validar que objeto pertence ao usuário
   
[ ] 1.7 - Testes de segurança
   - Teste: usuário A não vê dados de B
   - Teste: PATCH/DELETE bloqueia outro usuário
   - pytest com fixtures de usuários
```

#### Backend: Rotas
```
[ ] 1.8 - Consolidar rotas duplicadas
   - Escolher padrão: /api/mapas/ ou /api/maps/
   - Recomendação: /api/maps/ (RESTful)
   - Remover rotas antigas
   - Testar endpoints
   
[ ] 1.9 - Validação de rotas:
   GET    /api/maps/fazenda/{id}/
   POST   /api/maps/fazenda/{id}/
   PATCH  /api/maps/fazenda/{id}/{map_id}/
   DELETE /api/maps/fazenda/{id}/{map_id}/
```

#### Backend: Limpeza
```
[ ] 1.10 - Remover managed=False
   - Encontrar modelos com managed=False
   - Adicionar ao Django migration
   - backend/notificacoes/models.py
   
[ ] 1.11 - Verificar abstract models
   - Talhao deve herdar quem?
   - Definir padrão TimeStamped
```

#### Frontend: Hooks e Auth
```
[ ] 1.12 - Implementar useAuth hook
   - Ler token de localStorage/cookies
   - Validar se token ainda válido
   - GET /api/auth/me/ para dados atuais
   - Retornar: user, isLoading, error
   
   ```typescript
   const useAuth = () => {
     const [user, setUser] = useState(null);
     useEffect(() => {
       api.get('/auth/me/').then(...)
     }, []);
     return { user, isLoading, logout };
   }
   ```

[ ] 1.13 - Adicionar PrivateRoute
   - Redirecionar não-autenticados para /login
   - Aplicar em todas rotas dentro (dashboard)
   
[ ] 1.14 - Validar TypeScript types
   - Definir User, UserProfile tipos
   - types/index.ts centralizado
```

#### Testing
```
[ ] 1.15 - Setup pytest + fixtures
   - conftest.py global
   - Fixtures: user, fazenda, token
   - Executar: pytest backend/

[ ] 1.16 - Primeiros testes
   - test_user_cannot_see_others_data.py
   - test_fazenda_crud_permissions.py
   - test_authentication_flow.py
```

### ✅ Critério de Aceitação

```
✓ Apenas 1 modelo Fazenda no código
✓ 100% ViewSets têm get_queryset() com filter(usuario=user)
✓ Rotas consolidadas (nenhuma duplicação)
✓ useAuth hook retorna user e logout() funciona
✓ pytest roda com sucesso
✓ 15+ testes de segurança passando
✓ Zero warnings em build
```

### 📊 Esforço
- Backend: 16h
- Frontend: 8h
- Testing: 8h
- **Total: 32h (4 dias)**

---

## 4. SPRINT 2: Semanas 4-5 (Clima Real)

### 🌡️ OBJETIVO
Integrar Open-Meteo API para dados climáticos reais e substitui zeros por dados autênticos.

### 📌 TAREFAS

#### Backend: API de Clima
```
[ ] 2.1 - Integrar Open-Meteo API
   - pip install openmeteo-requests
   - Criar: backend/irrigacao/services.py
   
   ```python
   # services.py
   import openmeteo_requests
   import requests_cache
   import pandas as pd
   from retry_requests import retry
   
   def fetch_weather(latitude, longitude):
       client = openmeteo_requests.Client()
       params = {
           "latitude": latitude,
           "longitude": longitude,
           "hourly": ["temperature_2m", "relative_humidity_2m",
                     "precipitation", "wind_speed_10m"],
           "daily": ["temperature_2m_max", "temperature_2m_min",
                    "precipitation_sum"],
           "timezone": "America/Sao_Paulo"
       }
       response = client.weather_api(
           "https://api.open-meteo.com/v1/forecast", 
           params=params
       )
       return response
   ```

[ ] 2.2 - Criar modelo DadosClimaticosCache
   ```python
   class DadosClimaticosCache(models.Model):
       fazenda = models.ForeignKey(Fazenda, ...)
       latitude = models.FloatField()
       longitude = models.FloatField()
       temperatura_atual = models.FloatField()
       umidade = models.FloatField()
       precipitacao = models.FloatField()
       previsao_json = models.JSONField()  # 7 dias
       atualizado_em = models.DateTimeField(auto_now=True)
   ```

[ ] 2.3 - Criar Celery task
   ```python
   @shared_task
   def atualizar_clima_todas_fazendas():
       for fazenda in Fazenda.objects.all():
           atualizar_clima(fazenda.latitude, fazenda.longitude)
           wait(30)  # Rate limiting
   ```
   - Schedule: a cada 6 horas
   - django-celery-beat config

[ ] 2.4 - Criar API endpoint
   GET /api/irrigacao/clima/{fazenda_id}/
   GET /api/irrigacao/clima/previsao/{fazenda_id}/
   - Retornar JSON com 7-day forecast
   - Cache por 1 hora
```

#### Frontend: Visualização
```
[ ] 2.5 - Criar componente WeatherCard
   - Exibir: temp atual, umidade, chuva prevista
   - Usar Recharts para gráfico 7-day
   - Atualizar a cada 6h
   
   ```typescript
   <WeatherCard fazendaId={id} />
   ```

[ ] 2.6 - Adicionar weather widget no dashboard
   - Top da página (dashboard/climate)
   - Card component com ícones SVG
   - Responsive mobile

[ ] 2.7 - Criar página /dashboard/clima
   - Gráfico de temperatura (últimos 30 dias)
   - Gráfico de precipitação
   - Alertas de temperatura extrema
   - Export para CSV
```

#### Testing
```
[ ] 2.8 - Testes API climate
   - Mock Open-Meteo response
   - test_fetch_weather_success.py
   - test_fetch_weather_invalid_coords.py
   - test_cache_expiration.py
   
[ ] 2.9 - Testes frontend
   - <WeatherCard /> renderiza
   - Click em card abre previsão
   - Responsive em mobile
```

#### DevOps
```
[ ] 2.10 - Configurar variáveis ambiente
   - OPEN_METEO_BASE_URL (free, sem API key)
   - CELERY_BEAT_SCHEDULE
   
[ ] 2.11 - Documentar integração
   - README com instruções
   - .env.example atualizado
   - API docs (Swagger)
```

### ✅ Critério de Aceitação

```
✓ GET /api/irrigacao/clima/{id}/ retorna temperatura real
✓ Previsão de 7 dias carregando
✓ WeatherCard exibe no dashboard
✓ Dados atualizam a cada 6h automaticamente
✓ Testes cobrindo casos de sucesso e erro
✓ Cache funcionando (sem chamadas repetidas)
✓ Zero valores hardcoded de clima
```

### 📊 Esforço
- Backend: 12h
- Frontend: 8h
- Testing: 6h
- DevOps: 4h
- **Total: 30h (4 dias)**

---

## 5. SPRINT 3: Semanas 6-7 (Talhões)

### 🗺️ OBJETIVO
Implementar Talhões como entidade funcional com geometria no mapa.

### 📌 TAREFAS

#### Backend: Modelo Talhão
```
[ ] 3.1 - Completar modelo Talhao
   Verificar: backend/irrigacao/models.py ou criar novo app
   
   ```python
   class Talhao(models.Model):
       fazenda = models.ForeignKey(Fazenda, ...)
       usuario = models.ForeignKey(User, ...)
       nome = models.CharField(max_length=255)
       cultura = models.CharField(  # soja, milho, etc
           choices=CULTURAS_CHOICES
       )
       area_hectares = models.DecimalField()
       geometria = models.PolygonField()  # GeoJSON
       data_plantio = models.DateField(null=True)
       data_previsao_colheita = models.DateField(null=True)
       safra = models.ForeignKey(Safra, null=True, ...)
       ativo = models.BooleanField(default=True)
       created_at = models.DateTimeField(auto_now_add=True)
       updated_at = models.DateTimeField(auto_now=True)
       
       class Meta:
           ordering = ['-created_at']
   ```

[ ] 3.2 - Criar serializer
   ```python
   class TalhaoSerializer(serializers.ModelSerializer):
       area_hectares = serializers.DecimalField(...)
       classe Meta:
           model = Talhao
           fields = ['id', 'nome', 'cultura', 'geometria', 
                    'area_hectares', 'data_plantio', ...]
           read_only_fields = ['created_at']
   ```

[ ] 3.3 - Criar ViewSet
   ```python
   class TalhaoViewSet(viewsets.ModelViewSet):
       serializer_class = TalhaoSerializer
       permission_classes = [IsAuthenticated]
       
       def get_queryset(self):
           return Talhao.objects.filter(usuario=self.request.user)
       
       @action(detail=True, methods=['get'])
       def ndvi(self, request, pk=None):
           # Será usado no Sprint 4
           pass
   ```

[ ] 3.4 - Criar rotas
   GET    /api/talhoes/
   POST   /api/talhoes/
   GET    /api/talhoes/{id}/
   PATCH  /api/talhoes/{id}/
   DELETE /api/talhoes/{id}/
   
   GET    /api/fazendas/{fazenda_id}/talhoes/

[ ] 3.5 - Criar migrations
   python manage.py makemigrations
   python manage.py migrate
   Validar em dev database

[ ] 3.6 - Atualizar admin
   ```python
   @admin.register(Talhao)
   class TalhaoAdmin(admin.ModelAdmin):
       list_display = ['nome', 'cultura', 'area_hectares']
       list_filter = ['cultura', 'ativo']
       search_fields = ['nome']
   ```
```

#### Frontend: Componentes
```
[ ] 3.7 - Criar componente TalhaoForm
   - Inputs: nome, cultura (select), data_plantio
   - File upload para desenhar no mapa (GeoJSON)
   - Validação de geometria
   
   ```typescript
   <TalhaoForm 
     fazendaId={id} 
     onSave={handleSave}
   />
   ```

[ ] 3.8 - Adicionar desenho de Talhao no mapa
   - Usar Leaflet-Draw + GeoJSON
   - Click "Criar Talhão"
   - Desenhar polígono
   - Salvar geometria em POST /api/talhoes/

[ ] 3.9 - Criar TalhaoList component
   - Listar talhões da fazenda
   - Delete + Edit inline
   - Cards com: nome, cultura, area
   
   ```typescript
   <TalhaoList fazendaId={id} />
   ```

[ ] 3.10 - Página /dashboard/fazendas/{id}/talhoes
   - MapEditor (desenho)
   - TalhaoList (tabela)
   - TalhaoForm (criar/editar)

[ ] 3.11 - Integração tipos TypeScript
   ```typescript
   interface Talhao {
     id: number;
     nome: string;
     cultura: string;
     area_hectares: number;
     geometria: GeoJSON.Polygon;
     data_plantio?: Date;
   }
   ```
```

#### Testing
```
[ ] 3.12 - Testes backend Talhao
   - test_create_talhao.py
   - test_user_cannot_see_others_talhao.py
   - test_talhao_geometry_validation.py
   - test_talhao_area_calculation.py

[ ] 3.13 - Testes frontend
   - <TalhaoForm /> renderiza
   - Click em "Desenhar" abre mapa
   - Salvar talhão faz POST
   - <TalhaoList /> lista corretamente
   - Delete mostra confirmação

[ ] 3.14 - Validação geometria
   - Polígono deve ter mínimo 3 pontos
   - Área deve ser > 0
   - Validar em cliente E servidor
```

#### Documentation
```
[ ] 3.15 - Atualizar Swagger/ReDoc
   - Documentar endpoints Talhao
   - Diagramas de geometria
   
[ ] 3.16 - Criar guia de uso
   - "Como criar talhão"
   - Screenshots
   - Exemplos GeoJSON
```

### ✅ Critério de Aceitação

```
✓ POST /api/talhoes/ cria talhão com geometria
✓ GET /api/talhoes/ lista talhões do usuário
✓ Desenho no mapa salva geometria corretamente
✓ <TalhaoForm /> renderiza e salva
✓ <TalhaoList /> edita e deleta
✓ Página /dashboard/fazendas/{id}/talhoes funciona
✓ 20+ testes passando
✓ Swagger documenta todos endpoints
```

### 📊 Esforço
- Backend: 16h
- Frontend: 20h
- Testing: 12h
- Documentation: 4h
- **Total: 52h (1 semana)**

---

## 6. SPRINT 4: Semanas 8+ (MVP Validado)

### ✅ OBJETIVO
Completar MVP com testes, documentação e validação de mercado.

### 📌 TAREFAS

#### Backend: Completude
```
[ ] 4.1 - Validação de uploads
   - Tipos permitidos: JPG, PNG (apenas)
   - Tamanho máximo: 5MB
   - Validar conteúdo (magic bytes)
   - backend/pragas/views.py
   
   ```python
   def validate_image_upload(image):
       if image.size > 5 * 1024 * 1024:
           raise ValidationError("Máx 5MB")
       if image.content_type not in ['image/jpeg', 'image/png']:
           raise ValidationError("JPG ou PNG")
   ```

[ ] 4.2 - Implementar paginação consistente
   - Padronizar em todos endpoints
   - 20 items por página default
   - Cursor-based ou offset?
   - Documentar em Swagger
   
   ```python
   REST_FRAMEWORK = {
       'DEFAULT_PAGINATION_CLASS': 
           'rest_framework.pagination.PageNumberPagination',
       'PAGE_SIZE': 20
   }
   ```

[ ] 4.3 - Filtros em endpoints principais
   - GET /api/talhoes/?cultura=soja
   - GET /api/pragas/?status=aberto
   - GET /api/aplicacoes/?data_inicio=2025-01-01
   - Usar django-filter

[ ] 4.4 - Rate limiting
   - 100 requests/hora para usuários free
   - 1000 requests/hora para pagos
   - Implementar com django-ratelimit

[ ] 4.5 - Documentação API
   - Atualizar Swagger completo
   - Exemplos de requests/responses
   - Error codes documentados
   - drf-yasg configurado
```

#### Frontend: Polimento
```
[ ] 4.6 - Validação de formulários
   - react-hook-form em todos forms
   - Feedback visual de erro
   - Mensagens customizadas
   - Validação servidor + cliente

[ ] 4.7 - Loading states
   - Spinners em async operations
   - Disable buttons durante POST/PATCH
   - Toast notifications (sucesso/erro)
   - Usar shadcn/ui <Skeleton />

[ ] 4.8 - Responsividade mobile
   - Testar em iPhone 12, 14
   - Testar em Android comum
   - Drawer mobile menu
   - Touch-friendly buttons (44px min)

[ ] 4.9 - Dark mode (opcional)
   - next-themes integrado?
   - Usar TailwindCSS darkMode
   - Preferences storage

[ ] 4.10 - Acessibilidade
   - ARIA labels
   - Keyboard navigation (tab)
   - Color contrast ratio (WCAG AA)
   - Screen reader testing
```

#### Testing: Cobertura
```
[ ] 4.11 - Aumentar cobertura para 80%
   - pytest --cov backend/
   - Focus areas: views.py, serializers.py
   - Ignorar migrations
   
   ```bash
   pytest --cov=backend \
          --cov-report=html \
          --cov-report=term-missing
   ```

[ ] 4.12 - Testes de integração
   - Fluxo completo: login → criar fazenda → criar talhão
   - GET /api/fazendas/ → mapas aparecem
   - POST clima → dados salvam + cache

[ ] 4.13 - Testes de performance
   - GET /api/talhoes/ com 1000 talhões < 200ms
   - POST /api/talhoes/ < 500ms
   - Verificar N+1 queries (select_related)

[ ] 4.14 - Testes frontend
   - Snapshot testing com Jest
   - Component integration tests
   - E2E com Cypress (opcional)
```

#### DevOps e Segurança
```
[ ] 4.15 - HTTPS e CORS
   - CORS_ALLOWED_ORIGINS configurado
   - SECURE_SSL_REDIRECT em produção
   - CSRF tokens em POST

[ ] 4.16 - Variáveis ambiente
   - DATABASE_URL
   - SECRET_KEY
   - DEBUG (false em produção)
   - OPEN_METEO_API_KEY (se trocarem de provider)
   - AWS_S3_BUCKET (para uploads)

[ ] 4.17 - Setup CI/CD (GitHub Actions)
   ```yaml
   name: Tests
   on: [push, pull_request]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - run: pip install -r requirements.txt
         - run: pytest backend/ --cov=backend/
         - run: npm test (frontend)
   ```

[ ] 4.18 - Docker setup (opcional na v1)
   - Dockerfile para backend
   - docker-compose.yml
   - .dockerignore

[ ] 4.19 - Backup strategy
   - PostgreSQL backups diários
   - S3 ou similar
   - Documentar restore procedure
```

#### Documentação
```
[ ] 4.20 - README atualizado
   - Como instalar
   - Como rodar localmente
   - Stack utilizado
   - Contribuição guidelines
   - License

[ ] 4.21 - CONTRIBUTING.md
   - Branch naming: feature/xyz, bugfix/xyz
   - Commit message pattern
   - PR checklist
   - Code style (black, prettier)

[ ] 4.22 - API docs
   - Swagger UI rodando em /api/swagger/
   - ReDoc em /api/redoc/
   - Download OpenAPI.json

[ ] 4.23 - User guides
   - Onboarding páginas
   - Tutorial vídeo (opcional)
   - FAQ
   - Troubleshooting
```

#### Validação de Mercado
```
[ ] 4.24 - Preparação Beta
   - Criar landing page
   - Email welcome sequence
   - Formulário de feedback
   - Métricas de uso (Segment ou Mixpanel)

[ ] 4.25 - Recrutar 10 beta testers
   - Agricultor/pequeno produtor no Brasil
   - Fornecedor agrícola (validar B2B)
   - Pesquisador de agro-tech
   - Registrar feedback em sheet

[ ] 4.26 - Analytics setup
   - Google Analytics 4
   - Event tracking (login, create_fazenda, etc)
   - Funnels (signup → create → share)
   - Heatmap (opcional)
```

### ✅ Critério de Aceitação

```
✓ 80%+ cobertura de testes (pytest --cov)
✓ CI/CD rodando em GitHub Actions
✓ Swagger/ReDoc documentado 100%
✓ README com instruções claras
✓ 10 beta testers com feedback positivo
✓ Responsividade testada em mobile
✓ Acessibilidade WCAG AA
✓ Zero vulnerabilidades de segurança
✓ Performance: P95 < 500ms em endpoints principais
```

### 📊 Esforço
- Backend: 16h
- Frontend: 16h
- Testing: 16h
- DevOps/CI: 12h
- Documentation: 12h
- Validation: 8h
- **Total: 80h (2 semanas)**

---

## 7. MATRIZ DE DEPENDÊNCIAS

### Sequência Crítica

```
Sprint 0 (Segurança)
    ↓
Sprint 1 (Modelos + Multi-tenancy)
    ├→ Sprint 2 (Clima) [paralelo]
    ├→ Sprint 3 (Talhões) [depende S1]
    ↓
Sprint 4 (MVP + Validação) [depende S2, S3]
    ↓
Beta: 100 usuários testers
```

### Tarefas que Podem Rodar em Paralelo

| Sprint | Paralelo | Dependência |
|--------|----------|-------------|
| 1 | 1.1-1.4 (Backend) com 1.12-1.14 (Frontend) | Nenhuma |
| 2 | 2.1-2.4 (Backend API) com 2.5-2.7 (Frontend) | Nenhuma |
| 3 | 3.1-3.6 com 3.7-3.11 | Backend primeiro |
| 4 | 4.1-4.5 com 4.6-4.10 | Nenhuma |

### Tarefas com Bloqueadores

| Tarefa | Bloqueador | Sprint |
|--------|-----------|--------|
| 1.5 | 1.1-1.4 concluído | S1 |
| 2.5-2.7 | 2.1-2.4 testado | S2 |
| 3.7+ | 3.1-3.6 merged | S3 |
| 4.24-26 | 4.1-10 funcionando | S4 |

---

## 8. MÉTRICAS DE SUCESSO

### Por Sprint

#### Sprint 0
- ✅ Zero credenciais em git
- ✅ 0 console.log em main branch
- ✅ .gitignore bloqueia sensíveis

#### Sprint 1
- ✅ 1 único Fazenda model
- ✅ 100% ViewSets com filtro usuário
- ✅ 15+ testes de segurança
- ✅ useAuth hook funcional

#### Sprint 2
- ✅ Open-Meteo integrando
- ✅ 7-day forecast em API
- ✅ WeatherCard no dashboard
- ✅ Dados reais (não hardcoded)

#### Sprint 3
- ✅ CRUD Talhão 100% funcional
- ✅ Desenho de geometria funciona
- ✅ Página /talhoes/ operacional
- ✅ 20+ testes passando

#### Sprint 4
- ✅ 80% cobertura testes
- ✅ CI/CD verde
- ✅ 10 beta testers
- ✅ NPS/feedback positivo

### Métricas de Produto

| Métrica | Target | Como Medir |
|---------|--------|-----------|
| **Tempo resposta API** | <500ms P95 | New Relic, DataDog |
| **Uptime** | 99.5% | Monitoring |
| **Cobertura testes** | 80% | pytest --cov |
| **Mobile UX** | 90+ Lighthouse | tools.google.com |
| **User satisfaction** | NPS 50+ | Typeform |
| **Bugs/semana** | <5 | GitHub issues |

### Métricas de Negócio

| Métrica | Target | Fase |
|---------|--------|------|
| **Beta testers** | 10 | S4 |
| **Signup rate** | 50+ MAU | Beta |
| **Feature adoption** | 80% create fazenda | Beta |
| **Churn rate** | <5% MoM | Beta |
| **Feedback NPS** | 50+ | Beta |

---

## 9. RISCOS E MITIGAÇÃO

### Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|--------|-----------|
| **Migration conflito no banco** | Alta | Alto | Backup antes, test em staging |
| **Open-Meteo API rate limit** | Média | Médio | Cache agressivo, fallback |
| **Geometria Leaflet lenta com muitos talhões** | Média | Médio | Clustering, pagination, Web Workers |
| **Quebra compatibilidade Django deprecation** | Baixa | Médio | Manter Django 4.2 LTS até 2026 |

### Riscos de Produto

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|--------|-----------|
| **Beta testers esperam mais features** | Alta | Alto | Definir escopo claro Day 1 |
| **Falta dados históricos de clima** | Alto | Alto | Usar OpenWeather archive (pago) ou integrar depois |
| **Competidor copia MVP** | Média | Alto | Build moat com dados + IA, diferencial pecuária |
| **Performance degrada com dados reais** | Média | Médio | Load testing, otimizar queries, caching |

### Mitigações

1. **Testes Frequentes**
   - Deploy to staging cada tarefa
   - Teste manual antes de merge
   - Automated CI/CD pipeline

2. **Comunicação com Stakeholders**
   - Daily standup (15min)
   - Sprint retrospectives
   - Beta tester updates semanais

3. **Backup e Rollback**
   - Database backups antes de migrations
   - Feature flags para rollback rápido
   - Version control disciplinado

---

## 📊 RESUMO EXECUTIVO

| Sprint | Duração | Foco | Entregas | Risk |
|--------|---------|------|----------|------|
| **0** | 1 sem | Segurança | Zero credenciais públicas | Baixo |
| **1** | 2 sem | Fundação | 1 Fazenda model, multi-tenancy, auth | Médio |
| **2** | 2 sem | Clima Real | Open-Meteo integrando, 7-day forecast | Médio |
| **3** | 2 sem | Talhões | CRUD funcional, mapa geometria | Alto |
| **4** | 2 sem | MVP Final | 80% testes, CI/CD, 10 beta testers | Médio |
| **Beta** | 4 sem | Validação | 100 usuários ativos, feedback NPS 50+ | Médio |

### Timeline Visual

```
FEV    MAR    ABR    MAI
|------|------|------|------|
S0 S1 S2 S3 S4  Beta  Scale
↓  ↓  ↓  ↓  ↓    ↓     ↓
Sec Mod Clim Tal MVP  100u  200u+
```

---

## 📎 Documentos Relacionados

- [AVALIACAO_ESTADO_ATUAL.md](AVALIACAO_ESTADO_ATUAL.md) - Análise que originou este plano
- [PLANO_PRODUTO.md](PLANO_PRODUTO.md) - Roadmap de produto em 3 fases
- [plano-estrategico.md](plano-estrategico.md) - Análise de mercado

---

**Versão:** 1.0  
**Data:** 07 de fevereiro de 2026  
**Status:** Pronto para execução  
**Próximo Review:** Fim de Sprint 0 (14 de fevereiro)
