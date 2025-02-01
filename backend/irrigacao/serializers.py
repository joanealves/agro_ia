from rest_framework import serializers
from .models import DadosClimaticos

class DadosClimaticosSerializer(serializers.ModelSerializer):
    class Meta:
        model = DadosClimaticos
        fields = '__all__'