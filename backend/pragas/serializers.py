from rest_framework import serializers
from .models import Praga
from backend.fazenda.models import Fazenda
from django.core.files.images import get_image_dimensions


class PragaSerializer(serializers.ModelSerializer):
    fazenda_nome = serializers.CharField(source='fazenda.nome', read_only=True)
    data_registro = serializers.DateTimeField(source='data_criacao', read_only=True)

    class Meta:
        model = Praga
        fields = [
            'id', 'fazenda', 'fazenda_nome', 'usuario', 'nome',
            'descricao', 'nivel', 'imagem', 'data_registro', 'status'
        ]
        read_only_fields = ['id', 'usuario', 'imagem', 'data_registro', 'status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            self.fields['fazenda'].queryset = Fazenda.objects.filter(
                usuario=request.user
            )

    def validate_imagem(self, value):
        if value is None:
            return value
        try:
            width, height = get_image_dimensions(value)
            if not width or not height:
                raise serializers.ValidationError("O arquivo enviado não é uma imagem válida.")
        except Exception:
            raise serializers.ValidationError("Erro ao validar a imagem.")
        return value
