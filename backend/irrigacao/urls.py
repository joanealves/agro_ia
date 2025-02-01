from django.urls import path
from .views import ConsultaClimaView

urlpatterns = [
    path('clima/', ConsultaClimaView.as_view(), name='consulta-clima'),
]