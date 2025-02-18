from rest_framework import serializers
from backend.irrigacao.models import Irrigacao 
from backend.irrigacao.models import DadosClimaticos 


class IrrigacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Irrigacao
        fields = '__all__'

class DadosClimaticosSerializer(serializers.ModelSerializer):
    class Meta:
        model = DadosClimaticos
        fields = '__all__'