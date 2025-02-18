import os
import django
import random
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings

#  Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')


django.setup()

from django.contrib.auth.models import User
from backend.fazenda.models import Fazenda
from backend.dashboard.models import DadosClimaticos
from backend.maps.models import Mapa
from backend.notificacoes.models import Notificacao
from backend.pragas.models import Praga
from backend.produtividade.models import DadosProdutividade

def create_users():
    """Cria usuários de teste"""
    print("Criando usuários...")
    
    # Criar admin
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@exemplo.com',
            password='admin123'
        )
        print(f"Usuário admin criado com sucesso!")
    else:
        admin = User.objects.get(username='admin')
        print("Usuário admin já existe!")
    
    # Criar usuários regulares
    test_users = [
        {'username': 'joao', 'email': 'joao@exemplo.com', 'password': 'teste123', 'first_name': 'João', 'last_name': 'Silva'},
        {'username': 'maria', 'email': 'maria@exemplo.com', 'password': 'teste123', 'first_name': 'Maria', 'last_name': 'Santos'},
        {'username': 'carlos', 'email': 'carlos@exemplo.com', 'password': 'teste123', 'first_name': 'Carlos', 'last_name': 'Oliveira'},
        {'username': 'ana', 'email': 'ana@exemplo.com', 'password': 'teste123', 'first_name': 'Ana', 'last_name': 'Pereira'},
    ]
    
    created_users = [admin]
    for user_data in test_users:
        if not User.objects.filter(username=user_data['username']).exists():
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name']
            )
            created_users.append(user)
            print(f"Usuário {user_data['username']} criado com sucesso!")
        else:
            created_users.append(User.objects.get(username=user_data['username']))
            print(f"Usuário {user_data['username']} já existe!")
    
    return created_users

def create_fazendas(users):
    """Cria fazendas para cada usuário"""
    print("Criando fazendas...")
    
    # Regiões no Brasil
    regioes = [
        {'nome': 'Norte de Minas', 'lat_range': (-18.0, -14.0), 'long_range': (-44.0, -41.0)},
        {'nome': 'Oeste da Bahia', 'lat_range': (-13.0, -11.0), 'long_range': (-46.0, -44.0)},
        {'nome': 'Mato Grosso', 'lat_range': (-15.0, -10.0), 'long_range': (-56.0, -53.0)},
        {'nome': 'Paraná', 'lat_range': (-26.0, -23.0), 'long_range': (-53.0, -50.0)},
    ]
    
    fazendas = []
    for user in users:
        # 1-3 fazendas por usuário
        for i in range(random.randint(1, 3)):
            # Escolher uma região aleatória
            regiao = random.choice(regioes)
            
            # Gerar latitude e longitude dentro da região escolhida
            latitude = random.uniform(regiao['lat_range'][0], regiao['lat_range'][1])
            longitude = random.uniform(regiao['long_range'][0], regiao['long_range'][1])
            
            # Nome da fazenda
            nome = f"Fazenda {user.first_name or user.username} {i+1}"
            
            # Verificar se já existe
            if not Fazenda.objects.filter(nome=nome, usuario=user).exists():
                fazenda = Fazenda.objects.create(
                    usuario=user,
                    nome=nome,
                    latitude=latitude,
                    longitude=longitude,
                    localizacao=f"{regiao['nome']}"
                )
                fazendas.append(fazenda)
                print(f"Fazenda '{nome}' criada para {user.username}")
            else:
                fazenda = Fazenda.objects.get(nome=nome, usuario=user)
                fazendas.append(fazenda)
                print(f"Fazenda '{nome}' já existe para {user.username}")
    
    return fazendas

def create_dados_climaticos(fazendas):
    """Cria dados climáticos para cada fazenda"""
    print("Criando dados climáticos...")
    
    # Para cada fazenda, criar dados para os últimos 60 dias
    for fazenda in fazendas:
        for days_ago in range(60):
            # Verificar se já existem dados para esta data e fazenda
            data_coleta = timezone.now() - timedelta(days=days_ago)
            if DadosClimaticos.objects.filter(fazenda=fazenda, data_coleta__date=data_coleta.date()).exists():
                continue
            
            # Para cada região, definir faixas plausíveis de temperatura e precipitação
            if "Norte de Minas" in fazenda.localizacao:
                temperatura = random.uniform(20, 35)
                precipitacao = random.uniform(0, 15) if days_ago % 10 > 7 else 0  # Clima seco com chuvas ocasionais
            elif "Oeste da Bahia" in fazenda.localizacao:
                temperatura = random.uniform(22, 38)
                precipitacao = random.uniform(0, 20) if days_ago % 14 > 10 else 0  # Muito seco com chuvas raras
            elif "Mato Grosso" in fazenda.localizacao:
                temperatura = random.uniform(23, 36)
                precipitacao = random.uniform(0, 30) if days_ago % 7 > 4 else 0  # Chuvoso na estação
            else:  # Paraná
                temperatura = random.uniform(15, 30)
                precipitacao = random.uniform(0, 25) if days_ago % 5 > 2 else 0  # Mais chuvas frequentes
            
            # Umidade correlacionada com precipitação
            if precipitacao > 0:
                umidade = random.uniform(70, 95)
            else:
                umidade = random.uniform(40, 70)
            
            DadosClimaticos.objects.create(
                fazenda=fazenda,
                temperatura=temperatura,
                umidade=umidade,
                precipitacao=precipitacao,
                data_coleta=data_coleta
            )

