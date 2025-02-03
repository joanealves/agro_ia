from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Praga
from .serializers import PragaSerializer
from .filters import PragaFilter
import tensorflow as tf
from tensorflow.keras.applications import MobileNet
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet import preprocess_input, decode_predictions
import numpy as np

# Carregar o modelo de IA uma única vez na inicialização
model = MobileNet(weights='imagenet')

class UploadPragaView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        # Salvar a imagem no modelo Praga
        serializer = PragaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            # Processar a imagem com o modelo de IA
            img_path = serializer.instance.imagem.path
            img = image.load_img(img_path, target_size=(224, 224))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)

            # Fazer a previsão
            predictions = model.predict(img_array)
            decoded_predictions = decode_predictions(predictions, top=3)[0]

            # Retornar os resultados
            results = [{"label": label, "description": description, "probability": float(prob)}
                       for (_, label, description, prob) in decoded_predictions]
            return Response({"praga": serializer.data, "predictions": results}, status=201)

        return Response(serializer.errors, status=400)

class ListPragasView(ListAPIView):
    queryset = Praga.objects.all().order_by('-data_criacao')
    serializer_class = PragaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PragaFilter
