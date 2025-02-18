from django.db import models
from backend.fazenda.models import Fazenda

class DadosClimaticos(models.Model):
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE)
    temperatura = models.FloatField()
    umidade = models.FloatField()
    precipitacao = models.FloatField()
    data_coleta = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return f"Dados Climáticos - {self.data_coleta}"
    
class Irrigacao(models.Model):
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name="irrigacoes")
    nome = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=[('ativo', 'Ativo'), ('inativo', 'Inativo')]
    )

    def __str__(self):
        return f"{self.nome} - {self.status}"