# from django.db import models
# from django.conf import settings

# class Notificacao(models.Model):
#     usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notificacoes')  # Usa settings.AUTH_USER_MODEL
#     mensagem = models.TextField()
#     tipo = models.CharField(max_length=20, choices=[('email', 'Email'), ('whatsapp', 'WhatsApp')])
#     enviada_em = models.DateTimeField(auto_now_add=True)
#     lida = models.BooleanField(default=False)

#     def __str__(self):
#         return f"Notificação para {self.usuario.username} - {self.tipo}"




















from django.db import models


class Notificacao(models.Model):
    """Notificações do sistema"""
    
    TIPO_CHOICES = [
        ('info', 'Informação'),
        ('alerta', 'Alerta'),
        ('critico', 'Crítico'),
        ('sucesso', 'Sucesso'),
        ('erro', 'Erro'),
    ]
    
    CATEGORIA_CHOICES = [
        ('clima', 'Clima'),
        ('praga', 'Praga'),
        ('irrigacao', 'Irrigação'),
        ('produtividade', 'Produtividade'),
        ('sistema', 'Sistema'),
        ('financeiro', 'Financeiro'),
        ('manutencao', 'Manutenção'),
        ('vencimento', 'Vencimento'),
    ]
    
    # Usar UUID se estiver usando Supabase auth
    usuario_id = models.UUIDField()
    
    titulo = models.CharField(max_length=255)
    mensagem = models.TextField()
    
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='info')
    categoria = models.CharField(max_length=30, choices=CATEGORIA_CHOICES, blank=True, null=True)
    prioridade = models.IntegerField(default=0)  # 0=normal, 1=alta, 2=urgente
    
    lida = models.BooleanField(default=False)
    data_leitura = models.DateTimeField(blank=True, null=True)
    arquivada = models.BooleanField(default=False)
    
    link = models.CharField(max_length=500, blank=True, null=True)
    acao_requerida = models.BooleanField(default=False)
    
    fazenda_id = models.BigIntegerField(blank=True, null=True)
    talhao_id = models.BigIntegerField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notificacoes'
        managed = False  # Tabela gerenciada pelo Supabase
        ordering = ['-created_at']
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'

    def __str__(self):
        return f"{self.titulo} ({self.tipo})"








