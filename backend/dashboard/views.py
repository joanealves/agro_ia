from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import DadosProdutividade
from .serializers import DadosProdutividadeSerializer

class DashboardView(APIView):
    def get(self, request, *args, **kwargs):
        dados = DadosProdutividade.objects.all()
        serializer = DadosProdutividadeSerializer(dados, many=True)
        return Response(serializer.data)