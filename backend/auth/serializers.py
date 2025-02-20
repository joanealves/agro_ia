from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        credentials = {
            'email': attrs.get('email'),
            'password': attrs.get('password')
        }
        
        user_model = get_user_model()
        user = user_model.objects.filter(email=credentials['email']).first()
        
        if user:
            credentials['username'] = user.username
        
        return super().validate(credentials)