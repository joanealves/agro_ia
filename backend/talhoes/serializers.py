from rest_framework import serializers
from .models import Talhao


class TalhaoSerializer(serializers.ModelSerializer):
    """Serializador para Talhão"""
    fazenda_nome = serializers.CharField(source='fazenda.nome', read_only=True)
    cultura_display = serializers.CharField(source='get_cultura_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Talhao
        fields = [
            'id',
            'fazenda',
            'fazenda_nome',
            'nome',
            'descricao',
            'cultura',
            'cultura_display',
            'area_hectares',
            'geometria',
            'status',
            'status_display',
            'data_criacao',
            'data_atualizacao',
            'data_plantio',
            'data_colheita',
            'rendimento_esperado',
            'rendimento_real',
        ]
        read_only_fields = ['id', 'data_criacao', 'data_atualizacao', 'fazenda_nome']


class TalhaoCreateSerializer(serializers.ModelSerializer):
    """Serializador para criar/editar Talhão"""
    
    class Meta:
        model = Talhao
        fields = [
            'fazenda',
            'nome',
            'descricao',
            'cultura',
            'area_hectares',
            'geometria',
            'status',
            'data_plantio',
            'data_colheita',
            'rendimento_esperado',
            'rendimento_real',
        ]


class TalhaoDetailSerializer(TalhaoSerializer):
    """Serializador detalhado com informações completas"""
    
    class Meta(TalhaoSerializer.Meta):
        fields = TalhaoSerializer.Meta.fields
