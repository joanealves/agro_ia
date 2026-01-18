from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Mapa
from .serializers import MapaSerializer
from backend.fazenda.models import Fazenda

from rest_framework import generics, permissions

class MapaListCreateView(generics.ListCreateAPIView):
    serializer_class = MapaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        fazenda_id = self.kwargs['fazenda_id']
        return Mapa.objects.filter(fazenda__id=fazenda_id, fazenda__usuario=self.request.user)

    def perform_create(self, serializer):
        fazenda_id = self.kwargs['fazenda_id']
        fazenda = Fazenda.objects.get(id=fazenda_id, usuario=self.request.user)
        serializer.save(fazenda=fazenda)

class MapaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MapaSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'mapa_id'

    def get_queryset(self):
        fazenda_id = self.kwargs['fazenda_id']
        return Mapa.objects.filter(fazenda__id=fazenda_id, fazenda__usuario=self.request.user)