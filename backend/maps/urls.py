from django.urls import path

from .views import MapaListCreateView, MapaRetrieveUpdateDestroyView

urlpatterns = [
    path('fazenda/<int:fazenda_id>/mapas/', MapaListCreateView.as_view(), name='mapas-list-create'),
    path('fazenda/<int:fazenda_id>/mapas/<int:mapa_id>/', MapaRetrieveUpdateDestroyView.as_view(), name='mapas-detail'),
]