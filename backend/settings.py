from pathlib import Path
from datetime import timedelta
import os
import sys
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# 🔥 FORÇA o carregamento do .env da raiz do projeto
load_dotenv(BASE_DIR / ".env")

# (se quiser manter)
sys.path.append(str(BASE_DIR))


print(">>> DB_USER =", os.getenv("DB_USER"))
print(">>> DB_PASSWORD existe?", bool(os.getenv("DB_PASSWORD")))
print(">>> ENV FILE PATH =", os.getcwd())

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# SECURITY WARNING: keep the secret key used in production secret!
# 🔒 Agora vem do .env
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-wvk$skw1@2j_f2xj6t1o__9toa^4^nw=2yw9rof(gcsp^8&bc(')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

# ✅ CORRIGIDO: Agora aceita hosts do .env
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Configuração de arquivos de mídia
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # ✅ Adicionar para blacklist funcionar
    'corsheaders',
    'backend.custom_auth',
    'backend.usuarios',
    'backend.pragas',
    'backend.irrigacao',
    'backend.dashboard',
    'backend.produtividade',
    'backend.notificacoes',
    'backend.maps',
    'backend.fazenda',
]

# ✅ IMPORTANTE: Definir modelo de usuário customizado
AUTH_USER_MODEL = 'custom_auth.CustomUser'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'
ASGI_APPLICATION = 'backend.asgi.application'

# DATABASE
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "postgres"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT", "6543"), 
        "OPTIONS": {
            "sslmode": "require",
            "connect_timeout": 10,
        },
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ======================================================================
# 🔧 CONFIGURAÇÃO DO CORS - CORRIGIDA
# ======================================================================

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS', 
    'http://localhost:3000'
).split(',')

# Para desenvolvimento, permitir todos os métodos
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = False  # Manter False por segurança
    CORS_ALLOWED_ORIGINS.extend([
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ])

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ======================================================================
# 🔐 CONFIGURAÇÃO DO JWT - CORRIGIDA PARA DESENVOLVIMENTO
# ======================================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=int(os.getenv('JWT_ACCESS_LIFETIME_HOURS', 1))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_LIFETIME_DAYS', 7))),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_COOKIE': 'access_token',  # ✅ Mudado de 'access' para 'access_token'
    'AUTH_COOKIE_REFRESH': 'refresh_token',  # ✅ Mudado de 'refresh' para 'refresh_token'
    
    # 🔥 CORREÇÃO CRÍTICA DO LOGIN
    # Em desenvolvimento (DEBUG=True), usar secure=False
    # Em produção (DEBUG=False), usar secure=True
    'AUTH_COOKIE_SECURE': not DEBUG,  # ✅ CORRIGIDO: False em dev, True em prod
    
    # 'AUTH_COOKIE_HTTP_ONLY': True,  # Manter sempre True por segurança
    'AUTH_COOKIE_HTTP_ONLY': False,  # Manter sempre True por segurança
    'AUTH_COOKIE_PATH': '/',
    'AUTH_COOKIE_SAMESITE': 'Lax',  # 'Lax' para permitir cookies entre localhost:3000 e localhost:8000
    'AUTH_COOKIE_DOMAIN': None,  # None para funcionar em localhost
}

# ======================================================================
# 🔄 CELERY CONFIGURATION (se estiver usando)
# ======================================================================

if os.getenv('REDIS_URL'):
    CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CELERY_ACCEPT_CONTENT = ['json']
    CELERY_TASK_SERIALIZER = 'json'
    CELERY_RESULT_SERIALIZER = 'json'
    CELERY_TIMEZONE = TIME_ZONE

# ======================================================================
# 🔒 CONFIGURAÇÕES DE SEGURANÇA ADICIONAIS PARA PRODUÇÃO
# ======================================================================

if not DEBUG:
    # HTTPS settings
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    
    # HSTS settings
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# ======================================================================
# 📝 LOGGING PARA DEBUG
# ======================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
    },
}