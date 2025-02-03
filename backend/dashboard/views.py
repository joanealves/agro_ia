from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import DadosProdutividade
from .serializers import DadosProdutividadeSerializer
from .filters import DadosProdutividadeFilter

class DashboardView(generics.ListAPIView):
    queryset = DadosProdutividade.objects.all()
    serializer_class = DadosProdutividadeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = DadosProdutividadeFilter