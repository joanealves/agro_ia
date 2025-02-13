from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Praga
from celery import shared_task
from django.core.files.storage import default_storage
from .serializers import PragaSerializer
from .filters import PragaFilter
from rest_framework.pagination import PageNumberPagination
import tensorflow as tf 
from tensorflow.keras.applications import MobileNet
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet import preprocess_input, decode_predictions
import numpy as np

# Carregar o modelo de IA uma única vez na inicialização
model = MobileNet(weights='imagenet')

@shared_task
def processar_imagem_praga(imagem_path):
    try:
        img = image.load_img(default_storage.path(imagem_path), target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        predictions = model.predict(img_array)
        decoded_predictions = decode_predictions(predictions, top=3)[0]
        return [{"label": label, "description": description, "probability": float(prob)}
                for (_, label, description, prob) in decoded_predictions]
    except Exception as e:
        return {"error": str(e)}

class UploadPragaView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = PragaSerializer(data=request.data)
        if serializer.is_valid():
            # Salva a praga no banco de dados
            serializer.save(usuario=request.user)
            imagem_path = serializer.instance.imagem.path

            # Processa a imagem de forma síncrona
            try:
                img = image.load_img(imagem_path, target_size=(224, 224))
                img_array = image.img_to_array(img)
                img_array = np.expand_dims(img_array, axis=0)
                img_array = preprocess_input(img_array)
                predictions = model.predict(img_array)
                decoded_predictions = decode_predictions(predictions, top=3)[0]
                resultados = [{"label": label, "description": description, "probability": float(prob)}
                              for (_, label, description, prob) in decoded_predictions]
            except Exception as e:
                resultados = {"error": str(e)}

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