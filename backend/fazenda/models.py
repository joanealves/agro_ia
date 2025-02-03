from django.db import models
from django.contrib.auth.models import User

class Fazenda(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    nome = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    localizacao = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nome
