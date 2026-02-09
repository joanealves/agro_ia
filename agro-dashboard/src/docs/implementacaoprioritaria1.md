# 🔧 GUIA TÉCNICO DE IMPLEMENTAÇÃO PRIORITÁRIA

> **Para:** Time de Desenvolvimento  
> **Objetivo:** Código pronto para implementar as funcionalidades mais impactantes  
> **Prioridade:** Alta (implementar nas próximas 2 semanas)

---

## 🎯 TOP 10 FUNCIONALIDADES PRIORITÁRIAS

### 1. 🛰️ NDVI BÁSICO (Sentinel-2)

**Impacto:** ALTO | **Esforço:** MÉDIO | **Dias:** 3-4

#### Backend: Service de NDVI

```python
# backend/satellite/services.py
import requests
from datetime import datetime, timedelta
import numpy as np
from PIL import Image
import io

class SentinelService:
    """
    Integração com Sentinel Hub para NDVI
    FREE: 30.000 requests/mês
    """
    
    BASE_URL = "https://services.sentinel-hub.com"
    
    @staticmethod
    def get_ndvi_image(latitude, longitude, width_km=2, height_km=2, date=None):
        """
        Busca imagem NDVI de área específica
        
        Args:
            latitude: -15.789
            longitude: -47.882
            width_km: largura em km
            height_km: altura em km
            date: 'YYYY-MM-DD' ou None (mais recente)
        
        Returns:
            {
                'image_url': str,
                'ndvi_mean': float,
                'date': str,
                'cloud_coverage': float
            }
        """
        if date is None:
            date = (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
        
        # Calcular bbox (aproximação simples)
        lat_offset = width_km / 111.0  # 1 grau ≈ 111km
        lon_offset = height_km / (111.0 * np.cos(np.radians(latitude)))
        
        bbox = [
            longitude - lon_offset/2,
            latitude - lat_offset/2,
            longitude + lon_offset/2,
            latitude + lat_offset/2
        ]
        
        # Request para Sentinel Hub
        evalscript = """
        //VERSION=3
        function setup() {
          return {
            input: ["B04", "B08"],
            output: { bands: 3 }
          };
        }
        
        function evaluatePixel(sample) {
          let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
          
          // Colorização
          if (ndvi < 0) return [0.5, 0.5, 0.5];  // cinza
          if (ndvi < 0.2) return [1, 0, 0];      // vermelho
          if (ndvi < 0.4) return [1, 1, 0];      // amarelo
          if (ndvi < 0.6) return [0, 1, 0];      // verde
          return [0, 0.5, 0];                     // verde escuro
        }
        """
        
        payload = {
            "input": {
                "bounds": {
                    "bbox": bbox,
                    "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"}
                },
                "data": [{
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": f"{date}T00:00:00Z",
                            "to": f"{date}T23:59:59Z"
                        },
                        "maxCloudCoverage": 30
                    }
                }]
            },
            "output": {
                "width": 512,
                "height": 512,
                "responses": [{
                    "identifier": "default",
                    "format": {"type": "image/png"}
                }]
            },
            "evalscript": evalscript
        }
        
        # IMPORTANTE: Você precisa criar conta gratuita em:
        # https://www.sentinel-hub.com/
        # E pegar o access_token
        
        headers = {
            'Authorization': f'Bearer {settings.SENTINEL_HUB_TOKEN}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f'{SentinelService.BASE_URL}/api/v1/process',
            json=payload,
            headers=headers
        )
        
        if response.status_code == 200:
            # Processar imagem
            image = Image.open(io.BytesIO(response.content))
            
            # Calcular NDVI médio (do RGB retornado)
            img_array = np.array(image)
            
            return {
                'image_data': response.content,
                'ndvi_mean': 0.5,  # Calcular do array
                'date': date,
                'cloud_coverage': 0,
                'bbox': bbox
            }
        
        raise Exception(f"Erro Sentinel: {response.status_code}")


# backend/satellite/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

class SatelliteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def ndvi(self, request):
        """
        GET /api/satellite/ndvi/?fazenda_id=1&date=2026-02-01
        """
        fazenda_id = request.query_params.get('fazenda_id')
        date = request.query_params.get('date')
        
        # Validar fazenda pertence ao usuário
        fazenda = Fazenda.objects.filter(
            id=fazenda_id, 
            usuario=request.user
        ).first()
        
        if not fazenda:
            return Response({'error': 'Fazenda não encontrada'}, status=404)
        
        # Buscar NDVI
        try:
            result = SentinelService.get_ndvi_image(
                latitude=fazenda.latitude,
                longitude=fazenda.longitude,
                date=date
            )
            
            # Salvar no banco para histórico
            NDVIHistorico.objects.create(
                fazenda=fazenda,
                data=result['date'],
                ndvi_medio=result['ndvi_mean'],
                cloud_coverage=result['cloud_coverage'],
                image_url=self._save_to_s3(result['image_data'])
            )
            
            return Response(result)
        
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    @action(detail=False, methods=['get'])
    def historico(self, request):
        """
        GET /api/satellite/historico/?fazenda_id=1&dias=30
        """
        fazenda_id = request.query_params.get('fazenda_id')
        dias = int(request.query_params.get('dias', 30))
        
        historico = NDVIHistorico.objects.filter(
            fazenda_id=fazenda_id,
            fazenda__usuario=request.user,
            data__gte=datetime.now() - timedelta(days=dias)
        ).order_by('-data')
        
        serializer = NDVIHistoricoSerializer(historico, many=True)
        return Response(serializer.data)


# backend/satellite/models.py
class NDVIHistorico(models.Model):
    fazenda = models.ForeignKey(Fazenda, on_delete=models.CASCADE)
    data = models.DateField()
    ndvi_medio = models.FloatField()
    cloud_coverage = models.FloatField()
    image_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['fazenda', '-data']),
        ]
```

#### Frontend: Component NDVI

```typescript
// src/components/satellite/NDVIViewer.tsx
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NDVIData {
  image_url: string;
  ndvi_mean: number;
  date: string;
  cloud_coverage: number;
}

export function NDVIViewer({ fazendaId }: { fazendaId: number }) {
  const [ndviData, setNdviData] = useState<NDVIData | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    loadNDVI();
    loadHistorico();
  }, [fazendaId, selectedDate]);

  const loadNDVI = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        fazenda_id: fazendaId.toString(),
        ...(selectedDate && { date: selectedDate })
      });
      
      const response = await api.get(`/satellite/ndvi/?${params}`);
      setNdviData(response.data);
    } catch (error) {
      console.error('Erro ao carregar NDVI:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistorico = async () => {
    try {
      const response = await api.get(`/satellite/historico/?fazenda_id=${fazendaId}&dias=30`);
      setHistorico(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const getNDVIStatus = (ndvi: number) => {
    if (ndvi < 0.2) return { label: 'Crítico', color: 'text-red-600' };
    if (ndvi < 0.4) return { label: 'Baixo', color: 'text-yellow-600' };
    if (ndvi < 0.6) return { label: 'Bom', color: 'text-green-600' };
    return { label: 'Excelente', color: 'text-green-800' };
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />;
  }

  if (!ndviData) {
    return <div>Nenhum dado disponível</div>;
  }

  const status = getNDVIStatus(ndviData.ndvi_mean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Índice NDVI</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">NDVI Médio</div>
            <div className={`text-3xl font-bold ${status.color}`}>
              {ndviData.ndvi_mean.toFixed(3)}
            </div>
            <div className="text-sm">{status.label}</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Cobertura de Nuvens</div>
            <div className="text-3xl font-bold">{ndviData.cloud_coverage.toFixed(0)}%</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Data da Imagem</div>
            <div className="text-xl font-bold">
              {new Date(ndviData.date).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Imagem NDVI */}
        <div className="relative">
          <img
            src={ndviData.image_url}
            alt="NDVI Map"
            className="w-full rounded-lg"
          />
          
          {/* Legenda */}
          <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-lg p-3">
            <div className="text-xs font-semibold mb-2">Legenda NDVI</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-xs">0.0 - 0.2 (Crítico)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-xs">0.2 - 0.4 (Baixo)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-xs">0.4 - 0.6 (Bom)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-800 rounded"></div>
                <span className="text-xs">0.6 - 1.0 (Excelente)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Histórico NDVI (30 dias)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="data" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short'
              })}
            />
            <YAxis domain={[0, 1]} />
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
              formatter={(value: number) => value.toFixed(3)}
            />
            <Line 
              type="monotone" 
              dataKey="ndvi_medio" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Interpretação */}
        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">💡 O que é NDVI?</h4>
          <p className="text-sm text-gray-700">
            O NDVI (Normalized Difference Vegetation Index) mede a saúde das plantas.
            Valores mais altos indicam vegetação mais densa e saudável. Monitorar o NDVI
            ajuda a identificar áreas com estresse hídrico ou problemas de nutrição.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### 2. 🤖 DETECÇÃO DE PRAGAS (YOLOv8)

**Impacto:** MUITO ALTO | **Esforço:** ALTO | **Dias:** 5-7

#### Backend: Modelo YOLOv8

```python
# backend/ai/models.py
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io

