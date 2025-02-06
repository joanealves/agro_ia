schema_view = get_schema_view(
    openapi.Info(
        title="Agro API",
        default_version='v1',
        description="API para gestão agrícola",
    ),
    public=True,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API Endpoints
    path('api/auth/', include([
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    ])),
    
    path('api/usuarios/', include('backend.usuarios.urls')),
    path('api/pragas/', include('backend.pragas.urls')),
    path('api/irrigacao/', include('backend.irrigacao.urls')),
    path('api/dashboard/', include('backend.dashboard.urls')),
    
    # Redirects para evitar erros
    path('api/pragas', RedirectView.as_view(url='/api/pragas/')),
    path('api/irrigacao', RedirectView.as_view(url='/api/irrigacao/')),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)