# irrigacao/tasks.py
from celery import shared_task
from .models import DadosClimaticos, Fazenda
import requests

@shared_task
def consultar_clima_para_fazenda(fazenda_id):
    try:
        fazenda = Fazenda.objects.get(id=fazenda_id)
        lat, lon = fazenda.latitude, fazenda.longitude
        api_key = "OPENWEATHERMAP_TOKEN"
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        
        response = requests.get(url)
        data = response.json()
        
        DadosClimaticos.objects.create(
            fazenda=fazenda,
            temperatura=data['main']['temp'],
            umidade=data['main']['humidity'],
            precipitacao=data.get('rain', {}).get('1h', 0)
        )
        
        return f"Dados climáticos salvos para {fazenda.nome}"
    except Exception as e:
        return f"Erro: {str(e)}"