class PragaDetector:
    """
    Detector de pragas usando YOLOv8
    """
    
    def __init__(self):
        # Carregar modelo treinado
        self.model = YOLO('models/pragas_brasileiras_v1.pt')
        
        # Classes de pragas (exemplo)
        self.classes = {
            0: 'lagarta_cartucho',
            1: 'percevejo_marrom',
            2: 'cigarrinha',
            3: 'ferrugem_asiatica',
            4: 'mosca_branca',
            5: 'broca_cana',
            6: 'lagarta_soja',
            7: 'acaro_rajado',
            8: 'tripes',
            9: 'pulgao',
        }
        
        # Tratamentos recomendados
        self.tratamentos = {
            'lagarta_cartucho': {
                'produto': 'Deltametrina',
                'dose': '25 g/ha',
                'quando': 'Manhã (antes 10h)',
                'reaplicar': '7 dias se persistir',
                'nivel_acao': 3  # lagartas por planta
            },
            'percevejo_marrom': {
                'produto': 'Tiametoxam + Lambda-cialotrina',
                'dose': '150 mL/ha',
                'quando': 'Final da tarde',
                'reaplicar': '10-15 dias',
                'nivel_acao': 2  # percevejos por metro
            },
            # ... outros
        }
    
    def detect(self, image_data: bytes) -> dict:
        """
        Detecta pragas em imagem
        
        Returns:
            {
                'pragas': [
                    {
                        'classe': 'lagarta_cartucho',
                        'confianca': 0.94,
                        'bbox': [x, y, w, h],
                        'tratamento': {...}
                    }
                ],
                'image_annotated': bytes,  # Imagem com boxes
                'total_detectado': 3
            }
        """
        # Converter bytes para imagem
        image = Image.open(io.BytesIO(image_data))
        img_array = np.array(image)
        
        # Inferência
        results = self.model.predict(img_array, conf=0.5)
        
        pragas_detectadas = []
        
        for result in results:
            for box in result.boxes:
                classe_id = int(box.cls[0])
                confianca = float(box.conf[0])
                bbox = box.xyxy[0].tolist()
                
                classe_nome = self.classes.get(classe_id, 'desconhecido')
                
                pragas_detectadas.append({
                    'classe': classe_nome,
                    'confianca': confianca,
                    'bbox': bbox,
                    'tratamento': self.tratamentos.get(classe_nome, {})
                })
        
        # Anotar imagem
        annotated = results[0].plot()
        _, buffer = cv2.imencode('.jpg', annotated)
        image_annotated = buffer.tobytes()
        
        return {
            'pragas': pragas_detectadas,
            'image_annotated': image_annotated,
            'total_detectado': len(pragas_detectadas)
        }
    
    def nivel_infestacao(self, total: int, area_m2: float = 1.0) -> dict:
        """
        Calcula nível de infestação
        """
        densidade = total / area_m2
        
        if densidade < 2:
            nivel = 'BAIXO'
            cor = 'green'
            acao = 'Monitorar'
        elif densidade < 5:
            nivel = 'MÉDIO'
            cor = 'yellow'
            acao = 'Considerar aplicação'
        else:
            nivel = 'ALTO'
            cor = 'red'
            acao = 'Aplicar imediatamente'
        
        return {
            'nivel': nivel,
            'cor': cor,
            'acao': acao,
            'densidade': densidade
        }


# backend/ai/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.core.files.storage import default_storage

