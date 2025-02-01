from django.urls import path
from django.views.generic import RedirectView
from .views import UploadPragaView, ListPragasView

urlpatterns = [
    path('', RedirectView.as_view(url='list/')),  
    path('upload/', UploadPragaView.as_view(), name='upload-praga'),
    path('list/', ListPragasView.as_view(), name='list-pragas'),
]