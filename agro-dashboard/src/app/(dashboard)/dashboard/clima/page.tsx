// "use client";
// import { useEffect, useState } from 'react';
// import { CloudRain, Thermometer, Droplets, Wind, Search } from 'lucide-react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface ClimateData {
//   id: number;
//   temperatura: number;
//   umidade: number;
//   precipitacao: number;
//   data_coleta: string;
//   fazenda: {
//     id: number;
//     nome: string;
//   };
// }

// interface ChartData {
//   name: string;
//   temperatura: number;
//   umidade: number;
//   precipitacao: number;
// }

// export default function ClimateDataPage() {
//   const [climateData, setClimateData] = useState<ClimateData[]>([
//     {
//       id: 1,
//       temperatura: 28.5,
//       umidade: 65,
//       precipitacao: 0,
//       data_coleta: "2025-02-18T08:00:00",
//       fazenda: { id: 1, nome: "Fazenda São João" }
//     },
//     {
//       id: 2,
//       temperatura: 29.2,
//       umidade: 62,
//       precipitacao: 0,
//       data_coleta: "2025-02-18T09:00:00",
//       fazenda: { id: 1, nome: "Fazenda São João" }
//     },
//     {
//       id: 3,
//       temperatura: 30.1,
//       umidade: 60,
//       precipitacao: 2.5,
//       data_coleta: "2025-02-18T10:00:00",
//       fazenda: { id: 1, nome: "Fazenda São João" }
//     }
//   ]);

//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedFarm, setSelectedFarm] = useState<string>('1');
//   const [selectedPeriod, setSelectedPeriod] = useState<string>('24h');

//   useEffect(() => {
//     setTimeout(() => {
//       setIsLoading(false);
//     }, 1000);
//   }, []);

//   const formatChartData = (data: ClimateData[]): ChartData[] => {
//     return data.map(item => ({
//       name: new Date(item.data_coleta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//       temperatura: item.temperatura,
//       umidade: item.umidade,
//       precipitacao: item.precipitacao
//     }));
//   };

//   const chartData = formatChartData(climateData);

//   const getCurrentConditions = () => {
//     const latest = climateData[climateData.length - 1];
//     return {
//       temperatura: latest.temperatura,
//       umidade: latest.umidade,
//       precipitacao: latest.precipitacao
//     };
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-pulse space-y-4">
//           <div className="h-8 w-32 bg-muted rounded"></div>
//           <div className="h-64 w-96 bg-muted rounded"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold">Dados Climáticos</h1>
//           <p className="text-muted-foreground">Monitore as condições climáticas das suas fazendas</p>
//         </div>

//         <div className="flex gap-4 w-full md:w-auto">
//           <Select value={selectedFarm} onValueChange={setSelectedFarm}>
//             <SelectTrigger className="w-[200px]">
//               <SelectValue placeholder="Selecione a fazenda" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="1">Fazenda São João</SelectItem>
//               <SelectItem value="2">Fazenda Santa Maria</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
//             <SelectTrigger className="w-[150px]">
//               <SelectValue placeholder="Período" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="24h">Últimas 24h</SelectItem>
//               <SelectItem value="7d">7 dias</SelectItem>
//               <SelectItem value="30d">30 dias</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Current Conditions Cards */}
//       <div className="grid gap-4 md:grid-cols-3">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Temperatura
//             </CardTitle>
//             <Thermometer className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{getCurrentConditions().temperatura}°C</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Umidade
//             </CardTitle>
//             <Droplets className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{getCurrentConditions().umidade}%</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Precipitação
//             </CardTitle>
//             <CloudRain className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{getCurrentConditions().precipitacao} mm</div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Charts */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Histórico de Dados</CardTitle>
//           <CardDescription>
//             Variação das condições climáticas ao longo do tempo
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="h-[400px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis yAxisId="left" />
//                 <YAxis yAxisId="right" orientation="right" />
//                 <Tooltip />
//                 <Line yAxisId="left" type="monotone" dataKey="temperatura" stroke="#ff4444" name="Temperatura (°C)" />
//                 <Line yAxisId="left" type="monotone" dataKey="umidade" stroke="#4444ff" name="Umidade (%)" />
//                 <Line yAxisId="right" type="monotone" dataKey="precipitacao" stroke="#44aa44" name="Precipitação (mm)" />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }











"use client";

// =============================================================================
// CLIMA PAGE - Página de dados climáticos
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Cloud, Droplets, Thermometer } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { getDadosClimaticos, getFazendas } from "../../../../lib/api";
import { formatDate } from "../../../../lib/utils";
import type { DadosClimaticos, Fazenda } from "../../../../types";

// =============================================================================
// CLIMA PAGE COMPONENT
// =============================================================================

export default function ClimaPage() {
  const [dados, setDados] = useState<DadosClimaticos[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [selectedFazenda, setSelectedFazenda] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [climaData, fazendasData] = await Promise.all([
        getDadosClimaticos(
          selectedFazenda !== "all" ? parseInt(selectedFazenda) : undefined
        ),
        getFazendas(),
      ]);
      setDados(climaData);
      setFazendas(fazendasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedFazenda]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calcula médias
  const tempMedia =
    dados.length > 0
      ? dados.reduce((sum, d) => sum + d.temperatura, 0) / dados.length
      : 0;
  const umidadeMedia =
    dados.length > 0
      ? dados.reduce((sum, d) => sum + d.umidade, 0) / dados.length
      : 0;
  const precipitacaoTotal = dados.reduce((sum, d) => sum + d.precipitacao, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clima</h1>
          <p className="text-muted-foreground">
            Acompanhe os dados climáticos das suas fazendas.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedFazenda} onValueChange={setSelectedFazenda}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as fazendas</SelectItem>
              {fazendas.map((f) => (
                <SelectItem key={f.id} value={f.id.toString()}>
                  {f.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Temperatura Média
            </CardTitle>
            <Thermometer className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tempMedia.toFixed(1)}°C</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umidade Média</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{umidadeMedia.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Precipitação Total
            </CardTitle>
            <Cloud className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {precipitacaoTotal.toFixed(1)}mm
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Dados recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : dados.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">
              Nenhum dado climático encontrado.
            </p>
          ) : (
            <div className="space-y-4">
              {dados.slice(0, 10).map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {d.fazenda_nome || `Fazenda ${d.fazenda}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(d.data_coleta)}
                    </p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Temp</p>
                      <p className="font-medium">{d.temperatura.toFixed(1)}°C</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Umidade</p>
                      <p className="font-medium">{d.umidade.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Chuva</p>
                      <p className="font-medium">{d.precipitacao.toFixed(1)}mm</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}