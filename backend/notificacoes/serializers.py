# ================================================================================
# AGROIA - SERIALIZERS NOTIFICAÇÕES
# ================================================================================
# Arquivo: backend/notificacoes/serializers.py
# ================================================================================

from rest_framework import serializers
from .models import Notificacao


class NotificacaoSerializer(serializers.ModelSerializer):
    """Serializer completo para notificação"""
    
    class Meta:
        model = Notificacao
        fields = [
            'id', 'usuario_id', 'titulo', 'mensagem',
            'tipo', 'categoria', 'prioridade',
            'lida', 'data_leitura', 'arquivada',
            'link', 'acao_requerida',
            'fazenda_id', 'talhao_id', 'created_at'
        ]
        read_only_fields = ['id', 'usuario_id', 'created_at']


class NotificacaoListSerializer(serializers.ModelSerializer):
    """Serializer resumido para listagem"""
    
    class Meta:
        model = Notificacao
        fields = [
            'id', 'titulo', 'tipo', 'categoria',
            'lida', 'prioridade', 'created_at'
        ]