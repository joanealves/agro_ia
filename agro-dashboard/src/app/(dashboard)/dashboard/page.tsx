'use client';

import { useEffect, useState } from 'react';
import { Leaf, Droplets, ThermometerSun, Bug } from 'lucide-react'; 
import { StatCard } from '@/components/dashboard/stat-card';
import { AreaChartCard } from '@/components/dashboard/area-chart';
import { BarChartCard } from '@/components/dashboard/bar-chart';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    produtividade: 0,
    irrigacao: 0,
    temperatura: 0,
    pragas: 0,
  });

  // Dados de exemplo para os gráficos
  const produtividadeData = [
    { date: "Jan", value: 2500 },
    { date: "Fev", value: 2800 },
    { date: "Mar", value: 3200 },
    { date: "Abr", value: 3100 },
    { date: "Mai", value: 3500 },
    { date: "Jun", value: 3700 },
  ];

  const pragasData = [
    { name: "Milho", total: 12 },
    { name: "Soja", total: 8 },
    { name: "Café", total: 5 },
    { name: "Algodão", total: 3 },
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
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Produtividade Média"
          value={`${dashboardData.produtividade} kg/ha`}
          icon={Leaf} // Use Leaf instead of Plant
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Irrigação"
          value={`${dashboardData.irrigacao} mm`}
          icon={Droplets}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Temperatura Média"
          value={`${dashboardData.temperatura}°C`}
          icon={ThermometerSun}
        />
        <StatCard
          title="Pragas Detectadas"
          value={dashboardData.pragas}
          icon={Bug}
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <AreaChartCard
          title="Produtividade ao Longo do Tempo"
          data={produtividadeData}
          dataKey="value"
          gradientFrom="hsl(var(--chart-1))"
          gradientTo="hsl(var(--chart-2))"
        />
        <BarChartCard
          title="Pragas por Cultura"
          data={pragasData}
        />
      </div>
    </div>
  );
}