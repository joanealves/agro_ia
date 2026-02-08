from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Notificacao
from .serializers import NotificacaoSerializer, NotificacaoListSerializer


class NotificacaoViewSet(viewsets.ModelViewSet):
    """
    API para notificações.
    
    Endpoints:
    - GET  /api/notificacoes/           - Lista notificações do usuário
    - GET  /api/notificacoes/recentes/  - Últimas 10 notificações
    - GET  /api/notificacoes/nao-lidas/ - Notificações não lidas
    - POST /api/notificacoes/{id}/ler/  - Marca como lida
    - POST /api/notificacoes/ler-todas/ - Marca todas como lidas
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'recentes':
            return NotificacaoListSerializer
        return NotificacaoSerializer
    
    def get_queryset(self):
        """Retorna notificações do usuário logado"""
        return Notificacao.objects.filter(
            usuario=self.request.user
        ).order_by('-data_criacao')
    
    @action(detail=False, methods=['get'])
    def recentes(self, request):
        """
        Retorna as últimas 10 notificações.
        GET /api/notificacoes/recentes/
        """
        queryset = self.get_queryset()[:10]
        serializer = NotificacaoListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='nao-lidas')
    def nao_lidas(self, request):
        """
        Retorna notificações não lidas.
        GET /api/notificacoes/nao-lidas/
        """
        queryset = self.get_queryset().filter(lida=False)
        serializer = NotificacaoListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def contagem(self, request):
        """
        Retorna contagem de notificações não lidas.
        GET /api/notificacoes/contagem/
        """
        count = self.get_queryset().filter(lida=False).count()
        return Response({'count': count})
    
    @action(detail=True, methods=['post'])
    def ler(self, request, pk=None):
        """
        Marca uma notificação como lida.
        POST /api/notificacoes/{id}/ler/
        """
        try:
            notificacao = self.get_object()
            notificacao.lida = True
            notificacao.data_leitura = timezone.now()
            notificacao.save()
            return Response({'status': 'Notificação marcada como lida'})
        except Notificacao.DoesNotExist:
            return Response(
                {'detail': 'Notificação não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], url_path='ler-todas')
    def ler_todas(self, request):
        """
        Marca todas as notificações como lidas.
        POST /api/notificacoes/ler-todas/
        """
        updated = self.get_queryset().filter(lida=False).update(
            lida=True,
            data_leitura=timezone.now()
        )
        return Response({
            'status': 'Todas notificações marcadas como lidas',
            'total': updated
        })
    
    @action(detail=True, methods=['post'])
    def arquivar(self, request, pk=None):
        """
        Arquiva uma notificação.
        POST /api/notificacoes/{id}/arquivar/
        """
        try:
            notificacao = self.get_object()
            notificacao.arquivada = True
            notificacao.save()
            return Response({'status': 'Notificação arquivada'})
        except Notificacao.DoesNotExist:
            return Response(
                {'detail': 'Notificação não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def deletar(self, request, pk=None):
        """
        Deleta uma notificação.
        POST /api/notificacoes/{id}/deletar/
        """
        try:
            notificacao = self.get_object()
            notificacao.delete()
            return Response({'status': 'Notificação deletada'})
        except Notificacao.DoesNotExist:
            return Response(
                {'detail': 'Notificação não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], url_path='deletar-lidas')
    def deletar_lidas(self, request):
        """
        Deleta todas as notificações lidas.
        POST /api/notificacoes/deletar-lidas/
        """
        deleted_count, _ = self.get_queryset().filter(lida=True).delete()
        return Response({
            'status': 'Notificações lidas deletadas',
            'total': deleted_count
        })