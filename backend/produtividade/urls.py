from django.urls import path
from .views import DadosProdutividadeView, ListDadosProdutividadeView, ProdutividadeSerieTemporalView

urlpatterns = [
    path('dados/', DadosProdutividadeView.as_view(), name='dados-produtividade'),
    path('list/', ListDadosProdutividadeView.as_view(), name='list-dados-produtividade'),
    path('serie-temporal/', ProdutividadeSerieTemporalView.as_view(), name='serie-temporal'),
]