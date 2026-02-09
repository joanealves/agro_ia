from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Praga
from celery import shared_task
from django.core.files.storage import default_storage
from .serializers import PragaSerializer
from .filters import PragaFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets
from backend.notificacoes.utils import notificar_praga_critica
import numpy as np


# ❌ TensorFlow task comentada temporariamente
# @shared_task
# def processar_imagem_praga(imagem_path):
#     try:
#         img = image.load_img(default_storage.path(imagem_path), target_size=(224, 224))
#         img_array = image.img_to_array(img)
#         img_array = np.expand_dims(img_array, axis=0)
#         img_array = preprocess_input(img_array)
#         predictions = model.predict(img_array)
#         decoded_predictions = decode_predictions(predictions, top=3)[0]
#         return [{"label": label, "description": description, "probability": float(prob)}
#                 for (_, label, description, prob) in decoded_predictions]
#     except Exception as e:
#         return {"error": str(e)}

class UploadPragaView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = PragaSerializer(data=request.data)
        if serializer.is_valid():
            # Salva a praga no banco de dados
            serializer.save(usuario=request.user)

            # ❌ Processamento de imagem com TensorFlow comentado
            # Descomente quando TensorFlow estiver instalado
            #             imagem_path = serializer.instance.imagem.path
            #             try:
            #                 img = image.load_img(imagem_path, target_size=(224, 224))
            #                 img_array = image.img_to_array(img)
            #                 img_array = np.expand_dims(img_array, axis=0)
            #                 img_array = preprocess_input(img_array)
            #                 predictions = model.predict(img_array)
            #                 decoded_predictions = decode_predictions(predictions, top=3)[0]
            #                 resultados = [{"label": label, "description": description, "probability": float(prob)}
            #                               for (_, label, description, prob) in decoded_predictions]
            #             except Exception as e:
            #                 resultados = {"error": str(e)}
            
            resultados = {"status": "Imagem salva com sucesso (processamento de IA desativado)"}
            return Response({"praga": serializer.data, "resultados": resultados}, status=201)
        return Response(serializer.errors, status=400)

class PragaPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ListPragasView(ListAPIView):
    queryset = Praga.objects.all().order_by('-data_criacao')
    serializer_class = PragaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PragaFilter
    pagination_class = PragaPagination
    
class PragaViewSet(viewsets.ModelViewSet):
    serializer_class = PragaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = PragaFilter
    pagination_class = PragaPagination

    def get_queryset(self):
        # ✅ MULTI-TENANCY: Usuário só vê suas próprias pragas
        return Praga.objects.filter(usuario=self.request.user).order_by('-data_criacao')

    def perform_create(self, serializer):
        # Salva com o usuário logado automaticamente
        praga = serializer.save(usuario=self.request.user)
        
        # Notificar se for praga crítica
        if praga.nivel == 'critico':
            notificar_praga_critica(self.request.user, praga)

    @action(detail=True, methods=['patch'])
    def atualizar_status(self, request, pk=None):
        praga = self.get_object()
        novo_status = request.data.get('status')
        if novo_status not in ['pendente', 'resolvido']:
            return Response({"erro": "Status inválido"}, status=400)
        praga.status = novo_status
        praga.save()
        return Response({"status": "Status atualizado com sucesso"})    