# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import NotificacaoViewSet

# router = DefaultRouter()
# router.register(r'notificacoes', NotificacaoViewSet)

# urlpatterns = [
#     path('', include(router.urls)),
# ]












from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.NotificacaoViewSet, basename='notificacao')

urlpatterns = router.urls