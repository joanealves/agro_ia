import os
from celery import Celery

# Define o módulo de configurações do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Cria uma instância do Celery
app = Celery('backend')

# Configura o Celery usando as configurações do Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Descobre e registra automaticamente as tarefas do Celery nos apps do Django
app.autodiscover_tasks()