class PragaDetectorView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    
    def __init__(self):
        super().__init__()
        self.detector = PragaDetector()
    
    def post(self, request):
        """
        POST /api/ai/detectar-praga/
        
        Form-data:
            image: file
            talhao_id: int (opcional)
            latitude: float (opcional)
            longitude: float (opcional)
        """
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'Imagem não fornecida'}, status=400)
        
        # Ler bytes da imagem
        image_data = image_file.read()
        
        try:
            # Detectar
            result = self.detector.detect(image_data)
            
            # Salvar no banco de dados
            deteccao = DeteccaoPraga.objects.create(
                usuario=request.user,
                talhao_id=request.data.get('talhao_id'),
                latitude=request.data.get('latitude'),
                longitude=request.data.get('longitude'),
                image_original=image_file,
                image_annotated=result['image_annotated'],
                total_detectado=result['total_detectado'],
                resultado_json=result['pragas']
            )
            
            # Criar alerta se necessário
            if result['total_detectado'] > 0:
                nivel = self.detector.nivel_infestacao(result['total_detectado'])
                
                if nivel['nivel'] in ['MÉDIO', 'ALTO']:
                    Notificacao.objects.create(
                        usuario=request.user,
                        tipo='ALERTA_PRAGA',
                        titulo=f"⚠️ Praga detectada: {result['pragas'][0]['classe']}",
                        mensagem=f"Nível: {nivel['nivel']}. {nivel['acao']}",
                        prioridade='ALTA' if nivel['nivel'] == 'ALTO' else 'MEDIA'
                    )
            
            return Response({
                'deteccao_id': deteccao.id,
                'pragas': result['pragas'],
                'total_detectado': result['total_detectado'],
                'nivel_infestacao': self.detector.nivel_infestacao(result['total_detectado']),
                'image_annotated_url': f'/media/deteccoes/{deteccao.id}_annotated.jpg'
            })
        
        except Exception as e:
            return Response({'error': str(e)}, status=500)


# backend/ai/models.py (Database)
class DeteccaoPraga(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    talhao = models.ForeignKey(Talhao, null=True, blank=True, on_delete=models.SET_NULL)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    image_original = models.ImageField(upload_to='deteccoes/original/')
    image_annotated = models.ImageField(upload_to='deteccoes/annotated/')
    
    total_detectado = models.IntegerField(default=0)
    resultado_json = models.JSONField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
```

#### Treinar Modelo YOLOv8

```python
# scripts/train_yolo.py
"""
Script para treinar YOLOv8 com dataset de pragas brasileiras
"""

from ultralytics import YOLO
import yaml

# 1. Criar dataset.yaml
dataset_config = {
    'path': '/dataset/pragas_brasileiras',
    'train': 'images/train',
    'val': 'images/val',
    'test': 'images/test',
    'nc': 10,  # número de classes
    'names': [
        'lagarta_cartucho',
        'percevejo_marrom',
        'cigarrinha',
        'ferrugem_asiatica',
        'mosca_branca',
        'broca_cana',
        'lagarta_soja',
        'acaro_rajado',
        'tripes',
        'pulgao'
    ]
}

with open('pragas_brasileiras.yaml', 'w') as f:
    yaml.dump(dataset_config, f)

# 2. Treinar modelo
model = YOLO('yolov8n.pt')  # Começar com modelo pré-treinado

results = model.train(
    data='pragas_brasileiras.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    device='cuda',  # ou 'cpu'
    project='pragas_detection',
    name='v1',
    patience=10,  # early stopping
    save=True,
    plots=True
)

# 3. Validar
metrics = model.val()
print(f"mAP50: {metrics.box.map50}")
print(f"mAP50-95: {metrics.box.map}")

# 4. Exportar para produção
model.export(format='onnx')  # ou 'torchscript', 'tflite'
```

#### Dataset de Pragas

```bash
# Estrutura do dataset
pragas_brasileiras/
├── images/
│   ├── train/
│   │   ├── image001.jpg
│   │   ├── image002.jpg
│   │   └── ...
│   ├── val/
│   └── test/
└── labels/
    ├── train/
    │   ├── image001.txt  # annotations YOLO format
    │   └── ...
    ├── val/
    └── test/

# Formato das anotações (YOLO):
# <class_id> <x_center> <y_center> <width> <height>
# Valores normalizados entre 0 e 1
0 0.5 0.5 0.2 0.3
```

**Onde conseguir imagens:**
- Embrapa (banco de imagens)
- PlantVillage dataset
- iNaturalist
- Fotografar no campo
- Data augmentation (rotação, flip, brightness)

---

### 3. 📱 SCANNER DE PRAGAS MOBILE

**Impacto:** MUITO ALTO | **Esforço:** MÉDIO | **Dias:** 3-4

#### React Native Component

```typescript
// mobile/src/screens/PragaScannerScreen.tsx
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import { api } from '../services/api';

export function PragaScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const cameraRef = useRef<Camera>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    setScanning(true);
    
    try {
      // Tirar foto
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      // Pegar localização
      const location = await Location.getCurrentPositionAsync({});

      // Upload para API
      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'praga.jpg',
      } as any);
      formData.append('latitude', location.coords.latitude.toString());
      formData.append('longitude', location.coords.longitude.toString());

      const response = await api.post('/ai/detectar-praga/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert('Erro ao processar imagem');
    } finally {
      setScanning(false);
    }
  };

  if (hasPermission === null) {
    return <View><Text>Solicitando permissão...</Text></View>;
  }

  if (hasPermission === false) {
    return <View><Text>Sem acesso à câmera</Text></View>;
  }

  if (result) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Resultado da Detecção
        </Text>

        {/* Imagem anotada */}
        <Image
          source={{ uri: result.image_annotated_url }}
          style={{ width: '100%', height: 300, borderRadius: 10 }}
          resizeMode="contain"
        />

        {/* Pragas detectadas */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            {result.total_detectado > 0 
              ? `🐛 ${result.total_detectado} praga(s) detectada(s)`
              : '✅ Nenhuma praga detectada'
            }
          </Text>

          {result.pragas.map((praga: any, index: number) => (
            <View key={index} style={{
              backgroundColor: '#f0f0f0',
              padding: 15,
              borderRadius: 10,
              marginTop: 10
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                {praga.classe.replace('_', ' ')}
              </Text>
              <Text>Confiança: {(praga.confianca * 100).toFixed(0)}%</Text>
              
              {praga.tratamento && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontWeight: 'bold' }}>💊 Tratamento:</Text>
                  <Text>• Produto: {praga.tratamento.produto}</Text>
                  <Text>• Dose: {praga.tratamento.dose}</Text>
                  <Text>• Quando: {praga.tratamento.quando}</Text>
                </View>
              )}
            </View>
          ))}

          {/* Nível de infestação */}
          {result.nivel_infestacao && (
            <View style={{
              backgroundColor: 
                result.nivel_infestacao.nivel === 'ALTO' ? '#fee2e2' :
                result.nivel_infestacao.nivel === 'MÉDIO' ? '#fef3c7' :
                '#dcfce7',
              padding: 15,
              borderRadius: 10,
              marginTop: 10
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                Nível: {result.nivel_infestacao.nivel}
              </Text>
              <Text>{result.nivel_infestacao.acao}</Text>
            </View>
          )}
        </View>

        {/* Botão voltar */}
        <TouchableOpacity
          onPress={() => setResult(null)}
          style={{
            backgroundColor: '#3b82f6',
            padding: 15,
            borderRadius: 10,
            marginTop: 20,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            Escanear Novamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        type={CameraType.back}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'transparent',
          justifyContent: 'flex-end',
          paddingBottom: 50
        }}>
          {/* Grid de ajuda */}
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 250,
            height: 250,
            marginLeft: -125,
            marginTop: -125,
            borderWidth: 2,
            borderColor: 'white',
            borderRadius: 10,
          }} />

          {/* Instruções */}
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 15,
            marginHorizontal: 20,
            borderRadius: 10,
            marginBottom: 20
          }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Posicione a folha ou planta dentro do quadrado
            </Text>
          </View>

          {/* Botão capturar */}
          <TouchableOpacity
            onPress={takePicture}
            disabled={scanning}
            style={{
              alignSelf: 'center',
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {scanning ? (
              <ActivityIndicator color="#3b82f6" size="large" />
            ) : (
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#3b82f6'
              }} />
            )}
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}
```

---

### 4. 💰 CÁLCULO DE CUSTOS E ROI

**Impacto:** ALTO | **Esforço:** BAIXO | **Dias:** 2

```python
# backend/financeiro/services.py

