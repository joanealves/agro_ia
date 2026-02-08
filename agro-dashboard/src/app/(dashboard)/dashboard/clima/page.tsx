
"use client";

// =============================================================================
// PÁGINA DE CLIMA - Dashboard de dados climáticos
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  Cloud,
  Droplets,
  Thermometer,
  Wind,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Sun,
  CloudRain
} from "lucide-react";
import { getDadosClimaticos, getFazendas } from "../../../../lib/api";
import type { DadosClimaticos, Fazenda } from "../../../../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function ClimaPage() {
  const [dados, setDados] = useState<DadosClimaticos[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [selectedFazenda, setSelectedFazenda] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar fazendas uma vez
  useEffect(() => {
    getFazendas().then((data) => {
      setFazendas(data);
      if (data.length > 0 && selectedFazenda === "all") {
        setSelectedFazenda(data[0].id.toString());
      }
    });
  }, []);

  const fetchData = useCallback(async () => {
    if (selectedFazenda === "all") return;
    setLoading(true);
    setError(null);
    try {
      const climaData = await getDadosClimaticos(parseInt(selectedFazenda));
      setDados(climaData);
    } catch (err) {
      console.error("Erro ao carregar dados climáticos:", err);
      setError("Não foi possível carregar os dados climáticos. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  }, [selectedFazenda]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calcular estatísticas
  const stats = {
    tempMedia: dados.length > 0
      ? dados.reduce((acc, d) => acc + d.temperatura, 0) / dados.length
      : 0,
    umidadeMedia: dados.length > 0
      ? dados.reduce((acc, d) => acc + d.umidade, 0) / dados.length
      : 0,
    precipTotal: dados.reduce((acc, d) => acc + d.precipitacao, 0),
    tempMax: dados.length > 0 ? Math.max(...dados.map(d => d.temperatura)) : 0,
    tempMin: dados.length > 0 ? Math.min(...dados.map(d => d.temperatura)) : 0,
  };

  // Preparar dados para gráficos
  const chartData = dados
    .slice(-30)
    .map(d => ({
      data: new Date(d.data_coleta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      temperatura: d.temperatura,
      umidade: d.umidade,
      precipitacao: d.precipitacao,
    }));

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Cloud className="h-8 w-8 text-blue-500" />
            Clima
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento climático das suas fazendas
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedFazenda} onValueChange={setSelectedFazenda}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as fazendas" />
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
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground">
                Verifique se o backend está rodando em http://localhost:8000
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cards de Estatísticas */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Temperatura Média</CardTitle>
              <Thermometer className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tempMedia.toFixed(1)}°C</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <TrendingDown className="h-3 w-3 text-blue-500" />
                Mín: {stats.tempMin.toFixed(1)}°C
                <TrendingUp className="h-3 w-3 text-red-500 ml-2" />
                Máx: {stats.tempMax.toFixed(1)}°C
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Umidade Média</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.umidadeMedia.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.umidadeMedia > 70 ? "Alta umidade" : stats.umidadeMedia < 40 ? "Baixa umidade" : "Umidade ideal"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Precipitação Total</CardTitle>
              <CloudRain className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.precipTotal.toFixed(1)} mm</div>
              <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Condição Atual</CardTitle>
              <Sun className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.tempMedia > 30 ? "Quente" : stats.tempMedia < 15 ? "Frio" : "Agradável"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dados.length} registros disponíveis
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Temperatura */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Temperatura</CardTitle>
            <CardDescription>Últimos 30 registros</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="data" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="temperatura"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    name="Temperatura (°C)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Umidade e Precipitação */}
        <Card>
          <CardHeader>
            <CardTitle>Umidade e Precipitação</CardTitle>
            <CardDescription>Últimos 30 registros</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="data" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="umidade"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Umidade (%)"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="precipitacao"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    name="Precipitação (mm)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Dados Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Registros Recentes</CardTitle>
          <CardDescription>Últimas leituras climáticas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : dados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Data</th>
                    <th className="text-left py-3 px-4 font-medium">Fazenda</th>
                    <th className="text-right py-3 px-4 font-medium">Temperatura</th>
                    <th className="text-right py-3 px-4 font-medium">Umidade</th>
                    <th className="text-right py-3 px-4 font-medium">Precipitação</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.slice(-10).reverse().map((d) => (
                    <tr key={d.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {new Date(d.data_coleta).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">{d.fazenda_nome || `Fazenda ${d.fazenda}`}</td>
                      <td className="py-3 px-4 text-right">{d.temperatura.toFixed(1)}°C</td>
                      <td className="py-3 px-4 text-right">{d.umidade.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right">{d.precipitacao.toFixed(1)} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum registro climático encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}