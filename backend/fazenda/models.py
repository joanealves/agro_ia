from django.db import models
from django.conf import settings

class Fazenda(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='fazendas_fazenda')  # Adiciona related_name único
    nome = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    localizacao = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nome