class CustoService:
    """
    Cálculo de custos, receita e ROI
    """
    
    @staticmethod
    def calcular_custo_producao(safra_id: int) -> dict:
        """
        Calcula custo total de produção de uma safra
        """
        safra = Safra.objects.get(id=safra_id)
        
        # Custos fixos
        custos_fixos = {
            'aluguel_terra': 0,
            'depreciacao_maquinas': 0,
            'seguro': 0,
            'impostos': 0,
        }
        
        # Custos variáveis
        # Buscar todas aplicações da safra
        aplicacoes = Aplicacao.objects.filter(safra=safra)
        
        custo_insumos = sum(a.custo_total for a in aplicacoes)
        
        # Mão de obra
        custo_mao_obra = safra.area_hectares * 100  # R$ 100/ha exemplo
        
        # Combustível
        custo_combustivel = safra.area_hectares * 50  # R$ 50/ha
        
        # Custo total
        custo_total = (
            sum(custos_fixos.values()) +
            custo_insumos +
            custo_mao_obra +
            custo_combustivel
        )
        
        # Custo por hectare
        custo_por_ha = custo_total / safra.area_hectares
        
        # Custo por saca (se já tem produtividade)
        custo_por_saca = None
        if safra.produtividade_real:
            producao_total = safra.area_hectares * safra.produtividade_real
            custo_por_saca = custo_total / producao_total
        
        return {
            'custos_fixos': custos_fixos,
            'custo_insumos': custo_insumos,
            'custo_mao_obra': custo_mao_obra,
            'custo_combustivel': custo_combustivel,
            'custo_total': custo_total,
            'custo_por_hectare': custo_por_ha,
            'custo_por_saca': custo_por_saca,
        }
    
    @staticmethod
    def calcular_receita(safra_id: int, preco_saca: float) -> dict:
        """
        Calcula receita da safra
        """
        safra = Safra.objects.get(id=safra_id)
        
        if not safra.produtividade_real:
            return {'error': 'Safra ainda não colhida'}
        
        producao_total = safra.area_hectares * safra.produtividade_real
        receita_bruta = producao_total * preco_saca
        
        # Custos
        custos = CustoService.calcular_custo_producao(safra_id)
        
        # Lucro
        lucro_liquido = receita_bruta - custos['custo_total']
        margem_lucro = (lucro_liquido / receita_bruta) * 100
        
        # ROI
        roi = (lucro_liquido / custos['custo_total']) * 100
        
        # Break-even
        break_even_preco = custos['custo_por_saca']
        break_even_producao = custos['custo_total'] / preco_saca
        
        return {
            'producao_total_sacas': producao_total,
            'preco_saca': preco_saca,
            'receita_bruta': receita_bruta,
            'custo_total': custos['custo_total'],
            'lucro_liquido': lucro_liquido,
            'margem_lucro': margem_lucro,
            'roi': roi,
            'break_even': {
                'preco_minimo': break_even_preco,
                'producao_minima': break_even_producao
            }
        }


