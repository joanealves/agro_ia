from rest_framework import serializers
from .models import DadosProdutividade

class DadosProdutividadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DadosProdutividade
        fields = '__all__'