from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from .views import DadosClimaticosViewSet

def irrigacao_home(request):
    return JsonResponse({"message": "Bem-vindo ao sistema de irrigação!"})

router = DefaultRouter()

router.register(r'clima', DadosClimaticosViewSet, basename='clima')

urlpatterns = [
    path('', irrigacao_home, name='irrigacao-home'),
    path('', include(router.urls)),
]