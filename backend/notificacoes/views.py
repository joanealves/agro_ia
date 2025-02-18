from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Notificacao
from .serializers import NotificacaoSerializer

class NotificacaoViewSet(viewsets.ModelViewSet):
    queryset = Notificacao.objects.all()
    serializer_class = NotificacaoSerializer

    @action(detail=True, methods=['post'])
    def ler(self, request, pk=None):
        notificacao = self.get_object()
        notificacao.lida = True
        notificacao.save()
        return Response({"status": "Notificação marcada como lida"})
