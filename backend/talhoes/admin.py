from django.contrib import admin
from .models import Talhao


@admin.register(Talhao)
class TalhaoAdmin(admin.ModelAdmin):
    """Admin para Talhões"""
    list_display = ['nome', 'fazenda', 'cultura', 'area_hectares', 'status', 'data_criacao']
    list_filter = ['cultura', 'status', 'data_criacao']
    search_fields = ['nome', 'descricao', 'fazenda__nome']
    
    fieldsets = (
        ('Identificação', {
            'fields': ('fazenda', 'nome', 'descricao')
        }),
        ('Classificação', {
            'fields': ('cultura', 'area_hectares', 'status')
        }),
        ('Localização', {
            'fields': ('geometria',),
            'classes': ('collapse',)
        }),
        ('Plantio e Colheita', {
            'fields': ('data_plantio', 'data_colheita'),
            'classes': ('collapse',)
        }),
        ('Rendimento', {
            'fields': ('rendimento_esperado', 'rendimento_real'),
            'classes': ('collapse',)
        }),
        ('Datas do Sistema', {
            'fields': ('data_criacao', 'data_atualizacao'),
            'classes': ('collapse',),
            'readonly_fields': ('data_criacao', 'data_atualizacao')
        }),
    )
    
    readonly_fields = ['data_criacao', 'data_atualizacao']
