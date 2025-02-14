from django.urls import path
from .views import MapaView

urlpatterns = [
    path('fazenda/<int:fazenda_id>/mapas/', MapaView.as_view(), name='mapas'),
]