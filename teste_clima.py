#!/usr/bin/env python
"""Teste rápido do OpenMeteoService"""

import sys
import os

# Adicionar backend ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from irrigacao.services import OpenMeteoService

try:
    print("🌍 Testando Open-Meteo API...")
    print("=" * 50)
    
    # Brasília coordinates
    dados = OpenMeteoService.fetch_and_parse(
        latitude=-15.7942,
        longitude=-47.8822
    )
    
    print("✅ CLIMA OBTIDO COM SUCESSO!\n")
    print(f"Temperatura Atual: {dados.get('temperatura_atual')}°C")
    print(f"Umidade Atual: {dados.get('umidade_atual')}%")
    print(f"Vento: {dados.get('vento_atual')} km/h")
    print(f"Chuva Hoje: {dados.get('chuva_hoje')} mm")
    print(f"Previsão: {len(dados.get('previsao_7_dias', []))} dias")
    print(f"Atualizado em: {dados.get('atualizado_em')}")
    print("\n" + "=" * 50)
    print("✅ API Open-Meteo FUNCIONANDO!")
    
except Exception as e:
    print(f"❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
