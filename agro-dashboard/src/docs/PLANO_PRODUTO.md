# AGROIA - PLANO ESTRATEGICO DE PRODUTO

> Documento de produto | Visao CEO/Diretor de Inovacao
> Ultima atualizacao: 07/02/2026

---

## SUMARIO

1. [Raio-X do Produto Hoje](#1-raio-x-do-produto-hoje)
2. [Erros e Problemas Criticos](#2-erros-e-problemas-criticos)
3. [Melhorias Imediatas](#3-melhorias-imediatas-proximos-30-dias)
4. [Plano de Produto por Fases](#4-plano-de-produto---visao-ceo)
5. [Modelo de Negocio](#5-modelo-de-negocio)
6. [Diferenciais de Mercado](#6-diferenciais-de-mercado-brasil)
7. [Libs Gratuitas Estrategicas](#7-libs-gratuitas-estrategicas)
8. [Visao Final do Produto](#8-como-o-produto-fica-no-final)
9. [Proximos Passos](#9-proximos-passos-imediatos)

---

## 1. RAIO-X DO PRODUTO HOJE

### Stack Atual

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 + React 19 + Leaflet + Recharts + shadcn/ui |
| Backend | Django 4.2 + Django REST Framework + PostgreSQL (Supabase) |
| IA | TensorFlow / MobileNet (deteccao de pragas) |
| Infra | Celery + Redis (tasks assincronas) |
| Auth | JWT (SimpleJWT) + Cookies HTTP-only |
| Docs | Swagger/ReDoc (drf-yasg) |

### Modulos e Maturidade

| Modulo | Status | Maturidade | Observacao |
|--------|--------|------------|------------|
| Autenticacao (JWT + Cookies) | Funcional | 70% | Login, registro, refresh token |
| Gestao de Fazendas (CRUD) | Funcional | 60% | Criar, editar, excluir fazendas |
| Editor de Mapas (Leaflet + GeoJSON) | Funcional | 50% | Desenho de poligonos, marcadores |
| Monitoramento Climatico | Estrutura pronta | 30% | Modelo existe, sem API real |
| Deteccao de Pragas (MobileNet AI) | Estrutura pronta | 25% | Modelo generico, nao treinado para agro |
| Irrigacao | Estrutura pronta | 20% | Modelo basico |
| Produtividade | Estrutura pronta | 20% | CRUD basico |
| Notificacoes | Estrutura pronta | 30% | Multi-tipo, multi-categoria |
| Dashboard Agregado | Basico | 35% | Stats e graficos basicos |

### Estrutura de Diretarios

```
agro_ia/
├── agro-dashboard/              # Frontend (Next.js 15 + React 19)
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── login/           # Pagina de login
│   │   │   ├── (dashboard)/     # Rotas protegidas
│   │   │   │   └── dashboard/
│   │   │   │       ├── fazendas/
│   │   │   │       ├── mapas/
│   │   │   │       ├── pragas/
│   │   │   │       ├── irrigacao/
│   │   │   │       ├── clima/
│   │   │   │       ├── produtividade/
│   │   │   │       ├── notificacoes/
│   │   │   │       ├── configuracoes/
│   │   │   │       └── admin/usuarios/
│   │   │   └── providers/       # Auth + Theme providers
│   │   ├── components/          # Componentes React
│   │   │   ├── ui/              # shadcn/ui
│   │   │   ├── layout/          # Header, Sidebar
│   │   │   ├── maps/            # MapEditor, AgroMap, HeatMap
│   │   │   ├── fazendas/        # FazendaList, FazendaForm
│   │   │   ├── dashboard/       # StatCard, Charts
│   │   │   └── charts/          # ProductivityChart
│   │   ├── hooks/               # useAuth, useFazendas, useTalhoes
│   │   ├── lib/                 # api.ts, auth.ts
│   │   └── types/               # TypeScript interfaces
│   └── package.json
├── backend/                     # Backend (Django 4.2)
│   ├── settings.py
│   ├── urls.py
│   ├── custom_auth/             # Autenticacao customizada
│   ├── usuarios/                # Gestao de usuarios
│   ├── fazenda/                 # Gestao de fazendas
│   ├── maps/                    # Mapas com GeoJSON
│   ├── irrigacao/               # Irrigacao + Clima
│   ├── pragas/                  # Deteccao de pragas (IA)
│   ├── produtividade/           # Rastreamento de produtividade
│   ├── notificacoes/            # Sistema de notificacoes
│   └── dashboard/               # Dados agregados
├── requirements.txt
├── manage.py
└── .env
```

### Endpoints da API

```
# Autenticacao
POST   /api/auth/login/                        # Login
POST   /api/auth/refresh/                       # Refresh token
POST   /api/auth/logout/                        # Logout
POST   /api/auth/register/                      # Registro
GET    /api/auth/me/                            # Usuario atual

# Fazendas
GET    /api/fazendas/                           # Listar fazendas
POST   /api/fazendas/                           # Criar fazenda
GET    /api/fazendas/{id}/                      # Detalhe
PATCH  /api/fazendas/{id}/                      # Atualizar
DELETE /api/fazendas/{id}/                      # Excluir

# Mapas
GET    /api/maps/fazenda/{id}/mapas/            # Listar mapas da fazenda
POST   /api/maps/fazenda/{id}/mapas/            # Criar mapa
PATCH  /api/maps/fazenda/{id}/mapas/{mapa_id}/  # Atualizar mapa
DELETE /api/maps/fazenda/{id}/mapas/{mapa_id}/  # Excluir mapa

# Clima e Irrigacao
GET    /api/irrigacao/clima/                    # Dados climaticos
GET    /api/irrigacao/irrigacoes/               # Dados de irrigacao
GET    /api/irrigacao/clima/atual/              # Clima atual
GET    /api/irrigacao/clima/resumo/             # Resumo climatico

# Pragas
GET    /api/pragas/                             # Listar pragas
POST   /api/pragas/upload/                      # Upload com IA
GET    /api/pragas/{id}/                        # Detalhe
PATCH  /api/pragas/{id}/atualizar_status/       # Atualizar status

# Produtividade
GET    /api/produtividade/                      # Listar dados
POST   /api/produtividade/                      # Criar registro
GET    /api/produtividade/resumo/               # Resumo por fazenda

# Notificacoes
GET    /api/notificacoes/                       # Listar
PATCH  /api/notificacoes/{id}/                  # Marcar como lida

# Dashboard
GET    /api/dashboard/                          # Dados agregados

# Documentacao
GET    /api/swagger/                            # Swagger UI
GET    /api/redoc/                              # ReDoc
```

### Banco de Dados (Supabase PostgreSQL)

| Tabela | Descricao |
|--------|-----------|
| custom_auth_customuser | Usuarios com email como login |
| fazenda_fazenda | Fazendas com coordenadas |
| maps_mapa | Mapas com GeoJSON (camadas_ativas) |
| irrigacao_dadosclimaticos | Temperatura, umidade, precipitacao |
| irrigacao_irrigacao | Sistemas de irrigacao |
| pragas_praga | Registros de pragas com imagens |
| produtividade_dadosprodutividade | Metricas de produtividade |
| notificacoes_notificacao | Notificacoes do sistema |

### Tipos TypeScript Definidos

```typescript
// Implementados
User, AuthResponse, Fazenda, Mapa, Praga,
DadosClimaticos, Irrigacao, DadosProdutividade, Notificacao

// Planejados (tipo existe, backend nao)
Talhao, Safra, SafraTalhao, Aplicacao
```

### Dependencias Frontend

```
next@15.1.6, react@19.0.0, react-dom@19.0.0
leaflet, react-leaflet, leaflet-draw, react-leaflet-draw
recharts, plotly.js, react-plotly.js
@radix-ui/* (8 pacotes), shadcn-ui, tailwindcss
react-hook-form, zustand, axios
next-auth@beta, next-themes, js-cookie
```

### Dependencias Backend

```
Django==4.2.10, djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.3.1, drf-yasg==1.21.8
psycopg2-binary==2.9.9, redis==5.0.1
celery==5.3.6, django-celery-beat==2.6.0
TensorFlow==2.18.0, Keras==3.8.0
numpy==2.0.2, Pillow==10.2.0
python-dotenv==1.0.0, PyJWT==2.10.1
```

---

## 2. ERROS E PROBLEMAS CRITICOS

### Erros de Arquitetura

| # | Problema | Severidade | Local |
|---|---------|------------|-------|
| 1 | Modelo Fazenda duplicado (usuarios/ e fazenda/) | CRITICO | backend/usuarios/models.py + backend/fazenda/models.py |
| 2 | Rotas duplicadas (/api/mapas/ e /api/maps/) | ALTO | backend/urls.py |
| 3 | Hook useAuth vazio | MEDIO | agro-dashboard/src/hooks/useAuth.ts |
| 4 | Prints de debug no MapaViewSet | ALTO | backend/maps/views.py |
| 5 | .env com credenciais no repositorio | CRITICO | .env |
| 6 | db.sqlite3 no repositorio | MEDIO | db.sqlite3 |
| 7 | __pycache__ versionado no git | BAIXO | backend/**/__pycache__/ |
| 8 | Notificacoes com managed=False | MEDIO | backend/notificacoes/models.py |

### Erros de Produto

| # | Problema | Severidade | Impacto |
|---|---------|------------|---------|
| 9 | Sem Talhoes implementados | CRITICO | Entidade mais importante do agro nao existe no backend |
| 10 | Sem dados reais de clima | CRITICO | Nenhuma integracao com API de clima |
| 11 | MobileNet generico (nao detecta pragas reais) | ALTO | Retorna "banana", "hamster" em vez de pragas |
| 12 | Sem multi-tenancy real | CRITICO | Usuario pode ver dados de outro usuario |
| 13 | Zero testes (unitarios ou integracao) | ALTO | Nenhuma cobertura de testes |
| 14 | Sem validacao de upload de imagens | ALTO | Tipo, tamanho e conteudo nao validados |

---

## 3. MELHORIAS IMEDIATAS (Proximos 30 dias)

### Prioridade CRITICA (Semana 1)

- [ ] Remover .env do git + adicionar ao .gitignore
- [ ] Remover db.sqlite3 e __pycache__ do repositorio
- [ ] Unificar modelo Fazenda (manter apenas um)
- [ ] Limpar rotas duplicadas - padrao unico
- [ ] Remover console.logs e prints de debug
- [ ] Configurar .gitignore adequado
- [ ] Implementar filtro por usuario em TODOS os endpoints

### Prioridade ALTA (Semana 2-3)

- [ ] Implementar Talhoes (backend + frontend)
- [ ] Integrar API de clima real (Open-Meteo - 100% gratuito)
- [ ] Adicionar testes basicos nos endpoints
- [ ] Implementar validacao de uploads
- [ ] Configurar HTTPS e seguranca de cookies para producao

### Prioridade MEDIA (Semana 4)

- [ ] Implementar Safras (ciclos de plantio)
- [ ] Melhorar dashboard com dados reais
- [ ] Adicionar paginacao consistente em todos endpoints
- [ ] Documentar API completa no Swagger

---

## 4. PLANO DE PRODUTO - VISAO CEO

### FASE 1: MVP SOLIDO (Mes 1-3) - "Fundacao"

**Objetivo:** Produto funcional para pequeno produtor testar gratuitamente

| Feature | Lib Gratuita | Prioridade | Descricao |
|---------|-------------|------------|-----------|
| Talhoes com geometria no mapa | Leaflet + Turf.js | CRITICO | Subdivisao de fazenda com poligonos |
| Clima real (previsao 7 dias) | Open-Meteo API (free) | CRITICO | Temperatura, chuva, umidade em tempo real |
| NDVI basico via satelite | Sentinel Hub / GEE (free) | ALTO | Indice de vegetacao por satelite |
| Safras e ciclos de plantio | Django nativo | ALTO | Controle de plantio e colheita |
| Relatorios PDF | jsPDF / react-pdf (free) | MEDIO | Exportar dados em PDF |
| Alertas automaticos de clima | Celery + Redis (ja tem) | MEDIO | Notificacao de geada, seca, chuva forte |
| PWA (Progressive Web App) | Next.js built-in | MEDIO | Funciona offline no campo |

**Meta:** 100 usuarios ativos no tier gratuito

### FASE 2: INTELIGENCIA (Mes 4-6) - "Diferencial"

**Objetivo:** Features que ninguem no Brasil oferece gratis

| Feature | Lib Gratuita | Impacto | Descricao |
|---------|-------------|---------|-----------|
| Analise NDVI com timeline | Sentinel-2 API + Plotly | REVOLUCIONARIO | Historico de saude da vegetacao |
| Mapa de calor de pragas | Leaflet.heat (free) | ALTO | Visualizar focos de infestacao |
| Previsao de safra com ML | scikit-learn / TensorFlow | ALTO | Estimar produtividade futura |
| Calculo de ET0 (evapotranspiracao) | Penman-Monteith (formula) | ALTO | Necessidade hidrica da cultura |
| Historico climatico 30 dias | Open-Meteo API (free) | ALTO | Tendencias e padroes |
| Rastreabilidade de aplicacoes | Django nativo | MEDIO | Registro de defensivos e fertilizantes |
| Dashboard comparativo safra-a-safra | Recharts (ja tem) | MEDIO | Comparar desempenho entre safras |

**Meta:** 500 usuarios, 50 pagantes (Starter)

### FASE 3: ESCALA (Mes 7-12) - "Crescimento"

**Objetivo:** Atrair medio e grande produtor

| Feature | Lib/API | Impacto | Descricao |
|---------|---------|---------|-----------|
| Integracao CAR/INCRA | APIs Gov BR (free) | DIFERENCIAL | Dados ambientais e fundiarios |
| Mapas de solo por zona | Turf.js + interpolacao | ALTO | Fertilidade, pH, nutrientes |
| Deteccao de pragas treinada | YOLOv8 (Ultralytics, free) | ALTO | Modelo treinado com pragas BR |
| Integracao IoT (sensores) | MQTT / Mosquitto (free) | ALTO | Dados em tempo real do campo |
| Marketplace de insumos | Django + PagSeguro | RECEITA | Venda de sementes, defensivos |
| Multi-idioma (EN/ES) | next-intl (free) | EXPANSAO | Internacionalizacao |
| API publica | DRF (ja suporta) | PLATAFORMA | Abrir para integradores |

**Meta:** 2.000 usuarios, 300 pagantes (Starter + Pro)

### FASE 4: ENTERPRISE e GOV (Mes 12-24) - "Dominio"

**Objetivo:** Contratos com grandes empresas e governo

| Feature | Estrategia | Impacto | Descricao |
|---------|-----------|---------|-----------|
| Blockchain para rastreabilidade | Hyperledger Fabric (free) | INOVACAO | Certificacao de origem |
| Integracao MAPA/EMBRAPA | Parcerias institucionais | CREDIBILIDADE | Dados oficiais |
| White-label para cooperativas | Multi-tenant architecture | RECEITA | Produto customizado |
| IA conversacional (ChatBot) | LangChain + Claude API | DIFERENCIAL | Assistente virtual agro |
| Compliance ESG/ABC+ | Calculo de carbono | GOV | Programa ABC do governo |
| Integracao com drones | DroneKit (free) | PREMIUM | Mapeamento aereo |
| ERP agricola integrado | Modulos Django | ENTERPRISE | Financeiro + RH + estoque |

**Meta:** 10.000 usuarios, contratos enterprise e governo

---

## 5. MODELO DE NEGOCIO

### Tiers de Precificacao

| Tier | Hectares | Preco | Publico | Features |
|------|----------|-------|---------|----------|
| FREE | ate 50ha | R$ 0 | Pequeno produtor | Mapas, clima basico, 1 fazenda |
| STARTER | ate 200ha | R$ 49/mes | Pequeno-medio | + NDVI, relatorios, 3 fazendas |
| PRO | ate 1000ha | R$ 149/mes | Medio produtor | + IA pragas, IoT, API, ilimitado |
| ENTERPRISE | ilimitado | R$ 499/mes | Grande produtor | + White-label, suporte dedicado |
| GOV/COOP | custom | Contrato anual | Governo/Cooperativas | Customizado |

### Fontes de Receita

```
1. ASSINATURAS         - Core revenue (recorrente mensal)
2. MARKETPLACE         - Comissao 5-10% sobre venda de insumos
3. API                 - Cobranca por chamada para integradores
4. CONSULTORIA         - Implementacao em grandes fazendas
5. DADOS AGREGADOS     - Insights anonimizados para mercado (commodities)
6. WHITE-LABEL         - Licenciamento para cooperativas
7. TREINAMENTOS        - Academia de capacitacao agricola
```

### Projecao de Receita

```
ANO 1:  ~R$ 100.000  (foco em base de usuarios gratuitos)
ANO 2:  ~R$ 500.000  (conversao para pagantes + marketplace)
ANO 3:  ~R$ 2.000.000 (enterprise + governo + escala)
```

---

## 6. DIFERENCIAIS DE MERCADO (BRASIL)

### O que os concorrentes NAO fazem

| Diferencial | Descricao | Concorrentes |
|-------------|-----------|-------------|
| NDVI gratuito | Sentinel-2 e publico, ninguem oferece gratis | Cobram R$200+ |
| IA de pragas treinada BR | Modelo treinado com pragas brasileiras | Usam modelos genericos |
| Integracao gov | CAR, INCRA, MAPA, NF-e agro | Nenhum integra |
| Open API | Plataforma aberta para integracoes | Todos sao fechados |
| Offline-first | PWA funciona sem internet (area rural) | Poucos oferecem |
| Clima hiperlocal | Combinar INMET + OpenWeather + sensores | Basico |
| Freemium real | Funcionalidades uteis de verdade no tier gratis | Free muito limitado |

### Analise Competitiva

| Concorrente | Forte em | Fraco em | Nossa vantagem |
|-------------|---------|---------|----------------|
| Aegro | Gestao financeira | Mapas, IA | Full-stack com mapas + IA |
| Strider | Monitoramento de pragas | Clima, gestao | Plataforma completa |
| Farmbox | Interface simples | Sem IA, basico | Tecnologia avancada |
| Climate FieldView (Bayer) | Dados satelite | Preco alto, enterprise only | Acessivel para todos |
| Solinftec | IoT/automacao | Preco altissimo | Democratizar tecnologia |

**Posicionamento:** Full-stack agro com IA + Mapas + Clima + Governo em uma plataforma unica e acessivel.

---

## 7. LIBS GRATUITAS ESTRATEGICAS

### Mapas e Geoespacial

| Lib | Uso | Status |
|-----|-----|--------|
| Leaflet | Mapas interativos | JA USA |
| react-leaflet | Wrapper React | JA USA |
| leaflet-draw | Ferramentas de desenho | JA USA |
| Turf.js | Analise geoespacial (area, buffer, interseccao) | ADICIONAR |
| PostGIS | Extensao PostgreSQL para geo | ADICIONAR (Supabase suporta) |
| Proj4js | Projecoes cartograficas | ADICIONAR |
| Leaflet.heat | Mapas de calor | ADICIONAR |

### Clima

| API/Lib | Uso | Custo |
|---------|-----|-------|
| Open-Meteo API | Previsao + historico global | 100% GRATUITO, sem limites |
| OpenWeatherMap | Clima atual + previsao | Free ate 1000 calls/dia |
| INMET API | Dados oficiais brasileiros | PUBLICO |
| Visual Crossing | Historico climatico | Free tier generoso |

### Satelite e NDVI

| Servico | Uso | Custo |
|---------|-----|-------|
| Sentinel Hub | Imagens Sentinel-2 (ESA) | GRATUITO |
| Google Earth Engine | Analise planetaria | GRATUITO para pesquisa |
| STAC API | Catalogo de dados geoespaciais | GRATUITO |
| Copernicus Open Access | Dados satelite europeus | GRATUITO |

### IA e Machine Learning

| Lib | Uso | Custo |
|-----|-----|-------|
| TensorFlow | Deep learning | JA USA / GRATUITO |
| YOLOv8 (Ultralytics) | Deteccao de objetos SOTA | GRATUITO |
| scikit-learn | ML classico (previsoes) | GRATUITO |
| Hugging Face | Modelos pre-treinados | GRATUITO |
| LangChain | Framework para chatbot IA | GRATUITO |
| OpenCV | Processamento de imagem | GRATUITO |

### Visualizacao

| Lib | Uso | Status |
|-----|-----|--------|
| Recharts | Graficos React | JA USA |
| Plotly.js | Graficos avancados/3D | JA USA |
| D3.js | Visualizacoes customizadas | ADICIONAR |
| Chart.js | Graficos leves | ALTERNATIVA |

### IoT e Sensores

| Lib | Uso | Custo |
|-----|-----|-------|
| MQTT.js | Protocolo IoT | GRATUITO |
| Mosquitto | Broker MQTT | GRATUITO |
| Node-RED | Fluxos IoT visuais | GRATUITO |

---

## 8. COMO O PRODUTO FICA NO FINAL

### Arquitetura Completa

```
┌──────────────────────────────────────────────────────────────────┐
│                        AGROIA PLATFORM                           │
├────────────────┬────────────────┬────────────────┬───────────────┤
│     MAPAS      │     CLIMA      │       IA       │    GESTAO     │
│                │                │                │               │
│ - Talhoes      │ - Previsao     │ - Pragas       │ - Safras      │
│ - NDVI         │ - Historico    │ - Previsao     │ - Insumos     │
│ - Satelite     │ - Alertas      │ - ChatBot      │ - Financeiro  │
│ - Calor        │ - ET0          │ - Drones       │ - Relatorios  │
│ - CAR/INCRA    │ - Sensores     │ - Solo         │ - Compliance  │
├────────────────┴────────────────┴────────────────┴───────────────┤
│                        INTEGRACOES                                │
│   Gov (MAPA/INMET/EMBRAPA) | IoT | Marketplace | API Publica    │
├──────────────────────────────────────────────────────────────────┤
│                       INFRAESTRUTURA                              │
│   Supabase | Django | Next.js | Celery | Redis | Docker          │
└──────────────────────────────────────────────────────────────────┘
```

### Jornada do Usuario

```
PEQUENO PRODUTOR (FREE)
  └─> Cadastra fazenda
      └─> Desenha talhoes no mapa
          └─> Ve previsao do clima
              └─> Registra pragas com foto
                  └─> Acompanha produtividade
                      └─> Converte para STARTER

MEDIO PRODUTOR (PRO)
  └─> Tudo do FREE +
      └─> NDVI por satelite
          └─> Previsao de safra com IA
              └─> IoT (sensores no campo)
                  └─> Relatorios avancados
                      └─> API para integracoes

GRANDE PRODUTOR / GOV (ENTERPRISE)
  └─> Tudo do PRO +
      └─> White-label
          └─> Integracao gov (CAR/MAPA)
              └─> Blockchain rastreabilidade
                  └─> ERP integrado
                      └─> Suporte dedicado
```

---

## 9. PROXIMOS PASSOS IMEDIATOS

### Roadmap de Execucao

```
SEMANA 1:  Limpar codigo (remover .env, duplicatas, debug logs)
SEMANA 2:  Implementar Talhoes com geometria no mapa
SEMANA 3:  Integrar Open-Meteo API (clima real gratuito)
SEMANA 4:  NDVI basico via Sentinel-2 (diferencial matador)
MES 2:     Safras + Relatorios PDF + PWA
MES 3:     IA de pragas com YOLOv8 + Alertas automaticos
MES 4-6:   NDVI timeline + Previsao ML + ET0
MES 7-12:  IoT + Marketplace + API publica + Gov
MES 12-24: Enterprise + Blockchain + ChatBot IA + Drones
```

### Checklist de Lancamento MVP

- [ ] Limpar credenciais do repositorio
- [ ] Corrigir modelo Fazenda duplicado
- [ ] Implementar Talhoes (backend + frontend)
- [ ] Integrar clima real (Open-Meteo)
- [ ] NDVI basico funcionando
- [ ] Safras implementadas
- [ ] Testes minimos nos endpoints criticos
- [ ] Deploy em producao (Vercel + Railway/Render)
- [ ] Landing page com cadastro
- [ ] Documentacao da API atualizada

---

## 10. METRICAS DE SUCESSO

| Metrica | Mes 3 | Mes 6 | Mes 12 |
|---------|-------|-------|--------|
| Usuarios cadastrados | 100 | 500 | 2.000 |
| Usuarios ativos (MAU) | 50 | 250 | 1.000 |
| Usuarios pagantes | 5 | 50 | 300 |
| MRR (Receita Mensal) | R$ 500 | R$ 5.000 | R$ 30.000 |
| Fazendas cadastradas | 80 | 400 | 2.500 |
| Hectares monitorados | 5.000 | 50.000 | 500.000 |
| NPS (satisfacao) | 40+ | 50+ | 60+ |

---

> **Visao:** Tornar a AgroIA a plataforma de inteligencia agricola mais completa e acessivel do Brasil, democratizando tecnologia de ponta para produtores de todos os tamanhos.

> **Missao:** Usar tecnologia, IA e dados para aumentar a produtividade agricola brasileira, reduzir perdas e promover sustentabilidade.
