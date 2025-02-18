from rest_framework import viewsets
from .models import Fazenda
from .serializers import FazendaSerializer

class FazendaViewSet(viewsets.ModelViewSet):
    queryset = Fazenda.objects.all()
    serializer_class = FazendaSerializer
