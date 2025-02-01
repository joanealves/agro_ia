from django.db import models

class DadosProdutividade(models.Model):
    cultura = models.CharField(max_length=100)
    area = models.FloatField()
    produtividade = models.FloatField()
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.cultura} - {self.data}"