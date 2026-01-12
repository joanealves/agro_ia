// "use client";

// import React, { useEffect, useState } from "react";
// import DashboardSidebar from "../Layout/dashboard-sidebar";
// import Header from "../../../components/layout/Header";
// import { getDashboardData} from "../../../lib/api";
// import type { DashboardData } from "../../../types";
// import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
// import { useAuth } from "../../../app/providers/AuthProvider";

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
// ⚠️ IMPORTANTE: Esta página NÃO deve renderizar Sidebar nem Header!
// O DashboardLayout (layout.tsx) já inclui o MainLayout que renderiza ambos.
// Esta página deve conter APENAS o conteúdo interno.
// =============================================================================

import React, { useEffect, useState } from "react";
import { getDashboardData } from "../../../lib/api";
import type { DashboardData } from "../../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useAuth } from "../../../app/providers/AuthProvider";
import { 
  Bug, 
  Droplets, 
  TrendingUp, 
  AlertTriangle,
  Loader2 
} from "lucide-react";

// =============================================================================
// DASHBOARD PAGE COMPONENT
// =============================================================================

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      const data = await getDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      setError("Falha ao carregar dados do dashboard");
    } finally {
      setDataLoading(false);
    }
  };

  // =========================================================================
  // RENDER - Apenas o conteúdo, SEM Sidebar/Header
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* Título de boas-vindas */}
      <div>
        <h1 className="text-3xl font-bold">
          Bem-vindo{user?.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do seu sistema agrícola
        </p>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="mt-2 bg-destructive text-destructive-foreground px-4 py-1 rounded text-sm hover:bg-destructive/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Loading */}
      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      ) : dashboardData ? (
        /* Cards de estatísticas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Pragas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Pragas</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboardData.total_pragas ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Identificadas no sistema
              </p>
            </CardContent>
          </Card>

          {/* Total de Irrigações */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Irrigações</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboardData.total_irrigacoes ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Registros de irrigação
              </p>
            </CardContent>
          </Card>

          {/* Produtividade Média */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboardData.produtividade?.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Fazendas monitoradas
              </p>
            </CardContent>
          </Card>

          {/* Alertas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboardData.alertas ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Requerem atenção
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum dado disponível.</p>
        </div>
      )}

      {/* Seção de produtividade por fazenda */}
      {dashboardData?.produtividade && dashboardData.produtividade.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Produtividade por Fazenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.produtividade.slice(0, 5).map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="font-medium">{item.fazenda__nome}</span>
                  <span className="text-muted-foreground">
                    {item.media_produtividade.toFixed(2)} ton/ha
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