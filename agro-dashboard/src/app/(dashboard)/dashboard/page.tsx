'use client';

import { useEffect, useState } from 'react';
import { Leaf, Droplets, ThermometerSun, Bug, Bell, Search, Filter } from 'lucide-react';
import  StatCard  from '@/components/dashboard/stat-card';
import { AreaChartCard } from '@/components/dashboard/area-chart';
import { BarChartCard } from '@/components/dashboard/bar-chart';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mensal');
  const [dashboardData, setDashboardData] = useState({
    produtividade: 0,
    irrigacao: 0,
    temperatura: 0,
    pragas: 0,
  });

  // Dados de exemplo expandidos para os gráficos
  const produtividadeData = [
    { date: "Jan", value: 2500, meta: 2700 },
    { date: "Fev", value: 2800, meta: 2700 },
    { date: "Mar", value: 3200, meta: 2900 },
    { date: "Abr", value: 3100, meta: 3000 },
    { date: "Mai", value: 3500, meta: 3200 },
    { date: "Jun", value: 3700, meta: 3400 },
  ];

  const pragasData = [
    { name: "Milho", total: 12, status: "alto" },
    { name: "Soja", total: 8, status: "médio" },
    { name: "Café", total: 5, status: "baixo" },
    { name: "Algodão", total: 3, status: "baixo" },
  ];

  const alertas = [
    { id: 1, tipo: "warning", mensagem: "Baixa umidade detectada no Setor A" },
    { id: 2, tipo: "danger", mensagem: "Praga detectada na plantação de Milho" },
    { id: 3, tipo: "info", mensagem: "Previsão de chuva para os próximos dias" },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded"></div>
          <div className="h-64 w-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da sua fazenda</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10 w-full md:w-[200px]"
            />
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diario">Diário</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Estatísticas */}
     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatCard
      title="Produtividade Média"
      value={`${dashboardData.produtividade} kg/ha`}
      icon={Leaf}
      trend={{ value: 12, isPositive: true }}
      description="Comparado ao mês anterior"
      className="bg-gradient-to-br from-green-500/10 to-transparent"
    />
    <StatCard
      title="Irrigação"
      value={`${dashboardData.irrigacao} mm`}
      icon={Droplets}
      trend={{ value: 8, isPositive: true }}
      description="Consumo de água"
      className="bg-gradient-to-br from-blue-500/10 to-transparent"
    />
    <StatCard
      title="Temperatura Média"
      value={`${dashboardData.temperatura}°C`}
      icon={ThermometerSun}
      description="Últimas 24 horas"
      className="bg-gradient-to-br from-orange-500/10 to-transparent"
    />
    <StatCard
      title="Pragas Detectadas"
      value={dashboardData.pragas}
      icon={Bug}
      trend={{ value: 5, isPositive: false }}
      description="Alertas ativos"
      className="bg-gradient-to-br from-red-500/10 to-transparent"
    />
  </div>
      {/* Gráficos e Alertas */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-8 space-y-4">
          <AreaChartCard
            title="Produtividade ao Longo do Tempo"
            data={produtividadeData}
            dataKey="value"
            gradientFrom="hsl(var(--primary))"
            gradientTo="hsl(var(--primary)/0.2)"
          />
          <BarChartCard
            title="Pragas por Cultura"
            data={pragasData}
          />
        </div>
        
        {/* Painel de Alertas */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Alertas Recentes
            </CardTitle>
            <CardDescription>Últimas notificações do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`p-3 rounded-lg border ${
                    alerta.tipo === 'danger'
                      ? 'bg-red-500/10 border-red-500/20'
                      : alerta.tipo === 'warning'
                      ? 'bg-yellow-500/10 border-yellow-500/20'
                      : 'bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  <p className="text-sm">{alerta.mensagem}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}