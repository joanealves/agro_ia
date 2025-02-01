from django.db import models
from backend.fazenda.models import Fazenda

class Praga(models.Model):
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, null=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    imagem = models.ImageField(upload_to='pragas/')
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome
