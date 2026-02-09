"""
Celery Tasks para clima - Open-Meteo
Executa updates automáticos de dados climáticos
"""

from celery import shared_task
import logging
from django.utils import timezone
from .models import DadosClimaticos
from .services import OpenMeteoService
from backend.fazenda.models import Fazenda

logger = logging.getLogger(__name__)


@shared_task(name='irrigacao.fetch_weather_all_fazendas')
def fetch_weather_all_fazendas():
    """
    Task que roda a cada 6h via Celery Beat.
    Busca clima para TODAS as fazendas via Open-Meteo (gratuito).
    
    Configure em settings.py CELERY_BEAT_SCHEDULE:
    
    'update-weather-every-6h': {
        'task': 'irrigacao.fetch_weather_all_fazendas',
        'schedule': crontab(minute=0, hour='*/6'),  # 0, 6, 12, 18
    }
    """
    
    logger.info("🌡️ Iniciando atualização climática de todas as fazendas...")
    
    fazendas = Fazenda.objects.all()
    sucesso = 0
    erro = 0
    
    for fazenda in fazendas:
        try:
            # Buscar dados reais da Open-Meteo (sem API key!)
            dados = OpenMeteoService.fetch_and_parse(
                latitude=float(fazenda.latitude),
                longitude=float(fazenda.longitude)
            )
            
            if dados:
                # Salvar no banco de dados
                DadosClimaticos.objects.create(
                    fazenda=fazenda,
                    temperatura=dados.get('temperatura_atual', 0),
                    umidade=dados.get('umidade_atual', 0),
                    precipitacao=dados.get('chuva_hoje', 0),
                    velocidade_vento=dados.get('vento_atual', 0),
                    e_previsao=False,
                    data_coleta=timezone.now(),
                )
                sucesso += 1
                logger.info(f"✓ {fazenda.nome}: {dados['temperatura_atual']}°C")
            else:
                erro += 1
                logger.warning(f"✗ Erro ao buscar clima para {fazenda.nome}")
                
        except Exception as e:
            erro += 1
            logger.error(f"❌ {fazenda.nome}: {str(e)}")
    
    logger.info(f"✅ Clima: {sucesso} OK, {erro} ERROS")
    return {'sucesso': sucesso, 'erros': erro}


@shared_task(name='irrigacao.fetch_weather_fazenda')
def fetch_weather_fazenda(fazenda_id):
    """
    Task para atualizar clima de uma fazenda específica.
    Chamado sob demanda (no-delay).
    
    Uso em Views:
    from backend.irrigacao.tasks import fetch_weather_fazenda
    fetch_weather_fazenda.delay(fazenda_id=1)
    """
    
    try:
        fazenda = Fazenda.objects.get(id=fazenda_id)
        
        dados = OpenMeteoService.fetch_and_parse(
            latitude=float(fazenda.latitude),
            longitude=float(fazenda.longitude)
        )
        
        if dados:
            DadosClimaticos.objects.create(
                fazenda=fazenda,
                temperatura=dados.get('temperatura_atual', 0),
                umidade=dados.get('umidade_atual', 0),
                precipitacao=dados.get('chuva_hoje', 0),
                velocidade_vento=dados.get('vento_atual', 0),
                e_previsao=False,
                data_coleta=timezone.now(),
            )
            logger.info(f"✓ {fazenda.nome} atualizado")
            return {'status': 'sucesso', 'temp': dados.get('temperatura_atual')}
        else:
            return {'status': 'erro_api'}
            
    except Fazenda.DoesNotExist:
        return {'status': 'fazenda_nao_encontrada'}
    except Exception as e:
        logger.error(f"Erro: {str(e)}")
        return {'status': 'erro', 'detalhe': str(e)}