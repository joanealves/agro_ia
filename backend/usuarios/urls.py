from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'usuarios', UserViewSet, basename='usuario')

# ⚠️ NOTA: Rotas de Fazenda foram consolidadas em backend.fazenda.urls
# Importe de lá

urlpatterns = [
    path('', include(router.urls)),
]