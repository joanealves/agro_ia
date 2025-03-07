from django.db import models
from django.conf import settings

class Fazenda(models.Model):
    nome = models.CharField(max_length=100)
    localizacao = models.CharField(max_length=255)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='fazendas_usuarios')  # Adiciona related_name único

    def __str__(self):
        return self.nome
