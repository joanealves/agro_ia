import django_filters
from .models import DadosProdutividade

class DadosProdutividadeFilter(django_filters.FilterSet):
    cultura = django_filters.CharFilter(lookup_expr='icontains')  
    data_inicio = django_filters.DateFilter(field_name="data", lookup_expr="gte")  
    data_fim = django_filters.DateFilter(field_name="data", lookup_expr="lte") 
    fazenda = django_filters.NumberFilter(field_name="fazenda__id")  

    class Meta:
        model = DadosProdutividade
        fields = ['cultura', 'data_inicio', 'data_fim', 'fazenda']