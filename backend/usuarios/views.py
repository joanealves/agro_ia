from rest_framework import viewsets, permissions
from rest_framework.response import Response
from backend.custom_auth.models import CustomUser  
from backend.usuarios.serializers import CustomUserSerializer  

# ⚠️ FazendaViewSet foi movido para backend.fazenda.views
# Importe de lá se precisar

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all() 
    serializer_class = CustomUserSerializer  
    permission_classes = [permissions.IsAdminUser]

    def create(self, request, *args, **kwargs):
        user = CustomUser.objects.create_user(
            username=request.data['username'],
            password=request.data['password'],
            email=request.data.get('email', ''),
        )
        return Response({"status": "Usuário criado com sucesso"})
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        return Response({"status": "Usuário excluído com sucesso"})
