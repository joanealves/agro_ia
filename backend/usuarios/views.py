from rest_framework import viewsets
from .models import Fazenda
from .serializers import FazendaSerializer
from rest_framework.permissions import IsAuthenticated

class FazendaViewSet(viewsets.ModelViewSet):
    queryset = Fazenda.objects.all()
    serializer_class = FazendaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(usuario=self.request.user)
