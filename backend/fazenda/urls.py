from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FazendaViewSet

router = DefaultRouter()
router.register(r'fazendas', FazendaViewSet, basename='fazenda')

urlpatterns = [
    path('', include(router.urls)),
]
