"""
Utilitários para criar notificações no sistema
"""
from backend.notificacoes.models import Notificacao
from django.contrib.auth import get_user_model

User = get_user_model()


def criar_notificacao(
    usuario,
    titulo: str,
    mensagem: str,
    tipo: str = 'info',
    categoria: str = 'sistema',
    prioridade: int = 0,
    acao_requerida: bool = False,
    link: str = None,
    fazenda_id: int = None,
    talhao_id: int = None,
    praga_id: int = None,
    irrigacao_id: int = None,
):
    """
    Cria uma notificação no banco de dados.
    
    Args:
        usuario: User instance or user ID
        titulo: Título curto da notificação
        mensagem: Mensagem detalhada (opcional)
        tipo: 'info', 'alerta', 'critico', 'sucesso', 'erro'
        categoria: 'clima', 'praga', 'irrigacao', 'produtividade', etc
        prioridade: 0=normal, 1=alta, 2=urgente
        acao_requerida: Se requer ação do usuário
        link: Link para o recurso relacionado
        fazenda_id: ID da fazenda relacionada
        talhao_id: ID do talhão relacionado
        praga_id: ID da praga relacionada
        irrigacao_id: ID do sistema de irrigação relacionado
    """
    if isinstance(usuario, int):
        usuario = User.objects.get(id=usuario)
    
    return Notificacao.objects.create(
        usuario=usuario,
        titulo=titulo,
        mensagem=mensagem,
        tipo=tipo,
        categoria=categoria,
        prioridade=prioridade,
        acao_requerida=acao_requerida,
        link=link,
        fazenda_id=fazenda_id,
        talhao_id=talhao_id,
        praga_id=praga_id,
        irrigacao_id=irrigacao_id,
    )


def notificar_praga_critica(usuario, praga):
    """Notifica sobre uma praga em nível crítico"""
    return criar_notificacao(
        usuario=usuario,
        titulo=f"Praga crítica detectada: {praga.nome}",
        mensagem=f"Uma praga em nível CRÍTICO foi registrada no talhão. Ação imediata recomendada.",
        tipo='critico',
        categoria='praga',
        prioridade=2,
        acao_requerida=True,
        link=f"/dashboard/pragas/{praga.id}",
        praga_id=praga.id,
    )


def notificar_irrigacao_urgente(usuario, irrigacao, recomendacao):
    """Notifica sobre necessidade urgente de irrigação"""
    return criar_notificacao(
        usuario=usuario,
        titulo=f"Irrigação urgente: {irrigacao.nome}",
        mensagem=f"Sistema recomenda irrigação URGENTE. {recomendacao}",
        tipo='alerta',
        categoria='irrigacao',
        prioridade=1,
        acao_requerida=True,
        link=f"/dashboard/irrigacao",
        irrigacao_id=irrigacao.id,
    )


def notificar_produtividade_alerta(usuario, talhao, alerta):
    """Notifica sobre alerta de produtividade"""
    return criar_notificacao(
        usuario=usuario,
        titulo=f"Alerta de produtividade: {talhao.nome}",
        mensagem=f"Possível redução de produtividade detectada. {alerta}",
        tipo='alerta',
        categoria='produtividade',
        prioridade=1,
        acao_requerida=False,
        link=f"/dashboard/produtividade",
        talhao_id=talhao.id,
    )


def notificar_clima_extremo(usuario, fazenda, alerta):
    """Notifica sobre condições climáticas extremas"""
    return criar_notificacao(
        usuario=usuario,
        titulo=f"Alerta climático: {alerta['tipo']}",
        mensagem=alerta['descricao'],
        tipo='alerta',
        categoria='clima',
        prioridade=1,
        acao_requerida=True,
        link=f"/dashboard/clima",
        fazenda_id=fazenda.id,
    )
