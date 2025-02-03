from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from .models import Fazenda
from .serializers import FazendaSerializer
from rest_framework.permissions import IsAuthenticated


class FazendaViewSet(viewsets.ModelViewSet):
    queryset = Fazenda.objects.all()
    serializer_class = FazendaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nome', 'localizacao']

    def get_queryset(self):
        return self.queryset.filter(usuario=self.request.user)
