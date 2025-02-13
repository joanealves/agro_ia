from django.contrib import admin
from .models import DadosProdutividade

@admin.register(DadosProdutividade)
class DadosProdutividadeAdmin(admin.ModelAdmin):
    list_display = ('fazenda', 'cultura', 'area', 'produtividade', 'data')
    search_fields = ('cultura', 'fazenda__nome')
    list_filter = ('data', 'fazenda')
