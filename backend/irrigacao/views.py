import requests
import os
from rest_framework.decorators import action
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta
from dotenv import load_dotenv
from .models import DadosClimaticos
from .models import Irrigacao
from backend.irrigacao.serializers import DadosClimaticosSerializer
from backend.irrigacao.serializers import IrrigacaoSerializer 
from rest_framework import generics, permissions  
from rest_framework.permissions import AllowAny  
from backend.custom_auth.models import CustomUser
from backend.usuarios.serializers import CustomUserSerializer  # Importa CustomUserSerializer
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from .models import Fazenda
from backend.fazenda.serializers import FazendaSerializer

load_dotenv()

class ConsultaClimaView(APIView):
    def get(self, request, *args, **kwargs):
        API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
        
        if not API_KEY:
            return Response({"error": "Chave da API não configurada"}, status=500)

        latitude = request.GET.get("lat", "-23.5505")
        longitude = request.GET.get("lon", "-46.6333")

        url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={API_KEY}&units=metric"

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Extrair dados da resposta
            temperatura = data['main']['temp']
            umidade = data['main']['humidity']
            precipitacao = data.get('rain', {}).get('1h', 0)

            # Salvar dados
            dados = DadosClimaticos.objects.create(
                temperatura=temperatura,
                umidade=umidade,
                precipitacao=precipitacao,
                data_coleta=timezone.now()
            )

            serializer = DadosClimaticosSerializer(dados)
            return Response(serializer.data)

        except requests.exceptions.RequestException as e:
            return Response({"error": f"Erro na requisição: {str(e)}"}, status=500)

class SugestaoIrrigacaoView(APIView):
    def get(self, request, fazenda_id):
        data_inicio = timezone.now() - timedelta(days=7)
        dados = DadosClimaticos.objects.filter(
            fazenda_id=fazenda_id,
            data_coleta__gte=data_inicio
        ).order_by('-data_coleta')

        if not dados.exists():
            return Response({"sugestao": "Dados insuficientes para análise"})

        precipitacao_total = sum(d.precipitacao for d in dados)
        umidade_media = sum(d.umidade for d in dados) / len(dados)
        temp_maxima = max(d.temperatura for d in dados)

        sugestoes = []
        if precipitacao_total < 10:
            sugestoes.append("Irrigação necessária (precipitação baixa)")
        if umidade_media < 60:
            sugestoes.append("Aumentar frequência de irrigação")
        if temp_maxima > 30:
            sugestoes.append("Regar no início da manhã para evitar evaporação")

        return Response({
            "analise": {
                "precipitacao_7d": precipitacao_total,
                "umidade_media": umidade_media,
                "temp_maxima": temp_maxima
            },
            "sugestoes": sugestoes if sugestoes else ["Irrigação normal"]
        })
    
class IrrigacaoViewSet(viewsets.ModelViewSet):
    queryset = Irrigacao.objects.all()
    serializer_class = IrrigacaoSerializer

    @action(detail=True, methods=['patch'])
    def atualizar_status(self, request, pk=None):
        irrigacao = self.get_object()
        novo_status = request.data.get('status')
        if novo_status not in ['ativo', 'inativo']:
            return Response({"erro": "Status inválido"}, status=400)
        irrigacao.status = novo_status
        irrigacao.save()
        return Response({"status": "Status atualizado com sucesso"})
    
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()  # Usa CustomUser em vez de User
    serializer_class = CustomUserSerializer  # Usa CustomUserSerializer em vez de UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user = CustomUser.objects.create_user(
            username=request.data['username'],
            password=request.data['password'],
            email=request.data.get('email', ''),
        )
        return Response({"status": "Usuário criado com sucesso"})

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CustomUserSerializer(request.user)  # Usa CustomUserSerializer em vez de UserSerializer
        return Response(serializer.data)

class FazendaViewSet(viewsets.ModelViewSet):
    queryset = Fazenda.objects.none()  
    serializer_class = FazendaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nome', 'localizacao']

    def get_queryset(self):
        return Fazenda.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.usuario != request.user:
            raise PermissionDenied("Acesso negado.")
        return super().retrieve(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Impede exclusão de fazendas de outros usuários."""
        instance = self.get_object()
        if instance.usuario != request.user:
            raise PermissionDenied("Você não pode excluir esta fazenda.")
        return super().destroy(request, *args, **kwargs)
    

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()  
    serializer_class = CustomUserSerializer  
    permission_classes = [permissions.IsAdminUser]

    def create(self, request, *args, **kwargs):
        user = CustomUser.objects.create_user(
            username=request.data['username'],
            password=request.data['password'],
            email=request.data.get('email', ''),
        )
        return Response({"status": "Usuário criado com sucesso"})
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        return Response({"status": "Usuário excluído com sucesso"})