from rest_framework import serializers
from .models import Praga
from django.core.files.images import get_image_dimensions

class PragaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Praga
        fields = '__all__'
        read_only_fields = ['data_criacao', 'status']  # Campos somente leitura

    def validate_imagem(self, value):
        # Verifica se o arquivo é uma imagem
        try:
            width, height = get_image_dimensions(value)
            if not width or not height:
                raise serializers.ValidationError("O arquivo enviado não é uma imagem válida.")
        except Exception as e:
            raise serializers.ValidationError("Erro ao validar a imagem.")
        return value