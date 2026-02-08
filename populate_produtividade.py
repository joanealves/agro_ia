#!/usr/bin/env python
import os
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from backend.fazenda.models import Fazenda
from backend.talhoes.models import Talhao
from backend.produtividade.models import DadosProdutividade

User = get_user_model()

def populate_produtividade():
    """Popula dados de produtividade para testes"""
    
    # Obter user e fazenda
    user = User.objects.first()
    if not user:
        print(" Nenhum usurio encontrado")
        return
    
    fazendas = Fazenda.objects.filter(usuario=user)
    if not fazendas.exists():
        print(" Nenhuma fazenda encontrada para o usurio")
        return
    
    print(f"User: {user.username}")
    print(f"Available Farms: {fazendas.count()}")
    
    # Culturas de exemplo
    culturas = ['Milho', 'Soja', 'Trigo', 'Arroz', 'Feijo']
    status_choices = ['planejado', 'em_cultivo', 'colhido', 'perdido']
    
    # Para cada fazenda
    for fazenda in fazendas[:2]:  # Limitar a 2 fazendas
        print(f"\n Fazenda: {fazenda.nome}")
        
        # Obter ou criar talhes da fazenda
        talhoes = Talhao.objects.filter(fazenda=fazenda)
        if not talhoes.exists():
            print("   Criando talhes de exemplo...")
            for j in range(3):
                Talhao.objects.create(
                    fazenda=fazenda,
                    nome=f"Talho {j+1}",
                    cultura=culturas[j],
                    area_hectares=random.uniform(10, 30),
                    status='ativo',
                    geometria={"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]}
                )
            talhoes = Talhao.objects.filter(fazenda=fazenda)
        if not talhoes.exists():
            print("   Nenhum talho encontrado")
            continue
        
        print(f"   Talhes: {talhoes.count()}")
        
        # Para cada talho
        for talhao in talhoes[:3]:  # Limitar a 3 talhes por fazenda
            print(f"\n     Talho: {talhao.nome}")
            
            # Criar mltiplos registros de produtividade
            for i in range(1, 6):  # 5 registros por talho
                data_plantio = datetime.now().date() - timedelta(days=300 - (i * 50))
                data_colheita = data_plantio + timedelta(days=random.randint(90, 150))
                
                # Dados aleatrios mas realistas
                cultura = culturas[random.randint(0, len(culturas) - 1)]
                area = float(talhao.area_hectares or random.uniform(5, 20))
                peso_colhido = area * random.uniform(4000, 8000)  # kg
                rendimento = peso_colhido / area
                preco = Decimal(str(random.uniform(3.0, 6.0)))  # R$ por kg
                receita = Decimal(str(peso_colhido)) * preco
                custo = receita * Decimal(str(random.uniform(0.4, 0.6)))  # 40-60% do receita
                lucro = receita - custo
                
                try:
                    DadosProdutividade.objects.create(
                        usuario=user,
                        fazenda=fazenda,
                        talhao=talhao,
                        cultura=cultura,
                        area_hectares=area,
                        status=status_choices[random.randint(0, 3)],
                        data_plantio=data_plantio,
                        data_colheita=data_colheita,
                        peso_colhido_kg=peso_colhido,
                        preco_kg=preco,
                        custo_total=custo,
                    )
                    print(f"       Registro {i}: {cultura} - {rendimento:.0f} kg/ha")
                except Exception as e:
                    print(f"       Erro: {str(e)}")
    
    print("\n Populao de dados concluda!")

if __name__ == '__main__':
    populate_produtividade()
