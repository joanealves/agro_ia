from rest_framework import viewsets
from .models import Notificacao
from .serializers import NotificacaoSerializer

class NotificacaoViewSet(viewsets.ModelViewSet):
    queryset = Notificacao.objects.all()
    serializer_class = NotificacaoSerializer

    def get_queryset(self):
        # Retorna apenas as notificações do usuário logado
        return Notificacao.objects.filter(usuario=self.request.user)