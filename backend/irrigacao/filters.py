import django_filters
from .models import DadosClimaticos

class DadosClimaticosFilter(django_filters.FilterSet):
    temperatura_min = django_filters.NumberFilter(field_name="temperatura", lookup_expr="gte")
    temperatura_max = django_filters.NumberFilter(field_name="temperatura", lookup_expr="lte")
    umidade_min = django_filters.NumberFilter(field_name="umidade", lookup_expr="gte")
    umidade_max = django_filters.NumberFilter(field_name="umidade", lookup_expr="lte")
    data = django_filters.DateFilter(field_name="data", lookup_expr="date")
    fazenda = django_filters.NumberFilter(field_name="fazenda__id")

    class Meta:
        model = DadosClimaticos
        fields = ['temperatura_min', 'temperatura_max', 'umidade_min', 'umidade_max', 'data', 'fazenda']
