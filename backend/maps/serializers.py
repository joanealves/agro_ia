from rest_framework import serializers
from .models import Mapa


class MapaSerializer(serializers.ModelSerializer):
    fazenda_nome = serializers.CharField(source='fazenda.nome', read_only=True)

    class Meta:
        model = Mapa
        fields = [
            'id', 'fazenda', 'fazenda_nome', 'nome', 'descricao',
            'latitude', 'longitude', 'zoom', 'camadas',
            'publico', 'tipo_mapa', 'filtros',
            'data_criacao', 'data_atualizacao',
        ]
        read_only_fields = ['id', 'data_criacao', 'data_atualizacao']

    def validate_latitude(self, value):
        if not -90 <= value <= 90:
            raise serializers.ValidationError(f"Latitude {value} invalida")
        return value

    def validate_longitude(self, value):
        if not -180 <= value <= 180:
            raise serializers.ValidationError(f"Longitude {value} invalida")
        return value

    def validate_zoom(self, value):
        if not 1 <= value <= 20:
            raise serializers.ValidationError(f"Zoom {value} invalido")
        return value
