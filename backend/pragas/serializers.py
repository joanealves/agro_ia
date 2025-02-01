from rest_framework import serializers
from .models import Praga

class PragaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Praga
        fields = '__all__'
