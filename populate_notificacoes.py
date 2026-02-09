#!/usr/bin/env python
import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from backend.notificacoes.models import Notificacao
from backend.notificacoes.utils import (
    criar_notificacao,
    notificar_praga_critica,
    notificar_irrigacao_urgente,
)

User = get_user_model()

def populate_notificacoes():
    """Popula notificacoes de teste"""
    user = User.objects.first()
    if not user:
        print("No user found")
        return
    
    # Limpar notificacoes existentes
    Notificacao.objects.all().delete()
    
    print(f"User: {user.username}")
    print("Creating test notifications...")
    
    # 1. Notificacao de praga critica
    criar_notificacao(
        usuario=user,
        titulo="Praga Critica Detectada: Broca-do-Tronco",
        mensagem="Nivel CRITICO detectado no Talhao 1. Acao imediata recomendada para evitar perda total.",
        tipo='critico',
        categoria='praga',
        prioridade=2,
        acao_requerida=True,
        link='/dashboard/pragas',
    )
    print("  [1] Praga critica")
    
    # 2. Notificacao de irrigacao urgente
    criar_notificacao(
        usuario=user,
        titulo="Irrigacao Urgente Necessaria",
        mensagem="Temperatura > 28C + Umidade < 40%. Sistema recomenda irrigacao URGENTE hoje.",
        tipo='alerta',
        categoria='irrigacao',
        prioridade=1,
        acao_requerida=True,
        link='/dashboard/irrigacao',
    )
    print("  [2] Irrigacao urgente")
    
    # 3. Notificacao de produtividade
    criar_notificacao(
        usuario=user,
        titulo="Alerta de Produtividade",
        mensagem="Possivel queda de rendimento no Talhao 2. Rendimento 15% abaixo da media historica.",
        tipo='alerta',
        categoria='produtividade',
        prioridade=1,
        acao_requerida=False,
        link='/dashboard/produtividade',
    )
    print("  [3] Alerta produtividade")
    
    # 4. Notificacao de success (lida)
    notif = criar_notificacao(
        usuario=user,
        titulo="Tarefa Concluida com Sucesso",
        mensagem="Registro de pragas para o Talhao 1 foi salvo com sucesso.",
        tipo='sucesso',
        categoria='sistema',
        prioridade=0,
        acao_requerida=False,
    )
    notif.lida = True
    notif.save()
    print("  [4] Sucesso (lida)")
    
    # 5. Notificacao de info (lida e antiga)
    notif = criar_notificacao(
        usuario=user,
        titulo="Atualizacao de Sistema",
        mensagem="Sistema foi atualizado com novos relatorios de clima.",
        tipo='info',
        categoria='sistema',
        prioridade=0,
        acao_requerida=False,
    )
    notif.lida = True
    notif.data_criacao = datetime.now() - timedelta(days=2)
    notif.save()
    print("  [5] Info (lida e antiga)")
    
    # 6. Notificacao de clima
    criar_notificacao(
        usuario=user,
        titulo="Aviso de Tempo Chuvoso",
        mensagem="Previsao de chuva forte nos proximos 2 dias. Recomenda-se pausar aplicacoes.",
        tipo='alerta',
        categoria='clima',
        prioridade=1,
        acao_requerida=True,
        link='/dashboard/clima',
    )
    print("  [6] Aviso clima")
    
    total = Notificacao.objects.count()
    nao_lidas = Notificacao.objects.filter(lida=False).count()
    
    print(f"\nTotal: {total} notificacoes")
    print(f"Nao lidas: {nao_lidas}")
    print("\nNotifications populated successfully!")

if __name__ == '__main__':
    populate_notificacoes()
