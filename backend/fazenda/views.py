from rest_framework import viewsets, permissions, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Fazenda
from .serializers import FazendaSerializer

class FazendaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para CRUD de Fazendas.
    Cada usuário só vê suas próprias fazendas.
    """
    serializer_class = FazendaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['nome', 'localizacao']
    search_fields = ['nome', 'localizacao']

    def get_queryset(self):
        # ✅ MULTI-TENANCY: Usuário só vê suas próprias fazendas
        return Fazenda.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        # ✅ Salva com o usuário logado automaticamente
        serializer.save(usuario=self.request.user)

