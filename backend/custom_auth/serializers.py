from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        # Verifica se o email foi passado em vez de username
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError("É necessário fornecer email e senha")
            
        # Busca o usuário pelo email
        user = CustomUser.objects.filter(email=email).first()
        if not user:
            raise serializers.ValidationError("Credenciais inválidas")
        
        # Verifica a senha
        if not user.check_password(password):
            raise serializers.ValidationError("Credenciais inválidas")
            
        # Define os atributos corretos para a validação do token
        attrs['username'] = user.username
        
        # Chama o método pai para validar e gerar o token
        data = super().validate(attrs)
        
        # Adiciona dados do usuário na resposta
        data['user'] = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'username': user.username,
        }
        
        # Cria aliases para os tokens para serem usados pelo frontend
        data['access_token'] = data['access']
        data['refresh_token'] = data['refresh']
        
        return data


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'name', 'email', 'username', 'password', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Create a new user with the validated data
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # Set additional fields (name and role)
        user.name = validated_data.get('name', '')
        user.role = validated_data.get('role', 'user')
        user.save()
        
        return user
    
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'name', 'email', 'username', 'role')