from django.db import models
from django.contrib.auth.models import User

class Fazenda(models.Model):
    nome = models.CharField(max_length=100)
    localizacao = models.CharField(max_length=255)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name="fazendas")

    def __str__(self):
        return self.nome
