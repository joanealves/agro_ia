from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import DadosProdutividade
from .serializers import DadosProdutividadeSerializer
from .filters import DadosProdutividadeFilter

class DadosProdutividadeView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = DadosProdutividadeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListDadosProdutividadeView(ListAPIView):
    queryset = DadosProdutividade.objects.all()
    serializer_class = DadosProdutividadeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = DadosProdutividadeFilter

class ProdutividadeSerieTemporalView(APIView):
    def get(self, request, *args, **kwargs):
        dados = DadosProdutividade.objects.values('data', 'produtividade').order_by('data')
        return Response({"dados": list(dados)})