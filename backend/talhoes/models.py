from django.db import models
from backend.fazenda.models import Fazenda
from backend.custom_auth.models import CustomUser

class Talhao(models.Model):
    """
    Talhão - Parcela de terra dentro de uma fazenda
    Representa uma área delimitada com geometria (polígono em GeoJSON)
    """
    id = models.AutoField(primary_key=True)
    fazenda = models.ForeignKey(
        Fazenda, 
        on_delete=models.CASCADE,
        related_name='talhoes'
    )
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    
    # Culturas possíveis
    CULTURAS = [
        ('milho', 'Milho'),
        ('soja', 'Soja'),
        ('trigo', 'Trigo'),
        ('arroz', 'Arroz'),
        ('cana_de_acucar', 'Cana de Açúcar'),
        ('cafe', 'Café'),
        ('algodao', 'Algodão'),
        ('feijao', 'Feijão'),
        ('outro', 'Outro'),
    ]
    
    cultura = models.CharField(
        max_length=20,
        choices=CULTURAS,
        default='milho'
    )
    
    # Área em hectares
    area_hectares = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Área em hectares"
    )
    
    # ✅ Geometria - Polígono em formato GeoJSON
    # Formato: {"type": "Polygon", "coordinates": [[[lng, lat], [lng, lat], ...]]}
    geometria = models.JSONField(
        null=True,
        blank=True,
        default=dict,
        help_text="Polígono em formato GeoJSON com coordenadas [lng, lat]"
    )
    
    # Status do talhão
    STATUS_CHOICES = [
        ('ativo', 'Ativo'),
        ('pousio', 'Pousio'),
        ('inativo', 'Inativo'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ativo'
    )
    
    # Datas
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    data_plantio = models.DateField(null=True, blank=True)
    data_colheita = models.DateField(null=True, blank=True)
    
    # Rendimento esperado
    rendimento_esperado = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Rendimento esperado em sacas/ha ou toneladas/ha"
    )
    
    # Rendimento real (preenchido após colheita)
    rendimento_real = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Rendimento real em sacas/ha ou toneladas/ha"
    )

    class Meta:
        verbose_name = "Talhão"
        verbose_name_plural = "Talhões"
        ordering = ['-data_criacao']
        indexes = [
            models.Index(fields=['fazenda', 'status']),
        ]

    def __str__(self):
        return f"{self.nome} ({self.cultura}) - {self.fazenda.nome}"
