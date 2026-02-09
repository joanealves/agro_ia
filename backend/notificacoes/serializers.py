from rest_framework import serializers
from .models import Notificacao


class NotificacaoSerializer(serializers.ModelSerializer):
    """Serializer completo para notificação"""
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    dias_atras = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Notificacao
        fields = [
            'id',
            'usuario',
            'usuario_nome',
            'titulo',
            'mensagem',
            'tipo',
            'categoria',
            'prioridade',
            'lida',
            'data_leitura',
            'arquivada',
            'acao_requerida',
            'link',
            'fazenda_id',
            'talhao_id',
            'praga_id',
            'irrigacao_id',
            'data_criacao',
            'data_atualizacao',
            'dias_atras',
        ]
        read_only_fields = [
            'usuario',
            'data_criacao',
            'data_atualizacao',
            'dias_atras',
        ]

    def get_dias_atras(self, obj):
        """Retorna tempo relativo da criação"""
        from django.utils import timezone
        delta = timezone.now() - obj.data_criacao
        days = delta.days
        if days == 0:
            hours = delta.seconds // 3600
            if hours == 0:
                mins = delta.seconds // 60
                return f"{mins}m" if mins > 0 else "agora"
            return f"{hours}h"
        elif days == 1:
            return "ontem"
        else:
            return f"{days}d"


class NotificacaoListSerializer(serializers.ModelSerializer):
    """Serializer resumido para listagem"""
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    dias_atras = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Notificacao
        fields = [
            'id',
            'usuario_nome',
            'titulo',
            'mensagem',
            'tipo',
            'categoria',
            'prioridade',
            'lida',
            'acao_requerida',
            'link',
            'data_criacao',
            'dias_atras',
        ]

    def get_dias_atras(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.data_criacao
        days = delta.days
        if days == 0:
            hours = delta.seconds // 3600
            return f"{hours}h" if hours > 0 else "agora"
        return f"{days}d"