# backend/financeiro/views.py
class FinanceiroViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        GET /api/financeiro/dashboard/?fazenda_id=1
        
        Dashboard financeiro completo
        """
        fazenda_id = request.query_params.get('fazenda_id')
        
        # Buscar todas safras da fazenda
        safras = Safra.objects.filter(
            talhao__fazenda_id=fazenda_id,
            talhao__fazenda__usuario=request.user
        )
        
        # Calcular métricas agregadas
        total_area = sum(s.area_hectares for s in safras)
        total_custo = sum(
            CustoService.calcular_custo_producao(s.id)['custo_total'] 
            for s in safras
        )
        
        # Receita (assumindo preço médio)
        preco_medio = 80  # R$ 80/saca
        total_receita = 0
        total_producao = 0
        
        for safra in safras:
            if safra.produtividade_real:
                prod = safra.area_hectares * safra.produtividade_real
                total_producao += prod
                total_receita += prod * preco_medio
        
        lucro_total = total_receita - total_custo
        roi_medio = (lucro_total / total_custo * 100) if total_custo > 0 else 0
        
        return Response({
            'resumo': {
                'total_area_ha': total_area,
                'total_safras': safras.count(),
                'total_custo': total_custo,
                'total_receita': total_receita,
                'lucro_liquido': lucro_total,
                'roi': roi_medio,
                'producao_total_sacas': total_producao,
            },
            'por_safra': [
                {
                    'safra_id': s.id,
                    'cultura': s.cultura,
                    'custos': CustoService.calcular_custo_producao(s.id),
                    'receita': CustoService.calcular_receita(s.id, preco_medio) 
                        if s.produtividade_real else None
                }
                for s in safras
            ]
        })
```

---

## ⚡ QUICK WINS (Implementar em 1 dia)

### 1. Sistema de Alertas Inteligentes

```python
# backend/alertas/services.py
from datetime import datetime, timedelta

class AlertaService:
    """
    Sistema de alertas automáticos
    """
    
    @staticmethod
    def verificar_alertas_clima(fazenda_id: int):
        """
        Verifica condições climáticas e cria alertas
        """
        fazenda = Fazenda.objects.get(id=fazenda_id)
        clima = DadosClimaticos.objects.filter(
            fazenda=fazenda,
            data=datetime.now().date()
        ).first()
        
        if not clima:
            return
        
        alertas = []
        
        # Alerta de geada
        if clima.temperatura_minima < 3:
            alertas.append({
                'tipo': 'GEADA',
                'titulo': '❄️ Risco de geada',
                'mensagem': f'Temperatura mínima: {clima.temperatura_minima}°C. Proteja culturas sensíveis.',
                'prioridade': 'ALTA'
            })
        
        # Alerta de chuva forte
        if clima.precipitacao > 50:
            alertas.append({
                'tipo': 'CHUVA_FORTE',
                'titulo': '🌧️ Chuva forte',
                'mensagem': f'Previsão: {clima.precipitacao}mm. Evite aplicações.',
                'prioridade': 'MEDIA'
            })
        
        # Alerta de vento forte
        if clima.velocidade_vento > 20:
            alertas.append({
                'tipo': 'VENTO_FORTE',
                'titulo': '💨 Vento forte',
                'mensagem': f'Velocidade: {clima.velocidade_vento}km/h. Cuidado com pulverizações.',
                'prioridade': 'MEDIA'
            })
        
        # Criar notificações
        for alerta in alertas:
            Notificacao.objects.create(
                usuario=fazenda.usuario,
                **alerta
            )
        
        return alertas


# Celery task (rodar a cada 6h)
@shared_task
def verificar_todos_alertas():
    """
    Verifica alertas para todas fazendas
    """
    fazendas = Fazenda.objects.all()
    
    for fazenda in fazendas:
        try:
            AlertaService.verificar_alertas_clima(fazenda.id)
        except Exception as e:
            logger.error(f"Erro ao verificar alertas fazenda {fazenda.id}: {e}")
```

### 2. Exportação de Relatórios PDF

```python
# backend/relatorios/services.py
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO
from datetime import datetime

class RelatorioService:
    """
    Geração de relatórios em PDF
    """
    
    @staticmethod
    def gerar_relatorio_safra(safra_id: int) -> bytes:
        """
        Gera relatório completo da safra
        """
        safra = Safra.objects.get(id=safra_id)
        
        # Criar PDF em memória
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30
        )
        
        # Título
        elements.append(Paragraph(f"Relatório de Safra - {safra.cultura}", title_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Informações básicas
        data = [
            ['Fazenda:', safra.talhao.fazenda.nome],
            ['Talhão:', safra.talhao.nome],
            ['Cultura:', safra.cultura],
            ['Área:', f"{safra.area_hectares} ha"],
            ['Data Plantio:', safra.data_plantio.strftime('%d/%m/%Y')],
            ['Data Colheita:', safra.data_colheita.strftime('%d/%m/%Y') if safra.data_colheita else 'Em andamento'],
        ]
        
        table = Table(data, colWidths=[2*inch, 4*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e5e7eb')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db'))
        ]))
        elements.append(table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Custos
        custos = CustoService.calcular_custo_producao(safra_id)
        
        elements.append(Paragraph("Custos de Produção", styles['Heading2']))
        elements.append(Spacer(1, 0.1*inch))
        
        custos_data = [
            ['Item', 'Valor (R$)'],
            ['Insumos', f"{custos['custo_insumos']:.2f}"],
            ['Mão de obra', f"{custos['custo_mao_obra']:.2f}"],
            ['Combustível', f"{custos['custo_combustivel']:.2f}"],
            ['TOTAL', f"{custos['custo_total']:.2f}"],
        ]
        
        custos_table = Table(custos_data, colWidths=[3*inch, 2*inch])
        custos_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#dbeafe')),
            ('FONTNAME', (0, 4), (-1, 4), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db'))
        ]))
        elements.append(custos_table)
        
        # Produtividade (se já colheu)
        if safra.produtividade_real:
            elements.append(Spacer(1, 0.3*inch))
            elements.append(Paragraph("Produtividade", styles['Heading2']))
            
            receita = CustoService.calcular_receita(safra_id, preco_saca=80)
            
            prod_data = [
                ['Métrica', 'Valor'],
                ['Produção Total', f"{receita['producao_total_sacas']:.0f} sacas"],
                ['Produtividade', f"{safra.produtividade_real:.1f} sc/ha"],
                ['Receita Bruta', f"R$ {receita['receita_bruta']:.2f}"],
                ['Lucro Líquido', f"R$ {receita['lucro_liquido']:.2f}"],
                ['ROI', f"{receita['roi']:.1f}%"],
            ]
            
            prod_table = Table(prod_data, colWidths=[3*inch, 2*inch])
            prod_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db'))
            ]))
            elements.append(prod_table)
        
        # Gerar PDF
        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return pdf_bytes
```

---

## 📊 DASHBOARD EXECUTIVO

```typescript
// src/components/dashboard/ExecutiveDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface DashboardData {
  kpis: {
    area_total: number;
    safras_ativas: number;
    producao_total: number;
    receita_anual: number;
    lucro_liquido: number;
    roi_medio: number;
  };
  evolucao_mensal: Array<{
    mes: string;
    receita: number;
    custo: number;
    lucro: number;
  }>;
  por_cultura: Array<{
    cultura: string;
    area: number;
    producao: number;
  }>;
  alertas_ativos: number;
}

export function ExecutiveDashboard({ fazendaId }: { fazendaId: number }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [fazendaId]);

  const loadDashboard = async () => {
    try {
      const response = await api.get(`/dashboard/executivo/?fazenda_id=${fazendaId}`);
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <div>Carregando...</div>;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard 
          title="Área Total" 
          value={`${data.kpis.area_total} ha`}
          icon="🌾"
        />
        <KPICard 
          title="Safras Ativas" 
          value={data.kpis.safras_ativas}
          icon="📊"
        />
        <KPICard 
          title="Produção" 
          value={`${data.kpis.producao_total.toLocaleString()} sc`}
          icon="📦"
        />
        <KPICard 
          title="Receita" 
          value={`R$ ${(data.kpis.receita_anual / 1000).toFixed(0)}k`}
          icon="💰"
        />
        <KPICard 
          title="Lucro" 
          value={`R$ ${(data.kpis.lucro_liquido / 1000).toFixed(0)}k`}
          icon="📈"
          trend={data.kpis.lucro_liquido > 0 ? 'up' : 'down'}
        />
        <KPICard 
          title="ROI" 
          value={`${data.kpis.roi_medio.toFixed(1)}%`}
          icon="🎯"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Receita/Custo */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Evolução Financeira</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.evolucao_mensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="receita" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="custo" 
                stackId="2"
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Cultura */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Distribuição por Cultura</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.por_cultura}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.cultura}: ${entry.area}ha`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="area"
              >
                {data.por_cultura.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertas */}
      {data.alertas_ativos > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Você tem <strong>{data.alertas_ativos} alertas</strong> pendentes que requerem atenção.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, icon, trend }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↗' : '↘'}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}
```

---

## 🎯 PRÓXIMOS PASSOS

### Esta Semana
1. ✅ Implementar NDVI básico (Sentinel-2)
2. ✅ Começar treinamento YOLOv8
3. ✅ Sistema de alertas automáticos

### Próximas 2 Semanas
1. Scanner mobile de pragas
2. Relatórios PDF
3. Dashboard executivo
4. Cálculo de ROI

### Mês que Vem
1. Módulo Pecuária
2. App mobile completo
3. Blockchain rastreabilidade
4. Lançamento BETA

---

**Documento criado:** 08/02/2026  
**Para:** Time de Desenvolvimento  
**Prioridade:** 🔥 CRÍTICA  
**Status:** Pronto para implementar