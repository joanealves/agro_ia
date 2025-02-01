from django.db import models
from backend.fazenda.models import Fazenda


class DadosProdutividade(models.Model):
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, default=1)  # Supondo que a fazenda com id=1 seja a padrão
    cultura = models.CharField(max_length=100)
    area = models.FloatField()
    produtividade = models.FloatField()
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.cultura} - {self.data}"

