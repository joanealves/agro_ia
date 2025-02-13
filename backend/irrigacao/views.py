import requests
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from dotenv import load_dotenv
from .models import DadosClimaticos
from .serializers import DadosClimaticosSerializer

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