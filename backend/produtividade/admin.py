from django.contrib import admin
from .models import DadosProdutividade


@admin.register(DadosProdutividade)
class DadosProdutividadeAdmin(admin.ModelAdmin):
    list_display = [
        'cultura',
        'talhao',
        'status',
        'data_plantio',
        'data_colheita',
        'rendimento_kg_ha',
        'lucro_total',
    ]
    list_filter = [
        'status',
        'cultura',
        'data_colheita',
        'usuario',
    ]
    search_fields = [
        'cultura',
        'talhao__nome',
        'fazenda__nome',
    ]
    readonly_fields = [
        'usuario',
        'rendimento_kg_ha',
        'receita_total',
        'lucro_total',
        'data_registro',
        'data_atualizacao',
    ]

    fieldsets = (
        ('Identificação', {
            'fields': ('usuario', 'fazenda', 'talhao')
        }),
        ('Informações de Cultivo', {
            'fields': ('cultura', 'area_hectares', 'status')
        }),
        ('Datas', {
            'fields': (
                'data_plantio',
                'data_colheita',
                'data_registro',
                'data_atualizacao',
            )
        }),
        ('Produção', {
            'fields': (
                'peso_colhido_kg',
                'rendimento_kg_ha',
                'preco_kg',
                'receita_total',
            )
        }),
        ('Custos & Lucros', {
            'fields': (
                'custo_total',
                'lucro_total',
            )
        }),
        ('Observações', {
            'fields': ('observacoes',),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        """Auto-associa o usuário autenticado"""
        if not change:  # Novo objeto
            obj.usuario = request.user
        super().save_model(request, obj, form, change)