def create_mapas(fazendas):
    """Cria mapas para cada fazenda"""
    print("Criando mapas...")
    
    for fazenda in fazendas:
        # Um mapa principal para cada fazenda
        if not Mapa.objects.filter(fazenda=fazenda, nome=f"Mapa Principal - {fazenda.nome}").exists():
            Mapa.objects.create(
                fazenda=fazenda,
                nome=f"Mapa Principal - {fazenda.nome}",
                latitude=fazenda.latitude,
                longitude=fazenda.longitude,
                zoom=12
            )
            print(f"Mapa principal criado para '{fazenda.nome}'")
        
        # Possibilidade de um mapa secundário para algumas fazendas
        if random.choice([True, False]) and not Mapa.objects.filter(fazenda=fazenda, nome=f"Mapa Satélite - {fazenda.nome}").exists():
            Mapa.objects.create(
                fazenda=fazenda,
                nome=f"Mapa Satélite - {fazenda.nome}",
                latitude=fazenda.latitude + random.uniform(-0.05, 0.05),
                longitude=fazenda.longitude + random.uniform(-0.05, 0.05),
                zoom=14
            )
            print(f"Mapa satélite criado para '{fazenda.nome}'")

def create_notificacoes(users):
    """Cria notificações para cada usuário"""
    print("Criando notificações...")
    
    tipos_msg = [
        {'titulo': 'Alerta: Previsão de geada', 'corpo': 'Previsão de geada para os próximos dias. Proteja suas culturas.'},
        {'titulo': 'Infestação detectada', 'corpo': 'Sistema detectou possível infestação de pragas na fazenda.'},
        {'titulo': 'Relatório semanal', 'corpo': 'O relatório semanal está disponível para visualização.'},
        {'titulo': 'Baixa umidade do solo', 'corpo': 'Sensores indicam baixa umidade no setor leste da fazenda.'},
        {'titulo': 'Atualização do sistema', 'corpo': 'Nova atualização disponível para o aplicativo. Atualize para obter as últimas funcionalidades.'},
    ]
    
    for user in users:
        # 3-7 notificações por usuário
        for _ in range(random.randint(3, 7)):
            tipo = random.choice(['email', 'whatsapp'])
            msg = random.choice(tipos_msg)
            mensagem = f"{msg['titulo']} - {msg['corpo']}"
            enviada_em = timezone.now() - timedelta(days=random.randint(0, 30))
            lida = random.choice([True, False])
            
            Notificacao.objects.create(
                usuario=user,
                mensagem=mensagem,
                tipo=tipo,
                enviada_em=enviada_em,
                lida=lida
            )
        print(f"Notificações criadas para {user.username}")

