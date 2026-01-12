// "use client";

// import React, { useEffect, useState } from "react";
// import DashboardSidebar from "../../app/(dashboard)/Layout/dashboard-sidebar";
// import Header from "../../components/layout/Header";
// import { getDashboardData, DashboardData } from "../../lib/api";
// import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
// import { useAuth } from "../../app/providers/AuthProvider";

// export default function DashboardPage() {
//   const { user } = useAuth();

//   const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
//   const [dataLoading, setDataLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setDataLoading(true);
//     try {
//       const data = await getDashboardData();
//       setDashboardData(data);
//       setError(null);
//     } catch (err) {
//       console.error("Erro ao carregar dados do dashboard:", err);
//       setError("Falha ao carregar dados do dashboard");
//     } finally {
//       setDataLoading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-background text-foreground">
//       <DashboardSidebar />

//       <div className="flex-1 overflow-y-auto">
//         {user && <Header user={user} onMenuClick={() => {}} />}

//         <main className="p-6">
//           <h1 className="text-3xl font-bold mb-6">
//             Bem-vindo{user ? `, ${user.name}` : ""}!
//           </h1>

//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//               <p>{error}</p>
//               <button
//                 onClick={fetchDashboardData}
//                 className="mt-2 bg-red-700 text-white px-4 py-1 rounded text-sm"
//               >
//                 Tentar novamente
//               </button>
//             </div>
//           )}

//           {dataLoading ? (
//             <div className="bg-gray-100 p-6 rounded-lg">
//               <p className="text-gray-700">Carregando dados do dashboard...</p>
//             </div>
//           ) : dashboardData ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <Card>
//                 <CardHeader className="pb-2">
//                   <CardTitle>Total de Pragas</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-2xl font-bold">
//                     {dashboardData.total_pragas ?? 0}
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader className="pb-2">
//                   <CardTitle>Dados Climáticos</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-2">
//                     <div className="flex justify-between">
//                       <span>Temperatura Média:</span>
//                       <span className="font-medium">
//                         {dashboardData.clima.temp_media.toFixed(1)}°C
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Umidade Média:</span>
//                       <span className="font-medium">
//                         {dashboardData.clima.umidade_media.toFixed(1)}%
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Precipitação Total:</span>
//                       <span className="font-medium">
//                         {dashboardData.clima.chuva_total.toFixed(1)} mm
//                       </span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader className="pb-2">
//                   <CardTitle>Produtividade por Fazenda</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   {dashboardData.produtividade.length > 0 ? (
//                     <div className="space-y-2">
//                       {dashboardData.produtividade.slice(0, 5).map((item, index) => (
//                         <div key={index} className="flex justify-between">
//                           <span>{item.fazenda__nome}</span>
//                           <span className="font-medium">
//                             {item.media_produtividade.toFixed(2)}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p>Sem dados de produtividade</p>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           ) : (
//             <p>Nenhum dado disponível.</p>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }
















"use client";

// =============================================================================
// DASHBOARD PAGE - Página principal do dashboard
// =============================================================================

import { useEffect, useState } from "react";
import { Home, Bug, Cloud, Bell, TrendingUp, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { getDashboardData } from "../../lib/api";
import type { DashboardData } from "../../types";

// =============================================================================
// STAT CARD COMPONENT (inline)
// =============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// DASHBOARD PAGE COMPONENT
// =============================================================================

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setError("Erro ao carregar dados do dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas fazendas e métricas principais.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Fazendas"
          value={data?.total_fazendas || 0}
          icon={Home}
          description="Fazendas cadastradas"
        />
        <StatCard
          title="Pragas Detectadas"
          value={data?.total_pragas || 0}
          icon={Bug}
          description="Registros ativos"
        />
        <StatCard
          title="Temperatura Média"
          value={`${data?.clima?.temp_media?.toFixed(1) || 0}°C`}
          icon={Cloud}
          description="Últimas 24h"
        />
        <StatCard
          title="Notificações"
          value={data?.total_notificacoes || 0}
          icon={Bell}
          description="Não lidas"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Umidade Média"
          value={`${data?.clima?.umidade_media?.toFixed(1) || 0}%`}
          icon={Droplets}
          description="Todas as fazendas"
        />
        <StatCard
          title="Precipitação Total"
          value={`${data?.clima?.chuva_total?.toFixed(1) || 0}mm`}
          icon={Cloud}
          description="Últimos 30 dias"
        />
        <StatCard
          title="Produtividade Geral"
          value={
            data?.produtividade && data.produtividade.length > 0
              ? `${(
                  data.produtividade.reduce(
                    (sum, p) => sum + p.media_produtividade,
                    0
                  ) / data.produtividade.length
                ).toFixed(0)} kg/ha`
              : "N/A"
          }
          icon={TrendingUp}
          description="Média das fazendas"
        />
      </div>

      {/* Produtividade por Fazenda */}
      {data?.produtividade && data.produtividade.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Produtividade por Fazenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.produtividade.map((p, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{p.fazenda__nome}</span>
                  <span className="text-muted-foreground">
                    {p.media_produtividade.toFixed(0)} kg/ha
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}