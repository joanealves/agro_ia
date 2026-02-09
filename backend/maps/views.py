from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Mapa
from .serializers import MapaSerializer


class MapaViewSet(viewsets.ModelViewSet):
    serializer_class = MapaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # ✅ MULTI-TENANCY: Filtra por fazenda E por usuário
        user = self.request.user
        fazenda_id = self.kwargs.get('fazenda_id')
        
        if fazenda_id:
            # Garante que a fazenda pertence ao usuário
            from backend.fazenda.models import Fazenda
            if not Fazenda.objects.filter(id=fazenda_id, usuario=user).exists():
                return Mapa.objects.none()
            return Mapa.objects.filter(fazenda_id=fazenda_id)
        
        # Se não especificou fazenda, retorna apenas mapas do usuário
        return Mapa.objects.filter(fazenda__usuario=user)

    def create(self, request, *args, **kwargs):
        fazenda_id = self.kwargs.get('fazenda_id')
        data = request.data.copy()
        if 'fazenda' not in data:
            data['fazenda'] = fazenda_id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

