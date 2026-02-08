from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Talhao
from .serializers import TalhaoSerializer, TalhaoCreateSerializer, TalhaoDetailSerializer
from backend.fazenda.models import Fazenda


class TalhaoViewSet(viewsets.ModelViewSet):
    """
    CRUD de Talhões
    
    Endpoints:
    - GET    /api/talhoes/ - Lista talhões do usuário
    - POST   /api/talhoes/ - Criar novo talhão
    - GET    /api/talhoes/{id}/ - Detalhe do talhão
    - PATCH  /api/talhoes/{id}/ - Editar talhão
    - DELETE /api/talhoes/{id}/ - Deletar talhão
    - POST   /api/talhoes/{id}/atualizar_rendimento/ - Atualizar rendimento real
    """
    serializer_class = TalhaoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['fazenda', 'cultura', 'status']
    
    def get_queryset(self):
        """
        ✅ MULTI-TENANCY: Usuário só vê talhões das suas fazendas
        """
        user = self.request.user
        fazendas = Fazenda.objects.filter(usuario=user)
        return Talhao.objects.filter(fazenda__in=fazendas).select_related('fazenda')
    
    def get_serializer_class(self):
        """
        Usa serializadores diferentes para cada ação
        """
        if self.action == 'create' or self.action == 'update' or self.action == 'partial_update':
            return TalhaoCreateSerializer
        elif self.action == 'retrieve':
            return TalhaoDetailSerializer
        return TalhaoSerializer
    
    def perform_create(self, serializer):
        """
        ✅ Valida que a fazenda pertence ao usuário antes de criar
        """
        fazenda_id = self.request.data.get('fazenda')
        try:
            fazenda = Fazenda.objects.get(id=fazenda_id, usuario=self.request.user)
            serializer.save(fazenda=fazenda)
        except Fazenda.DoesNotExist:
            raise serializers.ValidationError(
                {"fazenda": "Fazenda não encontrada ou não pertence a você"}
            )
    
    def perform_update(self, serializer):
        """
        ✅ Valida que a fazenda pertence ao usuário antes de atualizar
        """
        fazenda_id = self.request.data.get('fazenda')
        if fazenda_id:
            try:
                fazenda = Fazenda.objects.get(id=fazenda_id, usuario=self.request.user)
            except Fazenda.DoesNotExist:
                raise serializers.ValidationError(
                    {"fazenda": "Fazenda não encontrada ou não pertence a você"}
                )
        serializer.save()
    
    @action(detail=True, methods=['patch'])
    def atualizar_rendimento(self, request, pk=None):
        """
        PATCH /api/talhoes/{id}/atualizar_rendimento/
        
        Atualiza rendimento real e data de colheita
        
        Body:
        {
            "rendimento_real": 50.5,
            "data_colheita": "2026-02-15"
        }
        """
        talhao = self.get_object()
        
        rendimento_real = request.data.get('rendimento_real')
        data_colheita = request.data.get('data_colheita')
        
        if rendimento_real is not None:
            talhao.rendimento_real = rendimento_real
        
        if data_colheita is not None:
            talhao.data_colheita = data_colheita
        
        talhao.save()
        
        serializer = self.get_serializer(talhao)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def resumo(self, request):
        """
        GET /api/talhoes/resumo/
        
        Retorna resumo de talhões por status e cultura
        """
        queryset = self.get_queryset()
        
        resumo = {
            "total_talhoes": queryset.count(),
            "area_total_hectares": sum(t.area_hectares for t in queryset),
            "por_status": {},
            "por_cultura": {},
            "talhoes_com_rendimento_real": queryset.filter(rendimento_real__isnull=False).count(),
        }
        
        # Por status
        for status_choice in Talhao.STATUS_CHOICES:
            status_key = status_choice[0]
            count = queryset.filter(status=status_key).count()
            resumo["por_status"][status_key] = count
        
        # Por cultura
        for cultura_choice in Talhao.CULTURAS:
            cultura_key = cultura_choice[0]
            count = queryset.filter(cultura=cultura_key).count()
            if count > 0:
                resumo["por_cultura"][cultura_key] = count
        
        return Response(resumo, status=status.HTTP_200_OK)


from rest_framework import serializers  # Precisa desse import
