from django.urls import path
from .views import CustomTokenObtainPairView, CustomTokenRefreshView, CustomUserView, CustomLogoutView, RegisterView

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CustomUserView.as_view(), name='user_detail'),
    path('logout/', CustomLogoutView.as_view(), name='auth_logout'),
    path('register/', RegisterView.as_view(), name='auth_register'),
]