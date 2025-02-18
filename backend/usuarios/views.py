from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from .models import Fazenda
from backend.fazenda.serializers import FazendaSerializer
from backend.usuarios.serializers import UserSerializer



class FazendaViewSet(viewsets.ModelViewSet):
    queryset = Fazenda.objects.none()  
    serializer_class = FazendaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nome', 'localizacao']

    def get_queryset(self):
        return Fazenda.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.usuario != request.user:
            raise PermissionDenied("Acesso negado.")
        return super().retrieve(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Impede exclusão de fazendas de outros usuários."""
        instance = self.get_object()
        if instance.usuario != request.user:
            raise PermissionDenied("Você não pode excluir esta fazenda.")
        return super().destroy(request, *args, **kwargs)
    

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def create(self, request, *args, **kwargs):
        user = User.objects.create_user(
            username=request.data['username'],
            password=request.data['password'],
            email=request.data.get('email', ''),
        )
        return Response({"status": "Usuário criado com sucesso"})
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        return Response({"status": "Usuário excluído com sucesso"})