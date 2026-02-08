from django.db import models
from django.conf import settings
from decimal import Decimal
from backend.fazenda.models import Fazenda
from backend.talhoes.models import Talhao

class DadosProdutividade(models.Model):
    STATUS_CHOICES = [
        ('planejado', 'Planejado'),
        ('em_cultivo', 'Em Cultivo'),
        ('colhido', 'Colhido'),
        ('perdido', 'Perdido'),
    ]

    # Relações
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE, related_name='produtividade_dados')
    talhao = models.ForeignKey(Talhao, on_delete=models.CASCADE, related_name='produtividade_dados', null=True, blank=True)

    # Informações de Cultivo
    cultura = models.CharField(max_length=100)
    area_hectares = models.FloatField(default=0, help_text="Área em hectares")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='em_cultivo')

    # Datas
    data_plantio = models.DateField(null=True, blank=True)
    data_colheita = models.DateField(null=True, blank=True)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    # Produção
    peso_colhido_kg = models.FloatField(null=True, blank=True, help_text="Peso colhido em kg")
    rendimento_kg_ha = models.FloatField(null=True, blank=True, help_text="Rendimento em kg/hectare")
    preco_kg = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    receita_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Custos
    custo_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    lucro_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Notas
    observacoes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-data_colheita', '-data_registro']
        verbose_name_plural = 'Dados de Produtividade'

    def save(self, *args, **kwargs):
        # Auto-calcular rendimento se houver dados
        if self.peso_colhido_kg and self.area_hectares:
            self.rendimento_kg_ha = self.peso_colhido_kg / self.area_hectares

        # Auto-calcular receita
        if self.peso_colhido_kg and self.preco_kg:
            self.receita_total = Decimal(str(self.peso_colhido_kg)) * self.preco_kg

        # Auto-calcular lucro
        if self.receita_total and self.custo_total:
            self.lucro_total = self.receita_total - self.custo_total

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.cultura} - {self.talhao.nome if self.talhao else 'Fazenda'} ({self.data_plantio})"