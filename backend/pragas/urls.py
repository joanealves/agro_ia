from django.urls import path
from .views import UploadPragaView, ListPragasView, PragaViewSet

urlpatterns = [
    # CRUD via ViewSet
    path('', PragaViewSet.as_view({'get': 'list', 'post': 'create'}), name='pragas-list-create'),
    path('<int:pk>/', PragaViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='pragas-detail'),
    path('<int:pk>/atualizar_status/', PragaViewSet.as_view({
        'patch': 'atualizar_status',
    }), name='pragas-atualizar-status'),

    # Upload com IA
    path('upload/', UploadPragaView.as_view(), name='upload-praga'),

    # Lista paginada (legacy)
    path('list/', ListPragasView.as_view(), name='list-pragas'),
]
