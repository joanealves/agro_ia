"""
Views para dados climáticos.
Integra Open-Meteo API (gratuito, sem API key)
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Sum
from django.utils import timezone
from datetime import timedelta
import logging

from .models import DadosClimaticos, Irrigacao
from .serializers import DadosClimaticosSerializer, IrrigacaoSerializer
from .services import OpenMeteoService
from backend.fazenda.models import Fazenda

logger = logging.getLogger(__name__)


class ClimaViewSet(viewsets.ViewSet):
    """
    API de clima real via Open-Meteo.
    Sem autenticação necessária na API (gratuita)
    
    Endpoints:
    - GET /api/clima/atual/{fazenda_id}/ - Clima atual e previsão 7 dias
    - GET /api/clima/historico/?fazenda=1 - Histórico salvo no banco
    - GET /api/clima/resumo/?fazenda=1 - Estatísticas
    """
    permission_classes = [IsAuthenticated]
    
    def _get_user_fazenda_or_error(self, fazenda_id):
        """Valida que a fazenda pertence ao usuário"""
        try:
            fazenda = Fazenda.objects.get(
                id=fazenda_id,
                usuario=self.request.user
            )
            return fazenda, None
        except Fazenda.DoesNotExist:
            return None, Response(
                {'detail': 'Fazenda não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='atual/(?P<fazenda_id>[^/.]+)')
    def atual(self, request, fazenda_id=None):
        """
        Retorna clima atual + previsão 7 dias via Open-Meteo.
        GET /api/clima/atual/{fazenda_id}/
        """
        fazenda, error = self._get_user_fazenda_or_error(fazenda_id)
        if error:
            return error
        
        # Buscar dados reais da Open-Meteo
        dados = OpenMeteoService.fetch_and_parse(
            latitude=float(fazenda.latitude),
            longitude=float(fazenda.longitude)
        )
        
        if not dados:
            return Response(
                {'detail': 'Erro ao buscar dados climáticos'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        return Response({
            'fazenda_id': fazenda_id,
            'fazenda_nome': fazenda.nome,
            **dados
        })
    
    @action(detail=False, methods=['get'])
    def historico(self, request):
        """
        Retorna histórico de dados climáticos do banco (últimos 30 dias).
        GET /api/clima/historico/?fazenda=1&dias=30
        """
        fazenda_id = request.query_params.get('fazenda')
        dias = int(request.query_params.get('dias', 30))
        
        if not fazenda_id:
            return Response(
                {'detail': 'Parâmetro fazenda obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        fazenda, error = self._get_user_fazenda_or_error(fazenda_id)
        if error:
            return error
        
        data_inicio = timezone.now() - timedelta(days=dias)
        
        dados = DadosClimaticos.objects.filter(
            fazenda_id=fazenda_id,
            data_coleta__gte=data_inicio,
            e_previsao=False
        ).order_by('-data_coleta')
        
        serializer = DadosClimaticosSerializer(dados, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def resumo(self, request):
        """
        Retorna resumo estatístico dos últimos N dias.
        GET /api/clima/resumo/?fazenda=1&dias=7
        """
        fazenda_id = request.query_params.get('fazenda')
        dias = int(request.query_params.get('dias', 7))
        
        if not fazenda_id:
            return Response(
                {'detail': 'Parâmetro fazenda obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        fazenda, error = self._get_user_fazenda_or_error(fazenda_id)
        if error:
            return error
        
        data_inicio = timezone.now() - timedelta(days=dias)
        
        resumo = DadosClimaticos.objects.filter(
            fazenda_id=fazenda_id,
            data_coleta__gte=data_inicio,
            e_previsao=False
        ).aggregate(
            temp_media=Avg('temperatura'),
            umidade_media=Avg('umidade'),
            chuva_total=Sum('precipitacao'),
        )
        
        resumo = {k: (v or 0) for k, v in resumo.items()}
        
        return Response({
            'fazenda_id': fazenda_id,
            'periodo_dias': dias,
            **resumo
        })


class IrrigacaoViewSet(viewsets.ModelViewSet):
    """CRUD de sistemas de irrigação"""
    serializer_class = IrrigacaoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtra apenas irrigações das fazendas do usuário"""
        fazendas = Fazenda.objects.filter(usuario=self.request.user)
        return Irrigacao.objects.filter(fazenda__in=fazendas)
    
    def perform_create(self, serializer):
        """Garante que irrigação pertence a fazenda do usuário"""
        fazenda_id = self.request.data.get('fazenda')
        fazenda = Fazenda.objects.get(
            id=fazenda_id,
            usuario=self.request.user
        )
        serializer.save(fazenda=fazenda)
    
    @action(detail=True, methods=['patch'])
    def atualizar_status(self, request, pk=None):
        """PATCH /api/irrigacao/{id}/atualizar_status/"""
        irrigacao = self.get_object()
        novo_status = request.data.get('status')
        
        if novo_status not in ['ativo', 'inativo']:
            return Response(
                {'detail': 'Status inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        irrigacao.status = novo_status
        irrigacao.save()
        
        return Response({'status': 'Atualizado'})








