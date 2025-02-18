from rest_framework import serializers
from .models import Fazenda

class FazendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fazenda
        fields = '__all__'
