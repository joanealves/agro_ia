from django.db import models
from backend.fazenda.models import Fazenda


class DadosClimaticos(models.Model):
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, default=1)  
    temperatura = models.FloatField()
    umidade = models.FloatField()
    precipitacao = models.FloatField()
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dados Climáticos - {self.data}"
