from django.db import models
from django.contrib.auth.models import User

class Notificacao(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notificacoes')
    mensagem = models.TextField()
    tipo = models.CharField(max_length=20, choices=[('email', 'Email'), ('whatsapp', 'WhatsApp')])
    enviada_em = models.DateTimeField(auto_now_add=True)
    lida = models.BooleanField(default=False)

    def __str__(self):
        return f"Notificação para {self.usuario.username} - {self.tipo}"