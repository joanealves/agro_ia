from django.db import models
from backend.fazenda.models import Fazenda

class DadosClimaticos(models.Model):
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE)
    temperatura = models.FloatField()
    umidade = models.FloatField()
    precipitacao = models.FloatField()
    data_coleta = models.DateTimeField(auto_now_add=True)  # Nome do campo alterado

    def __str__(self):
        return f"Dados Climáticos - {self.data_coleta}"