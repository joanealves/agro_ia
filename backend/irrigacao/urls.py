from django.urls import path
from django.http import JsonResponse
from .views import ConsultaClimaView, SugestaoIrrigacaoView  # Remover DadosClimaticosListView

def irrigacao_home(request):
    return JsonResponse({"message": "Bem-vindo ao sistema de irrigação!"})

urlpatterns = [
    path('', irrigacao_home, name='irrigacao-home'),
    path('clima/', ConsultaClimaView.as_view(), name='consulta-clima'),
    path('sugestao-irrigacao/<int:fazenda_id>/', SugestaoIrrigacaoView.as_view(), name='sugestao-irrigacao'),
]