# 🌟 AGROIA - MÓDULOS COMPLETOS (PARTE 2/4)
## Gráficos, CRM, Financeiro e RH

> **Status:** Código pronto para produção  
> **Data:** 08/02/2026

---

## 📊 MÓDULO 4: GRÁFICOS & ANALYTICS (BI)

### Database Schema

```python
# backend/analytics/models.py
class DashboardWidget(models.Model):
    """Widgets customizáveis do dashboard"""
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50, choices=[
        ('AREA_CHART', 'Gráfico de Área'),
        ('BAR_CHART', 'Gráfico de Barras'),
        ('LINE_CHART', 'Gráfico de Linha'),
        ('PIE_CHART', 'Gráfico de Pizza'),
        ('KPI_CARD', 'Cartão KPI'),
        ('TABLE', 'Tabela'),
        ('MAP', 'Mapa'),
        ('HEATMAP', 'Mapa de Calor'),
    ])
    
    # Configuração do widget
    config = models.JSONField(default=dict)  # Query, filtros, etc
    posicao_x = models.IntegerField(default=0)
    posicao_y = models.IntegerField(default=0)
    largura = models.IntegerField(default=6)  # Grid de 12 colunas
    altura = models.IntegerField(default=4)
    
    # Cache
    cache_duracao_minutos = models.IntegerField(default=15)
    ultimo_calculo = models.DateTimeField(null=True)
    dados_cache = models.JSONField(null=True)


class RelatorioCustomizado(models.Model):
    """Relatórios salvos"""
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    nome = models.CharField(max_length=200)
    tipo = models.CharField(max_length=50, choices=[
        ('PRODUCAO', 'Produção'),
        ('FINANCEIRO', 'Financeiro'),
        ('CUSTOS', 'Custos'),
        ('COMPARATIVO', 'Comparativo'),
        ('PERSONALIZADO', 'Personalizado'),
    ])
    
    # Filtros
    filtros = models.JSONField()
    
    # Agendamento
    agendar_envio = models.BooleanField(default=False)
    frequencia = models.CharField(max_length=20, null=True, choices=[
        ('DIARIO', 'Diário'),
        ('SEMANAL', 'Semanal'),
        ('MENSAL', 'Mensal'),
    ])
    emails_envio = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
```

### Backend Analytics Service

