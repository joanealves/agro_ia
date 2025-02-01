import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import DadosClimaticos
from .serializers import DadosClimaticosSerializer

class ConsultaClimaView(APIView):
    def get(self, request, *args, **kwargs):
        # Chave da API do Meteomatics
        api_key = {"access_token":"eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2IjoxLCJ1c2VyIjoic2NoZW1hX3JpYmVpcm9fam9hbmUiLCJpc3MiOiJsb2dpbi5tZXRlb21hdGljcy5jb20iLCJleHAiOjE3MzgzNjgyMDgsInN1YiI6ImFjY2VzcyJ9.YDWifBTHY4me1aytj4c_2EAy_jWKtL_SR91X3K_qBlvoM3kyfceMX3v8kG-qN66KQK2U_nvHAiqfeEGtknl_uQ","token_type":"bearer"}
        username = "schema_ribeiro_joane"  
        password = "uaUH9h67LJ"    

        # Parâmetros da requisição
        data = "2023-10-25T00:00:00Z"  #  formato ISO
        parameters = "temperature_2m:C,relative_humidity_2m:p,precipitation_1h:mm"
        location = "-23.5505,-46.6333"  # Coordenadas de São Paulo
        format = "json"

        # URL da API
        url = f"https://api.meteomatics.com/{data}/{parameters}/{location}/{format}"

        # Fazer a requisição à API
        response = requests.get(url, auth=(username, password))

        if response.status_code == 200:
            data = response.json()

            # Extrair os dados da resposta
            temperatura = data['data'][0]['coordinates'][0]['dates'][0]['value']
            umidade = data['data'][1]['coordinates'][0]['dates'][0]['value']
            precipitacao = data['data'][2]['coordinates'][0]['dates'][0]['value']

            # Salvar os dados no banco de dados
            dados = DadosClimaticos(
                temperatura=temperatura,
                umidade=umidade,
                precipitacao=precipitacao
            )
            dados.save()

            # Retornar os dados
            serializer = DadosClimaticosSerializer(dados)
            return Response(serializer.data)
        else:
            return Response({"error": "Erro ao consultar a API"}, status=response.status_code)