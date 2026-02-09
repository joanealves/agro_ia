from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Max, Min, Sum
from datetime import timedelta
from django.utils import timezone
from .models import DadosProdutividade
from .serializers import DadosProdutividadeSerializer
from .filters import DadosProdutividadeFilter


class DadosProdutividadeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar dados de produtividade.
    Multi-tenancy: Filtra apenas pelos dados do usuário autenticado.
    """
    serializer_class = DadosProdutividadeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = DadosProdutividadeFilter
    ordering_fields = ['data_colheita', 'data_registro', 'rendimento_kg_ha']
    ordering = ['-data_colheita', '-data_registro']

    def get_queryset(self):
        """Retorna dados apenas do usuário autenticado"""
        return DadosProdutividade.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        """Auto-associa o usuário autenticado"""
        serializer.save(usuario=self.request.user)

    @action(detail=False, methods=['get'])
    def comparativo(self, request):
        """
        Compara produtividade entre talhões ou períodos.
        Query params: talhao (lista separada por vírgula), Days past (def 90)
        Retorna: comparativos com média, min, max, tendência
        """
        talhao_ids = request.query_params.get('talhao', '').split(',')
        days_past = int(request.query_params.get('dias', 90))
        
        talhao_ids = [id.strip() for id in talhao_ids if id.strip()]
        start_date = timezone.now().date() - timedelta(days=days_past)
        
        queryset = self.get_queryset()
        if talhao_ids:
            queryset = queryset.filter(talhao_id__in=talhao_ids)
        queryset = queryset.filter(data_colheita__gte=start_date)

        # Agrupar por talhão
        comparativo = []
        for talhao_id in talhao_ids:
            dados = queryset.filter(talhao_id=talhao_id)
            if dados.exists():
                stats = dados.aggregate(
                    media=Avg('rendimento_kg_ha'),
                    maximo=Max('rendimento_kg_ha'),
                    minimo=Min('rendimento_kg_ha'),
                    total_colheitas=Sum('peso_colhido_kg'),
                    lucro_total=Sum('lucro_total'),
                    custo_total=Sum('custo_total')
                )
                comparativo.append({
                    'talhao_id': talhao_id,
                    'talhao_nome': dados.first().talhao.nome if dados.first().talhao else 'N/A',
                    **stats
                })

        return Response(comparativo)

    @action(detail=False, methods=['get'])
    def previsao(self, request):
        """
        Gera previsão de rendimento para os próximos 30/90 dias.
        Query params: talhao, dias_futuros (default 30)
        Retorna: tendência, previsão, intervalo de confiança
        """
        talhao_id = request.query_params.get('talhao')
        dias_futuros = int(request.query_params.get('dias_futuros', 30))
        dias_passados = int(request.query_params.get('dias_passados', 180))

        queryset = self.get_queryset()
        if talhao_id:
            queryset = queryset.filter(talhao_id=talhao_id)

        # Dados históricos
        start_date = timezone.now().date() - timedelta(days=dias_passados)
        historico = list(
            queryset
            .filter(data_colheita__gte=start_date, status='colhido')
            .values_list('data_colheita', 'rendimento_kg_ha')
            .order_by('data_colheita')
        )

        if not historico or len(historico) < 2:
            return Response({
                'status': 'insuficiente_dados',
                'mensagem': 'Dados insuficientes para previsão (mínimo 2 colheitas)',
                'previsoes': []
            })

        # Calcular tendência simples (regressão linear básica)
        x = list(range(len(historico)))
        y = [h[1] for h in historico]
        
        # Coeficientes
        n = len(x)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(xi * yi for xi, yi in zip(x, y))
        sum_x2 = sum(xi ** 2 for xi in x)
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2) if n * sum_x2 - sum_x ** 2 != 0 else 0
        intercept = (sum_y - slope * sum_x) / n
        
        # Gerar previsões
        media = sum(y) / len(y)
        desvio_padrao = (sum((yi - media) ** 2 for yi in y) / len(y)) ** 0.5
        
        previsoes = []
        data_atual = historico[-1][0]
        for i in range(1, dias_futuros + 1):
            data_prevista = data_atual + timedelta(days=i*30)  # ~mensal
            indice = len(historico) + i - 1
            valor_previsto = slope * indice + intercept
            
            previsoes.append({
                'data': data_prevista.isoformat(),
                'rendimento_previsto': max(0, round(valor_previsto, 2)),
                'intervalo_confianca': {
                    'minimo': max(0, round(valor_previsto - 1.96 * desvio_padrao, 2)),
                    'maximo': round(valor_previsto + 1.96 * desvio_padrao, 2)
                }
            })

        return Response({
            'status': 'ok',
            'tendencia': 'aumentando' if slope > 0 else 'diminuindo' if slope < 0 else 'estável',
            'taxa_mudanca': round(slope, 3),
            'media_historica': round(media, 2),
            'desvio_padrao': round(desvio_padrao, 2),
            'previsoes': previsoes
        })

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Retorna dados agregados para o dashboard principal.
        Query params: fazenda (opcional)
        """
        queryset = self.get_queryset()
        fazenda_id = request.query_params.get('fazenda')
        if fazenda_id:
            queryset = queryset.filter(fazenda_id=fazenda_id)

        # Agregações
        stats = queryset.aggregate(
            total_talhoes=Sum('talhao_id', distinct=True) if queryset.values('talhao_id').distinct() else 0,
            media_rendimento=Avg('rendimento_kg_ha'),
            melhor_rendimento=Max('rendimento_kg_ha'),
            pior_rendimento=Min('rendimento_kg_ha'),
            lucro_total=Sum('lucro_total'),
            area_total=Sum('area_hectares'),
            colheitas_realizadas=Sum('status', filter=Q(status='colhido')),
        )

        # Top 5 talhões por rendimento
        top_talhoes = list(
            queryset
            .values('talhao__nome', 'cultura')
            .annotate(rendimento_medio=Avg('rendimento_kg_ha'))
            .order_by('-rendimento_medio')[:5]
        )

        # Distribuição de culturas
        culturas = list(
            queryset
            .values('cultura')
            .annotate(
                total_area=Sum('area_hectares'),
                media_rendimento=Avg('rendimento_kg_ha')
            )
            .order_by('-total_area')
        )

        return Response({
            'estatisticas': stats,
            'top_talhoes': top_talhoes,
            'culturas': culturas
        })