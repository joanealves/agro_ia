from django.db import models


class Mapa(models.Model):
    fazenda = models.ForeignKey(
        'fazenda.Fazenda',
        on_delete=models.CASCADE,
        related_name='mapas',
    )
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    zoom = models.IntegerField(default=10)
    camadas = models.JSONField(default=dict, blank=True)
    publico = models.BooleanField(default=False)
    tipo_mapa = models.CharField(
        max_length=50,
        default='satellite',
        choices=[
            ('osm', 'OpenStreetMap'),
            ('satellite', 'Satélite'),
            ('terrain', 'Terreno'),
            ('dark', 'Modo Escuro'),
        ],
    )
    filtros = models.JSONField(default=dict, blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-data_criacao']

    def __str__(self):
        return f"{self.nome} - {self.fazenda.nome}"