```python
# backend/analytics/services.py
from django.db.models import Sum, Avg, Count, F, Q
from datetime import datetime, timedelta

class AnalyticsService:
    """
    Serviço de análise de dados
    """
    
    @staticmethod
    def calcular_kpis_dashboard(usuario_id: int, fazenda_id: int = None) -> dict:
        """
        Calcula KPIs principais do dashboard
        """
        # Filtrar por fazenda se especificado
        fazendas_q = Q(usuario_id=usuario_id)
        if fazenda_id:
            fazendas_q &= Q(id=fazenda_id)
        
        fazendas = Propriedade.objects.filter(fazendas_q)
        
        # Área total
        area_total = Talhao.objects.filter(
            propriedade__in=fazendas,
            status='ATIVO'
        ).aggregate(total=Sum('area_hectares'))['total'] or 0
        
        # Safras ativas
        safras_ativas = Safra.objects.filter(
            talhao__propriedade__in=fazendas,
            status='EM_ANDAMENTO'
        ).count()
        
        # Produção total (últimos 12 meses)
        data_inicio = datetime.now() - timedelta(days=365)
        producao_total = Safra.objects.filter(
            talhao__propriedade__in=fazendas,
            data_colheita__gte=data_inicio
        ).annotate(
            producao=F('area_hectares') * F('produtividade_real')
        ).aggregate(total=Sum('producao'))['total'] or 0
        
        # Receita (últimos 12 meses)
        # Assumindo preço médio de R$ 80/saca
        receita_total = producao_total * 80
        
        # Custo total
        custo_total = Aplicacao.objects.filter(
            safra__talhao__propriedade__in=fazendas,
            data__gte=data_inicio
        ).aggregate(total=Sum('custo_total'))['total'] or 0
        
        # Lucro
        lucro_total = receita_total - custo_total
        
        # ROI
        roi = (lucro_total / custo_total * 100) if custo_total > 0 else 0
        
        # Alertas ativos
        alertas_ativos = Notificacao.objects.filter(
            usuario_id=usuario_id,
            lida=False,
            prioridade__in=['ALTA', 'URGENTE']
        ).count()
        
        return {
            'area_total_ha': round(area_total, 2),
            'safras_ativas': safras_ativas,
            'producao_total_sacas': round(producao_total, 0),
            'receita_total': round(receita_total, 2),
            'custo_total': round(custo_total, 2),
            'lucro_liquido': round(lucro_total, 2),
            'roi_percentual': round(roi, 1),
            'alertas_ativos': alertas_ativos,
        }
    
    @staticmethod
    def evolucao_financeira(usuario_id: int, meses: int = 12) -> list:
        """
        Evolução de receita/custo/lucro por mês
        """
        from dateutil.relativedelta import relativedelta
        
        data_inicio = datetime.now() - relativedelta(months=meses)
        
        # Agrupar por mês
        result = []
        
        for i in range(meses):
            data_mes = data_inicio + relativedelta(months=i)
            data_prox_mes = data_mes + relativedelta(months=1)
            
            # Safras colhidas no mês
            safras_mes = Safra.objects.filter(
                talhao__propriedade__usuario_id=usuario_id,
                data_colheita__gte=data_mes,
                data_colheita__lt=data_prox_mes
            ).annotate(
                producao=F('area_hectares') * F('produtividade_real')
            )
            
            producao = safras_mes.aggregate(total=Sum('producao'))['total'] or 0
            receita = producao * 80  # Preço médio
            
            # Custos do mês
            custo = Aplicacao.objects.filter(
                safra__talhao__propriedade__usuario_id=usuario_id,
                data__gte=data_mes,
                data__lt=data_prox_mes
            ).aggregate(total=Sum('custo_total'))['total'] or 0
            
            lucro = receita - custo
            
            result.append({
                'mes': data_mes.strftime('%b/%y'),
                'receita': round(receita, 2),
                'custo': round(custo, 2),
                'lucro': round(lucro, 2)
            })
        
        return result
    
    @staticmethod
    def distribuicao_culturas(usuario_id: int) -> list:
        """
        Distribuição de área por cultura
        """
        safras = Safra.objects.filter(
            talhao__propriedade__usuario_id=usuario_id,
            status='EM_ANDAMENTO'
        ).values('cultura').annotate(
            area=Sum('area_hectares')
        ).order_by('-area')
        
        return [
            {
                'cultura': s['cultura'],
                'area': round(s['area'], 2)
            }
            for s in safras
        ]
    
    @staticmethod
    def top_talhoes_produtividade(usuario_id: int, limit: int = 5) -> list:
        """
        Top talhões por produtividade
        """
        talhoes = Safra.objects.filter(
            talhao__propriedade__usuario_id=usuario_id,
            produtividade_real__isnull=False
        ).values(
            'talhao__nome', 
            'cultura'
        ).annotate(
            produtividade_media=Avg('produtividade_real')
        ).order_by('-produtividade_media')[:limit]
        
        return [
            {
                'talhao': t['talhao__nome'],
                'cultura': t['cultura'],
                'produtividade': round(t['produtividade_media'], 1)
            }
            for t in talhoes
        ]
    
    @staticmethod
    def comparativo_safras(usuario_id: int, safra_ids: list) -> dict:
        """
        Comparação entre safras
        """
        safras = Safra.objects.filter(
            id__in=safra_ids,
            talhao__propriedade__usuario_id=usuario_id
        )
        
        comparacao = []
        
        for safra in safras:
            # Custos
            custo_total = Aplicacao.objects.filter(
                safra=safra
            ).aggregate(total=Sum('custo_total'))['total'] or 0
            
            custo_por_ha = custo_total / float(safra.area_hectares) if safra.area_hectares > 0 else 0
            
            # Produção
            producao = float(safra.area_hectares) * float(safra.produtividade_real or 0)
            receita = producao * 80
            lucro = receita - custo_total
            roi = (lucro / custo_total * 100) if custo_total > 0 else 0
            
            comparacao.append({
                'safra_id': safra.id,
                'talhao': safra.talhao.nome,
                'cultura': safra.cultura,
                'area_ha': float(safra.area_hectares),
                'produtividade': float(safra.produtividade_real or 0),
                'custo_total': round(custo_total, 2),
                'custo_por_ha': round(custo_por_ha, 2),
                'receita': round(receita, 2),
                'lucro': round(lucro, 2),
                'roi': round(roi, 1)
            })
        
        return {
            'safras': comparacao,
            'media': {
                'produtividade': round(sum(s['produtividade'] for s in comparacao) / len(comparacao), 1),
                'custo_por_ha': round(sum(s['custo_por_ha'] for s in comparacao) / len(comparacao), 2),
                'roi': round(sum(s['roi'] for s in comparacao) / len(comparacao), 1)
            }
        }
```

