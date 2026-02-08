from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Max, Min, Sum
from backend.pragas.models import Praga
from backend.irrigacao.models import DadosClimaticos
from backend.produtividade.models import DadosProdutividade
from backend.fazenda.models import Fazenda
import django_filters

class DashboardView(APIView):
    def get(self, request, *args, **kwargs):
        total_pragas = Praga.objects.count()
        
        clima_stats = DadosClimaticos.objects.aggregate(
            temp_media=Avg("temperatura"),
            temp_max=Max("temperatura"),
            temp_min=Min("temperatura"),
            umidade_media=Avg("umidade"),
            chuva_total=Sum("precipitacao"),
        )

        produtividade_por_fazenda = (
            DadosProdutividade.objects.values("fazenda__nome")
            .annotate(media_produtividade=Avg("rendimento_kg_ha"))
            .order_by("-media_produtividade")
        )

        return Response({
            "total_pragas": total_pragas,
            "clima": clima_stats,
            "produtividade": list(produtividade_por_fazenda)
        })

class DadosProdutividadeFilter(django_filters.FilterSet):
    cultura = django_filters.CharFilter(lookup_expr='icontains')
    data_inicio = django_filters.DateFilter(field_name="data_plantio", lookup_expr="gte")
    data_fim = django_filters.DateFilter(field_name="data_colheita", lookup_expr="lte")
    fazenda = django_filters.NumberFilter(field_name="fazenda__id")

    class Meta:
        model = DadosProdutividade
        fields = ['cultura', 'data_inicio', 'data_fim', 'fazenda']

# Adicione a classe ProdutividadeSerieTemporalView
class ProdutividadeSerieTemporalView(APIView):
    def get(self, request, *args, **kwargs):
        dados = DadosProdutividade.objects.values('data_registro', 'rendimento_kg_ha').order_by('data_registro')
        return Response({"dados": list(dados)})