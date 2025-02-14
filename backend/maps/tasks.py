import requests
from celery import shared_task
from .models import Mapa

@shared_task
def atualizar_dados_satelite():
    url = "https://api.nasa.gov/planetary/earth/imagery"
    params = {
        "lon": -47.9292,
        "lat": -15.7801,
        "date": "2023-10-01",
        "dim": 0.1,
        "api_key": "SUA_CHAVE_API"
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
       