from django.db import models
from django.conf import settings

class Praga(models.Model):
    fazenda = models.ForeignKey('fazenda.Fazenda', on_delete=models.CASCADE, null=True)  
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    imagem = models.ImageField(upload_to='pragas/')
    data_criacao = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[('pendente', 'Pendente'), ('resolvido', 'Resolvido')],
        default='pendente'
    )

    def __str__(self):
        return self.nome