def create_pragas(fazendas, users):
    """Cria registros de pragas para cada fazenda"""
    print("Criando registros de pragas...")
    
    pragas_info = [
        {'nome': 'Lagarta-do-cartucho', 'descricao': 'Ataca principalmente o milho, causando danos às folhas e ao cartucho da planta.'},
        {'nome': 'Pulgão-verde', 'descricao': 'Praga comum em diversas culturas, causa danos por sucção de seiva e transmissão de viroses.'},
        {'nome': 'Mosca-branca', 'descricao': 'Praga polífaga que ataca diversas culturas, transmitindo viroses e causando danos diretos.'},
        {'nome': 'Percevejo-marrom', 'descricao': 'Ataca principalmente a soja, causando danos às vagens e grãos.'},
        {'nome': 'Ferrugem-asiática', 'descricao': 'Doença fúngica que ataca principalmente a soja, causando desfolha prematura.'},
        {'nome': 'Bicho-mineiro', 'descricao': 'Praga do cafeeiro que causa galerias nas folhas, reduzindo a área fotossintética.'},
        {'nome': 'Broca-do-café', 'descricao': 'Inseto que perfura os frutos do café, causando queda e perda de qualidade.'},
    ]
    
    for fazenda in fazendas:
        # 50% de chance de ter pragas
        if random.choice([True, False]):
            # 1-3 pragas por fazenda
            for _ in range(random.randint(1, 3)):
                praga_info = random.choice(pragas_info)
                status = random.choice(['pendente', 'resolvido'])
                data_criacao = timezone.now() - timedelta(days=random.randint(1, 60))
                
                if not Praga.objects.filter(fazenda=fazenda, nome=praga_info['nome']).exists():
                    Praga.objects.create(
                        fazenda=fazenda,
                        usuario=fazenda.usuario,
                        nome=praga_info['nome'],
                        descricao=praga_info['descricao'],
                        imagem='pragas/placeholder.jpg',  # Placeholder
                        data_criacao=data_criacao,
                        status=status
                    )
                    print(f"Praga '{praga_info['nome']}' registrada para {fazenda.nome}")

def create_dados_produtividade(fazendas):
    """Cria dados de produtividade para cada fazenda"""
    print("Criando dados de produtividade...")
    
    culturas_info = {
        'Soja': {'area_range': (100, 500), 'prod_range': (2500, 3800)},
        'Milho': {'area_range': (80, 400), 'prod_range': (5000, 12000)},
        'Café': {'area_range': (20, 150), 'prod_range': (1500, 2500)},
        'Cana-de-açúcar': {'area_range': (200, 800), 'prod_range': (70000, 120000)},
        'Algodão': {'area_range': (50, 300), 'prod_range': (3000, 5000)},
        'Feijão': {'area_range': (30, 150), 'prod_range': (1000, 2500)},
        'Trigo': {'area_range': (100, 400), 'prod_range': (2000, 6000)},
    }
    
    for fazenda in fazendas:
        # Selecionar 2-4 culturas aleatórias para cada fazenda
        culturas_fazenda = random.sample(list(culturas_info.keys()), random.randint(2, 4))
        
        # Para cada cultura, criar registros históricos (últimos 2 anos por trimestre)
        for cultura in culturas_fazenda:
            info = culturas_info[cultura]
            
            # Área base para esta cultura nesta fazenda
            area_base = random.uniform(info['area_range'][0], info['area_range'][1])
            
            # Criar registros trimestrais para os últimos 2 anos
            for quarter in range(8):
                # Variação na área ao longo do tempo (pequena)
                area = area_base * random.uniform(0.9, 1.1)
                
                # Produtividade com variação sazonal
                if quarter % 4 in [0, 1]:  # Primeiras safras tendem a ser melhores
                    produtividade = random.uniform(info['prod_range'][0] * 0.9, info['prod_range'][1])
                else:
                    produtividade = random.uniform(info['prod_range'][0], info['prod_range'][1] * 0.8)
                
                data = timezone.now() - timedelta(days=90*quarter + random.randint(0, 89))
                
                DadosProdutividade.objects.create(
                    fazenda=fazenda,
                    cultura=cultura,
                    area=area,
                    produtividade=produtividade,
                    data=data
                )
            
            print(f"Dados de produtividade para '{cultura}' criados na fazenda '{fazenda.nome}'")

def main():
    print("Iniciando criação de dados de teste...")
    
    # Criar usuários
    users = create_users()
    
    # Criar fazendas
    fazendas = create_fazendas(users)
    
    # Criar dados relacionados
    create_dados_climaticos(fazendas)
    create_mapas(fazendas)
    create_notificacoes(users)
    create_pragas(fazendas, users)
    create_dados_produtividade(fazendas)
    
    print("\n--- RESUMO ---")
    print(f"Usuários criados: {User.objects.count()}")
    print(f"Fazendas criadas: {Fazenda.objects.count()}")
    print(f"Registros climáticos: {DadosClimaticos.objects.count()}")
    print(f"Mapas criados: {Mapa.objects.count()}")
    print(f"Notificações: {Notificacao.objects.count()}")
    print(f"Registros de pragas: {Praga.objects.count()}")
    print(f"Dados de produtividade: {DadosProdutividade.objects.count()}")
    
    print("\n--- CREDENCIAIS PARA LOGIN ---")
    print("Admin: admin@exemplo.com / admin123")
    print("Usuários regulares (todos com senha 'teste123'):")
    for user in User.objects.filter(is_superuser=False):
        print(f"  - {user.email}")

if __name__ == '__main__':
    main()