from django.db import models
from backend.fazenda.models import Fazenda

class Mapa(models.Model):
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='mapas')
    nome = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    zoom = models.IntegerField(default=10)
    camadas = models.JSONField(default=dict, blank=True)  # GeoJSON ou estrutura de camadas
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nome} - {self.fazenda.nome}"