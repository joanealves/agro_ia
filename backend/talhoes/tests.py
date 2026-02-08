from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from backend.fazenda.models import Fazenda
from .models import Talhao

User = get_user_model()


class TalhaoModelTest(TestCase):
    """Testes do modelo Talhão"""
    
    def setUp(self):
        """Preparar dados para testes"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.fazenda = Fazenda.objects.create(
            nome='Fazenda Teste',
            latitude=-15.7942,
            longitude=-47.8822,
            localizacao='Brasília',
            usuario=self.user
        )
    
    def test_criar_talhao(self):
        """Teste criar um talhão"""
        talhao = Talhao.objects.create(
            fazenda=self.fazenda,
            nome='Talhão A',
            cultura='milho',
            area_hectares=50,
            status='ativo'
        )
        self.assertEqual(talhao.nome, 'Talhão A')
        self.assertEqual(talhao.cultura, 'milho')
        self.assertEqual(str(talhao), 'Talhão A (milho) - Fazenda Teste')


class TalhaoAPITest(APITestCase):
    """Testes da API de Talhões"""
    
    def setUp(self):
        """Preparar dados para testes"""
        self.client = APIClient()
        
        # Criar usuário
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Fazer login
        self.client.force_authenticate(user=self.user)
        
        # Criar fazenda
        self.fazenda = Fazenda.objects.create(
            nome='Fazenda Teste',
            latitude=-15.7942,
            longitude=-47.8822,
            localizacao='Brasília',
            usuario=self.user
        )
    
    def test_listar_talhoes(self):
        """Teste listar talhões"""
        # Criar alguns talhões
        Talhao.objects.create(
            fazenda=self.fazenda,
            nome='Talhão 1',
            cultura='milho',
            area_hectares=50
        )
        Talhao.objects.create(
            fazenda=self.fazenda,
            nome='Talhão 2',
            cultura='soja',
            area_hectares=30
        )
        
        # Fazer requisição
        response = self.client.get('/api/talhoes/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_criar_talhao(self):
        """Teste criar um talhão via API"""
        data = {
            'fazenda': self.fazenda.id,
            'nome': 'Novo Talhão',
            'cultura': 'soja',
            'area_hectares': 25.5,
            'status': 'ativo'
        }
        
        response = self.client.post('/api/talhoes/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nome'], 'Novo Talhão')
    
    def test_multi_tenancy(self):
        """Teste que usuário só vê seus talhões"""
        # Criar outro usuário e fazenda
        outro_user = User.objects.create_user(
            username='outrouser',
            email='outro@example.com',
            password='testpass123'
        )
        outra_fazenda = Fazenda.objects.create(
            nome='Outra Fazenda',
            latitude=0,
            longitude=0,
            localizacao='Outro Local',
            usuario=outro_user
        )
        
        # Criar talhões para ambas as fazendas
        Talhao.objects.create(
            fazenda=self.fazenda,
            nome='Meu Talhão',
            cultura='milho',
            area_hectares=50
        )
        Talhao.objects.create(
            fazenda=outra_fazenda,
            nome='Talhão do Outro',
            cultura='soja',
            area_hectares=30
        )
        
        # Fazer requisição com o primeiro usuário
        response = self.client.get('/api/talhoes/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['nome'], 'Meu Talhão')
