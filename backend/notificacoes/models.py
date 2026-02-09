from django.db import models
from django.conf import settings


class Notificacao(models.Model):
    """Notificações do sistema - alertas para usuários"""
    
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
    
    # Relação com usuário
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notificacoes'
    )
    
    titulo = models.CharField(max_length=255)
    mensagem = models.TextField()
    
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='info')
    categoria = models.CharField(max_length=30, choices=CATEGORIA_CHOICES, default='sistema')
    prioridade = models.IntegerField(
        default=0,
        help_text='0=normal, 1=alta, 2=urgente'
    )
    
    lida = models.BooleanField(default=False)
    data_leitura = models.DateTimeField(blank=True, null=True)
    arquivada = models.BooleanField(default=False)
    
    link = models.CharField(max_length=500, blank=True, null=True)
    acao_requerida = models.BooleanField(default=False)
    
    # Referências opcionais para contexto
    fazenda_id = models.IntegerField(blank=True, null=True)
    talhao_id = models.IntegerField(blank=True, null=True)
    praga_id = models.IntegerField(blank=True, null=True)
    irrigacao_id = models.IntegerField(blank=True, null=True)
    
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-data_criacao']
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'
        indexes = [
            models.Index(fields=['usuario', '-data_criacao']),
            models.Index(fields=['usuario', 'lida']),
        ]

    def __str__(self):
        return f"{self.titulo} - {self.usuario.username} ({self.tipo})"








