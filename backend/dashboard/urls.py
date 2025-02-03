from django.urls import path
from .views import DashboardView
from .views import ProdutividadeSerieTemporalView

urlpatterns = [
    path('', DashboardView.as_view(), name='dashboard'),
    path('produtividade/<int:fazenda_id>/serie-temporal/', ProdutividadeSerieTemporalView.as_view(), name='serie-temporal'),
]