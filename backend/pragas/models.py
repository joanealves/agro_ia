from django.contrib.auth import get_user_model
from backend.fazenda.models import Fazenda

User = get_user_model()

class Praga(models.Model):
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, null=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True)  
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    imagem = models.ImageField(upload_to='pragas/')
    data_criacao = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('pendente', 'Pendente'), ('resolvido', 'Resolvido')], default='pendente') 

    def __str__(self):
        return self.nome
