import django_filters
from .models import Praga

class PragaFilter(django_filters.FilterSet):
    nome = django_filters.CharFilter(lookup_expr='icontains')
    fazenda = django_filters.NumberFilter(field_name="fazenda__id")
    data_inicio = django_filters.DateFilter(field_name="data_criacao", lookup_expr="gte")
    data_fim = django_filters.DateFilter(field_name="data_criacao", lookup_expr="lte")

    class Meta:
        model = Praga
        fields = ['nome', 'fazenda', 'data_inicio', 'data_fim']
