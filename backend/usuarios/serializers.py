from rest_framework import serializers
from backend.custom_auth.models import CustomUser  

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser  
        fields = ['id', 'username', 'email', 'is_staff']
