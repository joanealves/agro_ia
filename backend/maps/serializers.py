from rest_framework import serializers
from .models import Mapa

class MapaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mapa
        fields = ['id', 'nome', 'latitude', 'longitude', 'zoom', 'camadas', 'data_criacao', 'data_atualizacao']