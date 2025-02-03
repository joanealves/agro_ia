from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Max, Min, Sum, Count
from django_filters.rest_framework import DjangoFilterBackend
from pragas.models import Praga
from clima.models import DadosClimaticos
from produtividade.models import DadosProdutividade
from usuarios.models import Fazenda

class DashboardView(APIView):
    def get(self, request, *args, **kwargs):
        # 📌 Contagem total de pragas cadastradas
        total_pragas = Praga.objects.count()

        # 📌 Estatísticas climáticas
        clima_stats = DadosClimaticos.objects.aggregate(
            temp_media=Avg("temperatura"),
            temp_max=Max("temperatura"),
            temp_min=Min("temperatura"),
            umidade_media=Avg("umidade"),
            chuva_total=Sum("precipitacao"),
        )

        # 📌 Produtividade média por fazenda
        produtividade_por_fazenda = (
            DadosProdutividade.objects.values("fazenda__nome")
            .annotate(media_produtividade=Avg("produtividade"))
            .order_by("-media_produtividade")
        )

        # 📌 Resposta da API
        return Response({
            "total_pragas": total_pragas,
            "clima": clima_stats,
            "produtividade": list(produtividade_por_fazenda)
        })
