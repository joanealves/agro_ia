import requests
import os
from datetime import datetime
from dotenv import load_dotenv
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.timezone import now
from .models import DadosClimaticos
from .serializers import DadosClimaticosSerializer

# Carregar variáveis do arquivo .env
load_dotenv()

class ConsultaClimaView(APIView):
    def get(self, request, *args, **kwargs):
        # Obter credenciais do ambiente
        username = os.getenv("METEOMATICS_USERNAME")
        password = os.getenv("METEOMATICS_PASSWORD")

        if not username or not password:
            return Response({"error": "Credenciais da API não configuradas"}, status=500)

        # Obter parâmetros da requisição
        latitude = request.GET.get("lat", "-23.5505")  # Padrão: São Paulo
        longitude = request.GET.get("lon", "-46.6333")
        location = f"{latitude},{longitude}"

        # Data atual no formato ISO 8601
        data = now().strftime("%Y-%m-%dT%H:%M:%SZ")
        parameters = "temperature_2m:C,relative_humidity_2m:p,precipitation_1h:mm"
        format_type = "json"
        url = f"https://api.meteomatics.com/{data}/{parameters}/{location}/{format_type}"

        try:
            # Fazer requisição à API
            response = requests.get(url, auth=(username, password), timeout=10)
            response.raise_for_status()
            data = response.json()

            # Validar se a resposta contém os dados esperados
            if "data" not in data or len(data["data"]) < 3:
                return Response({"error": "Resposta inesperada da API"}, status=502)

            # Extrair os valores climáticos
            try:
                temperatura = data["data"][0]["coordinates"][0]["dates"][0]["value"]
                umidade = data["data"][1]["coordinates"][0]["dates"][0]["value"]
                precipitacao = data["data"][2]["coordinates"][0]["dates"][0]["value"]
            except (KeyError, IndexError):
                return Response({"error": "Erro ao processar resposta da API"}, status=500)

            # Salvar os dados no banco de dados
            dados = DadosClimaticos.objects.create(
                temperatura=temperatura,
                umidade=umidade,
                precipitacao=precipitacao,
                data=datetime.utcnow()
            )

            # Retornar os dados salvos
            serializer = DadosClimaticosSerializer(dados)
            return Response(serializer.data)

        except requests.exceptions.RequestException as e:
            return Response({"error": f"Erro na requisição: {str(e)}"}, status=500)
