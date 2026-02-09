"""
Service para integração com Open-Meteo API
Fornece dados climáticos reais gratuitamente
"""

import requests
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from decimal import Decimal

logger = logging.getLogger(__name__)

class OpenMeteoService:
    """
    Client para Open-Meteo Free Weather API
    https://open-meteo.com/en/docs
    
    Sem necessidade de API key!
    """
    
    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    
    @staticmethod
    def fetch_weather(latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        """
        Busca dados climáticos para coordenadas (lat, lon)
        
        Args:
            latitude: Latitude da fazenda
            longitude: Longitude da fazenda
            
        Returns:
            Dict com dados climáticos ou None se erro
        """
        try:
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation",
                "hourly": "temperature_2m,relative_humidity_2m,precipitation,weather_code",
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
                "forecast_days": 7,
                "timezone": "America/Sao_Paulo",
            }
            
            response = requests.get(OpenMeteoService.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            logger.error(f"Erro ao buscar clima Open-Meteo: {e}")
            return None
    
    @staticmethod
    def parse_weather(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transforma resposta da API em formato útil
        
        Returns:
            {
                'temperatura_atual': 25.5,
                'umidade_atual': 60,
                'vento_atual': 10,
                'chuva_hoje': 0,
                'previsao_7_dias': [...],
                'atualizado_em': datetime
            }
        """
        if not data:
            return {}
        
        current = data.get('current', {})
        daily = data.get('daily', {})
        
        # Primeira data do array daily
        temps_max = daily.get('temperature_2m_max', [])
        temps_min = daily.get('temperature_2m_min', [])
        precip = daily.get('precipitation_sum', [])
        
        previsao = []
        for i in range(min(7, len(daily.get('time', [])))):
            previsao.append({
                'data': daily['time'][i],
                'temp_max': temps_max[i] if i < len(temps_max) else None,
                'temp_min': temps_min[i] if i < len(temps_min) else None,
                'chuva': precip[i] if i < len(precip) else None,
            })
        
        return {
            'temperatura_atual': current.get('temperature_2m'),
            'umidade_atual': current.get('relative_humidity_2m'),
            'vento_atual': current.get('wind_speed_10m'),
            'chuva_hoje': current.get('precipitation', 0) or (precip[0] if precip else 0),
            'previsao_7_dias': previsao,
            'atualizado_em': datetime.now(),
        }
    
    @staticmethod
    def fetch_and_parse(latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        """Conveniência: busca + parse em uma chamada"""
        raw_data = OpenMeteoService.fetch_weather(latitude, longitude)
        if raw_data:
            return OpenMeteoService.parse_weather(raw_data)
        return None
