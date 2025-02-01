from rest_framework.test import APITestCase
from rest_framework import status
from .models import Praga

class PragaTests(APITestCase):
    def test_create_praga(self):
        data = {
            "nome": "Lagarta",
            "descricao": "Lagarta que ataca milho",
        }
        response = self.client.post('/upload/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Praga.objects.count(), 1)
        self.assertEqual(Praga.objects.get().nome, "Lagarta")
