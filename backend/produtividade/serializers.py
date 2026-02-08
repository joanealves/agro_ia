from rest_framework import serializers
from .models import DadosProdutividade
from backend.talhoes.models import Talhao
from backend.fazenda.models import Fazenda


class DadosProdutividadeSerializer(serializers.ModelSerializer):
    # Nested serializers para detalhes
    talhao_nome = serializers.CharField(source='talhao.nome', read_only=True)
    talhao_cultura = serializers.CharField(source='talhao.cultura', read_only=True)
    fazenda_nome = serializers.CharField(source='fazenda.nome', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)

    # Campos calculados
    dias_cultivo = serializers.SerializerMethodField(read_only=True)
    lucro_por_hectare = serializers.SerializerMethodField(read_only=True)
    margem_lucro = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DadosProdutividade
        fields = [
            'id',
            'usuario',
            'usuario_nome',
            'fazenda',
            'fazenda_nome',
            'talhao',
            'talhao_nome',
            'talhao_cultura',
            'cultura',
            'area_hectares',
            'status',
            'data_plantio',
            'data_colheita',
            'dias_cultivo',
            'data_registro',
            'data_atualizacao',
            'peso_colhido_kg',
            'rendimento_kg_ha',
            'preco_kg',
            'receita_total',
            'custo_total',
            'lucro_total',
            'lucro_por_hectare',
            'margem_lucro',
            'observacoes',
        ]
        read_only_fields = [
            'usuario',
            'data_registro',
            'data_atualizacao',
            'rendimento_kg_ha',
            'receita_total',
            'lucro_total',
            'dias_cultivo',
            'lucro_por_hectare',
            'margem_lucro',
        ]

    def get_dias_cultivo(self, obj):
        """Calcula dias entre plantio e colheita"""
        if obj.data_plantio and obj.data_colheita:
            return (obj.data_colheita - obj.data_plantio).days
        return None

    def get_lucro_por_hectare(self, obj):
        """Calcula lucro por hectare"""
        if obj.lucro_total and obj.area_hectares and obj.area_hectares > 0:
            return round(obj.lucro_total / obj.area_hectares, 2)
        return None

    def get_margem_lucro(self, obj):
        """Calcula margem de lucro (%)"""
        if obj.receita_total and obj.receita_total > 0:
            return round((obj.lucro_total / obj.receita_total) * 100, 2)
        return None

    def validate_area_hectares(self, value):
        """Valida que área é positiva"""
        if value <= 0:
            raise serializers.ValidationError("Área deve ser maior que 0")
        return value

    def validate(self, data):
        """Validações cruzadas"""
        # Se colheita foi registrada, deve ter peso
        if data.get('status') == 'colhido' and not data.get('peso_colhido_kg'):
            raise serializers.ValidationError(
                {'peso_colhido_kg': 'Peso colhido é obrigatório para colheitas realizadas'}
            )

        # Colheita deve ser após plantio
        if data.get('data_plantio') and data.get('data_colheita'):
            if data['data_colheita'] <= data['data_plantio']:
                raise serializers.ValidationError(
                    {'data_colheita': 'Data de colheita deve ser após plantio'}
                )

        return data