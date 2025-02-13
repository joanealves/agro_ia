from django.contrib import admin
from django.urls import path, include
from rest_framework.permissions import AllowAny
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
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

# Cria um router para as viewsets
router = DefaultRouter()

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API Endpoints
    path('api/auth/', include([
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    ])),
    
    path('api/usuarios/', include('backend.usuarios.urls')),
    path('api/pragas/', include('backend.pragas.urls')),
    path('api/irrigacao/', include('backend.irrigacao.urls')),
    path('api/dashboard/', include('backend.dashboard.urls')),
    path('api/produtividade/', include('backend.produtividade.urls')),
    path('api/notificacoes/', include('backend.notificacoes.urls')), 
    path('', include(router.urls)),  
]