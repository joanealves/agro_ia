from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DadosProdutividadeViewSet

router = DefaultRouter()
router.register(r'', DadosProdutividadeViewSet, basename='dados-produtividade')

urlpatterns = [
    path('', include(router.urls)),
]