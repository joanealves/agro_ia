from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Mapa
from .serializers import MapaSerializer
from backend.fazenda.models import Fazenda

class MapaView(APIView):
    def get(self, request, fazenda_id):
        try:
            fazenda = Fazenda.objects.get(id=fazenda_id, usuario=request.user)
            mapas = Mapa.objects.filter(fazenda=fazenda)
            serializer = MapaSerializer(mapas, many=True)
            return Response(serializer.data)
        except Fazenda.DoesNotExist:
            return Response({"error": "Fazenda não encontrada"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, fazenda_id):
        try:
            fazenda = Fazenda.objects.get(id=fazenda_id, usuario=request.user)
            serializer = MapaSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(fazenda=fazenda)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Fazenda.DoesNotExist:
            return Response({"error": "Fazenda não encontrada"}, status=status.HTTP_404_NOT_FOUND)