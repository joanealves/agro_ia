from django.contrib import admin
from django.urls import path, include
from rest_framework.permissions import AllowAny
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.routers import DefaultRouter

# Configuração do Swagger/OpenAPI
schema_view = get_schema_view(
    openapi.Info(
        title="AgroIA API",
        default_version='v1',
        description="API para gestão agrícola - Sistema AgroIA",
        contact=openapi.Contact(email="contato@agroia.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[AllowAny],
)

router = DefaultRouter()

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API Documentation (Swagger/OpenAPI)
    path('api/swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # =============================================================================
    # API ENDPOINTS - CORRIGIDOS PARA ALINHAR COM FRONTEND
    # =============================================================================
    
    # Autenticação e Usuários
    path('api/auth/', include('backend.custom_auth.urls')),
    path('api/usuarios/', include('backend.usuarios.urls')),
    
    # Fazendas (CORRIGIDO: frontend chama /api/fazendas/)
    path('api/fazendas/', include('backend.fazenda.urls')),
    path('api/fazenda/', include('backend.fazenda.urls')),  # Compatibilidade
    
    # Talhões (novo módulo CORE) ✅ CRIADO
    path('api/talhoes/', include('backend.talhoes.urls')),
    
    # Pragas
    path('api/pragas/', include('backend.pragas.urls')),
    
    # Clima e Irrigação
    path('api/clima/', include('backend.irrigacao.urls')),  # CORRIGIDO: frontend chama /api/clima/
    path('api/irrigacao/', include('backend.irrigacao.urls')),  # Compatibilidade
    
    # Produtividade
    path('api/produtividade/', include('backend.produtividade.urls')),
    
    # Notificações
    path('api/notificacoes/', include('backend.notificacoes.urls')),
    
    # Mapas (CORRIGIDO: frontend chama /api/mapas/)
    path('api/mapas/', include('backend.maps.urls')),
    
    # Dashboard
    path('api/dashboard/', include('backend.dashboard.urls')),
    
    # Router padrão DRF
    path('', include(router.urls)),
]

# =============================================================================
# NOTAS DE MIGRAÇÃO
# =============================================================================
# 
# 1. ROTAS CORRIGIDAS:
#    - /api/fazenda/ → /api/fazendas/ (mantendo /api/fazenda/ para compatibilidade)
#    - /api/irrigacao/ → /api/clima/ (mantendo /api/irrigacao/ para compatibilidade)
#    - /api/maps/ → /api/mapas/ (mantendo /api/maps/ para compatibilidade)
#
# 2. PRÓXIMAS AÇÕES:
#    - Criar módulo backend.talhoes (CRÍTICO - entidade core)
#    - Implementar RLS no Supabase
#    - Migrar ViewSets para usar tabelas Supabase unificadas
#
# 3. ROTAS LEGADAS (manter por 30 dias):
#    - /api/fazenda/ → migrar para /api/fazendas/
#    - /api/maps/ → migrar para /api/mapas/
#