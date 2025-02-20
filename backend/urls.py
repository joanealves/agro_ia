from django.contrib import admin
from django.urls import path, include
from rest_framework.permissions import AllowAny
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.routers import DefaultRouter

# Configuração do Swagger/OpenAPI
schema_view = get_schema_view(
    openapi.Info(
        title="Agro API",
        default_version='v1',
        description="API para gestão agrícola",
    ),
    public=True,
    permission_classes=[AllowAny],
)

router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API Endpoints
    path('api/usuarios/', include('backend.usuarios.urls')),
    path('api/pragas/', include('backend.pragas.urls')),
    path('api/irrigacao/', include('backend.irrigacao.urls')),
    path('api/dashboard/', include('backend.dashboard.urls')),
    path('api/produtividade/', include('backend.produtividade.urls')),
    path('api/notificacoes/', include('backend.notificacoes.urls')), 
    path('api/maps/', include('backend.maps.urls')),
    path('api/fazenda/', include('backend.fazenda.urls')),
    path('api/auth/', include('backend.auth.urls')),  
    path('', include(router.urls)),  
]