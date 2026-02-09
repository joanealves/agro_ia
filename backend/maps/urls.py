from django.urls import path
from .views import MapaViewSet

urlpatterns = [
    path(
        'fazenda/<int:fazenda_id>/mapas/',
        MapaViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='mapas-list-create',
    ),
    path(
        'fazenda/<int:fazenda_id>/mapas/<int:pk>/',
        MapaViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy',
        }),
        name='mapas-detail',
    ),
]
