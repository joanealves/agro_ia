from django.db import models

class DadosClimaticos(models.Model):
    temperatura = models.FloatField()
    umidade = models.FloatField()
    precipitacao = models.FloatField()
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dados Climáticos - {self.data}"