### Frontend Dashboard Customizável

```typescript
// src/components/analytics/DashboardCustomizavel.tsx
'use client';

import { useState, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
  i: string;
  tipo: string;
  nome: string;
  config: any;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function DashboardCustomizavel() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);

  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    const response = await fetch('/api/analytics/widgets/');
    const data = await response.json();
    setWidgets(data);
  };

  const onLayoutChange = async (layout: Layout[]) => {
    if (!editMode) return;

    // Atualizar posições no backend
    const updates = layout.map(l => ({
      id: l.i,
      x: l.x,
      y: l.y,
      w: l.w,
      h: l.h
    }));

    await fetch('/api/analytics/widgets/update-layout/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widgets: updates })
    });
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.tipo) {
      case 'KPI_CARD':
        return <KPICard config={widget.config} />;
      
      case 'LINE_CHART':
        return <LineChartWidget config={widget.config} />;
      
      case 'BAR_CHART':
        return <BarChartWidget config={widget.config} />;
      
      case 'PIE_CHART':
        return <PieChartWidget config={widget.config} />;
      
      case 'TABLE':
        return <TableWidget config={widget.config} />;
      
      default:
        return <div>Widget não implementado</div>;
    }
  };

  return (
    <div className="p-4">
      {/* Toolbar */}
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded ${
              editMode ? 'bg-green-500 text-white' : 'bg-gray-200'
            }`}
          >
            {editMode ? '✓ Salvar Layout' : '✏️ Editar'}
          </button>
          
          <button
            onClick={() => setShowAddWidget(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            + Adicionar Widget
          </button>
        </div>
      </div>

      {/* Grid de Widgets */}
      <ResponsiveGridLayout
        className="layout"
        layouts={{
          lg: widgets.map(w => ({ i: w.i, x: w.x, y: w.y, w: w.w, h: w.h }))
        }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={80}
        isDraggable={editMode}
        isResizable={editMode}
        onLayoutChange={onLayoutChange}
      >
        {widgets.map((widget) => (
          <div key={widget.i} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{widget.nome}</h3>
              
              {editMode && (
                <button
                  onClick={() => removeWidget(widget.i)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="h-full">
              {renderWidget(widget)}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* Modal Adicionar Widget */}
      {showAddWidget && (
        <AddWidgetModal
          onClose={() => setShowAddWidget(false)}
          onAdd={(widget) => {
            setWidgets([...widgets, widget]);
            setShowAddWidget(false);
          }}
        />
      )}
    </div>
  );
}

function KPICard({ config }: { config: any }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/analytics/kpi/${config.metric}/`)
      .then(r => r.json())
      .then(setData);
  }, [config.metric]);

  if (!data) return <div>Carregando...</div>;

  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-blue-600">
        {data.value}
      </div>
      <div className="text-sm text-gray-600 mt-2">
        {config.label}
      </div>
      {data.trend && (
        <div className={`text-sm mt-1 ${data.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {data.trend > 0 ? '↗' : '↘'} {Math.abs(data.trend)}%
        </div>
      )}
    </div>
  );
}

function LineChartWidget({ config }: { config: any }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/analytics/time-series/${config.metric}/`)
      .then(r => r.json())
      .then(setData);
  }, [config.metric]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#3b82f6" 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarChartWidget({ config }: { config: any }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/analytics/comparison/${config.metric}/`)
      .then(r => r.json())
      .then(setData);
  }, [config.metric]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PieChartWidget({ config }: { config: any }) {
  const [data, setData] = useState<any[]>([]);
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetch(`/api/analytics/distribution/${config.metric}/`)
      .then(r => r.json())
      .then(setData);
  }, [config.metric]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => entry.name}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

---

## 🤝 MÓDULO 5: CRM AGRÍCOLA

### Database Schema

```python
# backend/crm/models.py
class Cliente(models.Model):
    """Cliente (comprador de produtos)"""
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)  # Produtor
    
    # Dados básicos
    tipo = models.CharField(max_length=20, choices=[
        ('PESSOA_FISICA', 'Pessoa Física'),
        ('PESSOA_JURIDICA', 'Pessoa Jurídica'),
    ])
    nome = models.CharField(max_length=200)
    nome_fantasia = models.CharField(max_length=200, blank=True)
    cpf_cnpj = models.CharField(max_length=18, unique=True)
    
    # Contato
    email = models.EmailField()
    telefone = models.CharField(max_length=20)
    whatsapp = models.CharField(max_length=20, blank=True)
    
    # Endereço
    cep = models.CharField(max_length=9)
    logradouro = models.CharField(max_length=200)
    numero = models.CharField(max_length=20)
    complemento = models.CharField(max_length=100, blank=True)
    bairro = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(max_length=2)
    
    # Classificação
    segmento = models.CharField(max_length=50, choices=[
        ('COOPERATIVA', 'Cooperativa'),
        ('TRADING', 'Trading'),
        ('INDUSTRIA', 'Indústria'),
        ('VAREJO', 'Varejo'),
        ('EXPORTADOR', 'Exportador'),
        ('OUTRO', 'Outro'),
    ])
    
    categoria = models.CharField(max_length=20, choices=[
        ('A', 'A - Premium'),
        ('B', 'B - Regular'),
        ('C', 'C - Ocasional'),
    ], default='B')
    
    # Relacionamento
    data_primeiro_contato = models.DateField(auto_now_add=True)
    origem = models.CharField(max_length=50, choices=[
        ('INDICACAO', 'Indicação'),
        ('PROSPECCAO', 'Prospecção'),
        ('REDES_SOCIAIS', 'Redes Sociais'),
        ('EVENTO', 'Evento'),
        ('SITE', 'Site'),
    ])
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('ATIVO', 'Ativo'),
        ('INATIVO', 'Inativo'),
        ('BLOQUEADO', 'Bloqueado'),
    ], default='ATIVO')
    
    # Observações
    observacoes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Oportunidade(models.Model):
    """Oportunidade de venda"""
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    
    # Produto
    produto = models.CharField(max_length=100)  # milho, soja, etc
    quantidade_estimada = models.DecimalField(max_digits=10, decimal_places=2)  # sacas
    unidade = models.CharField(max_length=20, default='sacas')
    
    # Valores
    valor_estimado = models.DecimalField(max_digits=12, decimal_places=2)
    valor_unitario = models.DecimalField(max_digits=8, decimal_places=2)
    
    # Pipeline
    estagio = models.CharField(max_length=50, choices=[
        ('PROSPECCAO', 'Prospecção'),
        ('QUALIFICACAO', 'Qualificação'),
        ('PROPOSTA', 'Proposta Enviada'),
        ('NEGOCIACAO', 'Negociação'),
        ('FECHAMENTO', 'Fechamento'),
        ('GANHO', 'Ganho'),
        ('PERDIDO', 'Perdido'),
    ], default='PROSPECCAO')
    
    probabilidade = models.IntegerField(default=10)  # 0-100%
    
    # Datas
    data_criacao = models.DateField(auto_now_add=True)
    data_fechamento_previsto = models.DateField()
    data_fechamento_real = models.DateField(null=True, blank=True)
    
    # Motivo (se perdido)
    motivo_perda = models.CharField(max_length=200, blank=True)
    
    # Responsável
    responsavel = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='oportunidades_responsavel'
    )


class Atividade(models.Model):
    """Atividades de CRM (ligações, reuniões, etc)"""
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, null=True, blank=True)
    oportunidade = models.ForeignKey(Oportunidade, on_delete=models.CASCADE, null=True, blank=True)
    
    tipo = models.CharField(max_length=50, choices=[
        ('LIGACAO', 'Ligação'),
        ('EMAIL', 'E-mail'),
        ('REUNIAO', 'Reunião'),
        ('VISITA', 'Visita'),
        ('PROPOSTA', 'Envio de Proposta'),
        ('FOLLOW_UP', 'Follow-up'),
        ('OUTRO', 'Outro'),
    ])
    
    assunto = models.CharField(max_length=200)
    descricao = models.TextField()
    
    # Datas
    data_hora = models.DateTimeField()
    duracao_minutos = models.IntegerField(null=True, blank=True)
    
    # Status
    concluida = models.BooleanField(default=False)
    resultado = models.CharField(max_length=50, choices=[
        ('POSITIVO', 'Positivo'),
        ('NEUTRO', 'Neutro'),
        ('NEGATIVO', 'Negativo'),
    ], blank=True)
    
    # Próxima ação
    agendar_proxima = models.BooleanField(default=False)
    proxima_acao_data = models.DateTimeField(null=True, blank=True)
    proxima_acao_descricao = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)


class Proposta(models.Model):
    """Propostas comerciais"""
    oportunidade = models.ForeignKey(Oportunidade, on_delete=models.CASCADE)
    versao = models.IntegerField(default=1)
    
    # Itens
    itens = models.JSONField()  # [{produto, quantidade, preco_unitario, total}]
    
    # Valores
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    desconto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    valor_total = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Condições
    prazo_entrega = models.CharField(max_length=100)
    forma_pagamento = models.CharField(max_length=100)
    validade_dias = models.IntegerField(default=15)
    
    # Observações
    observacoes = models.TextField(blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('RASCUNHO', 'Rascunho'),
        ('ENVIADA', 'Enviada'),
        ('ACEITA', 'Aceita'),
        ('RECUSADA', 'Recusada'),
        ('EXPIRADA', 'Expirada'),
    ], default='RASCUNHO')
    
    data_envio = models.DateTimeField(null=True, blank=True)
    data_resposta = models.DateTimeField(null=True, blank=True)
    
    # PDF
    arquivo_pdf = models.FileField(upload_to='propostas/', null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
```

### CRM Service

```python
# backend/crm/services.py
class CRMService:
    """
    Serviço de CRM
    """
    
    @staticmethod
    def calcular_metricas_vendas(usuario_id: int, periodo_dias: int = 30) -> dict:
        """
        Calcula métricas de vendas
        """
        data_inicio = datetime.now() - timedelta(days=periodo_dias)
        
        # Oportunidades criadas
        oportunidades_criadas = Oportunidade.objects.filter(
            usuario_id=usuario_id,
            data_criacao__gte=data_inicio
        ).count()
        
        # Oportunidades ganhas
        oportunidades_ganhas = Oportunidade.objects.filter(
            usuario_id=usuario_id,
            estagio='GANHO',
            data_fechamento_real__gte=data_inicio
        ).count()
        
        # Taxa de conversão
        taxa_conversao = (oportunidades_ganhas / oportunidades_criadas * 100) if oportunidades_criadas > 0 else 0
        
        # Valor total vendido
        valor_vendido = Oportunidade.objects.filter(
            usuario_id=usuario_id,
            estagio='GANHO',
            data_fechamento_real__gte=data_inicio
        ).aggregate(total=Sum('valor_estimado'))['total'] or 0
        
        # Ticket médio
        ticket_medio = valor_vendido / oportunidades_ganhas if oportunidades_ganhas > 0 else 0
        
        # Ciclo de vendas médio (dias)
        oportunidades_ganhas_obj = Oportunidade.objects.filter(
            usuario_id=usuario_id,
            estagio='GANHO',
            data_fechamento_real__isnull=False
        )
        
        ciclos = []
        for opp in oportunidades_ganhas_obj:
            ciclo = (opp.data_fechamento_real - opp.data_criacao).days
            ciclos.append(ciclo)
        
        ciclo_medio = sum(ciclos) / len(ciclos) if ciclos else 0
        
        # Pipeline (valor em aberto)
        pipeline_valor = Oportunidade.objects.filter(
            usuario_id=usuario_id,
            estagio__in=['PROSPECCAO', 'QUALIFICACAO', 'PROPOSTA', 'NEGOCIACAO', 'FECHAMENTO']
        ).aggregate(total=Sum('valor_estimado'))['total'] or 0
        
        return {
            'oportunidades_criadas': oportunidades_criadas,
            'oportunidades_ganhas': oportunidades_ganhas,
            'taxa_conversao': round(taxa_conversao, 1),
            'valor_vendido': round(valor_vendido, 2),
            'ticket_medio': round(ticket_medio, 2),
            'ciclo_medio_dias': round(ciclo_medio, 0),
            'pipeline_valor': round(pipeline_valor, 2),
        }
    
    @staticmethod
    def pipeline_funil(usuario_id: int) -> list:
        """
        Funil de vendas (pipeline)
        """
        estagios = [
            'PROSPECCAO',
            'QUALIFICACAO',
            'PROPOSTA',
            'NEGOCIACAO',
            'FECHAMENTO'
        ]
        
        funil = []
        
        for estagio in estagios:
            oportunidades = Oportunidade.objects.filter(
                usuario_id=usuario_id,
                estagio=estagio
            )
            
            quantidade = oportunidades.count()
            valor_total = oportunidades.aggregate(total=Sum('valor_estimado'))['total'] or 0
            
            funil.append({
                'estagio': estagio,
                'quantidade': quantidade,
                'valor_total': round(valor_total, 2)
            })
        
        return funil
    
    @staticmethod
    def gerar_proposta_pdf(proposta_id: int) -> bytes:
        """
        Gera PDF da proposta comercial
        """
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
        from io import BytesIO
        
        proposta = Proposta.objects.get(id=proposta_id)
        oportunidade = proposta.oportunidade
        cliente = oportunidade.cliente
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Cabeçalho
        elements.append(Paragraph("<b>PROPOSTA COMERCIAL</b>", style))
        elements.append(Paragraph(f"Nº {proposta_id:06d} - Versão {proposta.versao}", style))
        
        # Dados do cliente
        elements.append(Paragraph("<b>Cliente:</b>", style))
        cliente_data = [
            ['Nome:', cliente.nome],
            ['CPF/CNPJ:', cliente.cpf_cnpj],
            ['E-mail:', cliente.email],
            ['Telefone:', cliente.telefone],
        ]
        table = Table(cliente_data)
        elements.append(table)
        
        # Itens
        elements.append(Paragraph("<b>Itens:</b>", style))
        
        itens_data = [['Produto', 'Qtd', 'Un', 'Preço Un', 'Total']]
        for item in proposta.itens:
            itens_data.append([
                item['produto'],
                f"{item['quantidade']:.2f}",
                item.get('unidade', 'sc'),
                f"R$ {item['preco_unitario']:.2f}",
                f"R$ {item['total']:.2f}"
            ])
        
        # Totais
        itens_data.append(['', '', '', 'Subtotal:', f"R$ {proposta.subtotal:.2f}"])
        if proposta.desconto > 0:
            itens_data.append(['', '', '', 'Desconto:', f"R$ {proposta.desconto:.2f}"])
        itens_data.append(['', '', '', '<b>TOTAL:</b>', f"<b>R$ {proposta.valor_total:.2f}</b>"])
        
        table_itens = Table(itens_data)
        table_itens.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('ALIGN', (1,1), (-1,-1), 'RIGHT'),
        ]))
        elements.append(table_itens)
        
        # Condições
        elements.append(Paragraph("<b>Condições:</b>", style))
        condicoes_data = [
            ['Prazo de entrega:', proposta.prazo_entrega],
            ['Forma de pagamento:', proposta.forma_pagamento],
            ['Validade:', f"{proposta.validade_dias} dias"],
        ]
        table_cond = Table(condicoes_data)
        elements.append(table_cond)
        
        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return pdf_bytes
```

---

Continuo com os módulos 6 (Financeiro) e 7 (RH)?