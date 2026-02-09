"use client";

// =============================================================================
// PÁGINA DE PRODUTIVIDADE - Dashboard de produtividade agrícola
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Badge } from "../../../../components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  RefreshCw, 
  AlertTriangle,
  Leaf,
  Target,
  Award,
} from "lucide-react";
import { getDadosProdutividade, getFazendas } from "../../../../lib/api";
import type { DadosProdutividade, Fazenda } from "../../../../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Cores para gráficos
const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// Helper para extrair ID da fazenda (pode ser number ou objeto)
function getFazendaId(fazenda: number | { id: number } | unknown): number {
  if (typeof fazenda === 'number') {
    return fazenda;
  }
  if (fazenda && typeof fazenda === 'object' && 'id' in fazenda) {
    return (fazenda as { id: number }).id;
  }
  return 0;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function ProdutividadePage() {
  const [dados, setDados] = useState<DadosProdutividade[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [selectedFazenda, setSelectedFazenda] = useState<string>("all");
  const [selectedCultura, setSelectedCultura] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodData, fazendasData] = await Promise.all([
        getDadosProdutividade(selectedFazenda !== "all" ? parseInt(selectedFazenda) : undefined),
        getFazendas()
      ]);
      setDados(prodData);
      setFazendas(fazendasData);
    } catch (err) {
      console.error("Erro ao carregar dados de produtividade:", err);
      setError("Não foi possível carregar os dados. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  }, [selectedFazenda]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar por cultura
  const filteredDados = selectedCultura === "all" 
    ? dados 
    : dados.filter(d => d.cultura === selectedCultura);

  // Lista única de culturas - usando Array.from() para compatibilidade ES5
  const culturas: string[] = Array.from(new Set(dados.map(d => d.cultura)));

  // Calcular estatísticas
  const stats = {
    prodMedia: filteredDados.length > 0
      ? filteredDados.reduce((acc, d) => acc + (d.produtividade || 0), 0) / filteredDados.length
      : 0,
    areaTotal: filteredDados.reduce((acc, d) => acc + (d.area || 0), 0),
    totalRegistros: filteredDados.length,
    melhorProd: filteredDados.length > 0
      ? Math.max(...filteredDados.map(d => d.produtividade || 0))
      : 0,
    piorProd: filteredDados.length > 0
      ? Math.min(...filteredDados.map(d => d.produtividade || 0))
      : 0,
  };

  // Dados para gráfico de barras por fazenda
  const prodByFazenda = fazendas.map(f => {
    // Usar helper para comparar IDs de forma segura
    const fazendaDados = filteredDados.filter(d => getFazendaId(d.fazenda) === f.id);
    return {
      nome: f.nome,
      produtividade: fazendaDados.length > 0
        ? fazendaDados.reduce((acc, d) => acc + (d.produtividade || 0), 0) / fazendaDados.length
        : 0,
      area: fazendaDados.reduce((acc, d) => acc + (d.area || 0), 0)
    };
  }).filter(f => f.produtividade > 0);

  // Dados para gráfico de pizza por cultura
  const prodByCultura = culturas.map(cultura => {
    const culturaDados = dados.filter(d => d.cultura === cultura);
    return {
      nome: cultura,
      value: culturaDados.reduce((acc, d) => acc + (d.area || 0), 0),
      prodMedia: culturaDados.length > 0
        ? culturaDados.reduce((acc, d) => acc + (d.produtividade || 0), 0) / culturaDados.length
        : 0
    };
  });

  // Dados para evolução temporal
  const evolucaoTemporal = filteredDados
    .filter(d => d.data)
    .slice()
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(-20)
    .map(d => ({
      data: new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      produtividade: d.produtividade || 0,
      cultura: d.cultura
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
            <BarChart3 className="h-8 w-8 text-green-500" />
            Produtividade
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise de produtividade das suas fazendas
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedFazenda} onValueChange={setSelectedFazenda}>
            <SelectTrigger className="w-[180px]">
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

          <Select value={selectedCultura} onValueChange={setSelectedCultura}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Todas as culturas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as culturas</SelectItem>
              {culturas.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
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
          {Array.from({ length: 4 }).map((_, i) => (
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
              <CardTitle className="text-sm font-medium">Produtividade Média</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.prodMedia.toFixed(0)} kg/ha</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalRegistros} registros analisados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Área Total</CardTitle>
              <Leaf className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.areaTotal.toFixed(1)} ha</div>
              <p className="text-xs text-muted-foreground mt-1">
                Área cultivada total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Melhor Produtividade</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {stats.melhorProd.toFixed(0)} kg/ha
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recorde registrado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Variação</CardTitle>
              <TrendingDown className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.melhorProd > 0 
                  ? ((stats.melhorProd - stats.piorProd) / stats.melhorProd * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Entre melhor e pior
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Produtividade por Fazenda */}
        <Card>
          <CardHeader>
            <CardTitle>Produtividade por Fazenda</CardTitle>
            <CardDescription>Média de produtividade (kg/ha)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : prodByFazenda.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prodByFazenda} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="nome" type="category" className="text-xs" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                    formatter={(value: number) => [`${(value ?? 0).toFixed(0)} kg/ha`, 'Produtividade']}
                  />
                  <Bar
                    dataKey="produtividade"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição por Cultura */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Cultura</CardTitle>
            <CardDescription>Área plantada por cultura (ha)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : prodByCultura.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={prodByCultura}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, percent }) => `${nome} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {prodByCultura.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                    formatter={(value: number) => [`${(value ?? 0).toFixed(1)} ha`, 'Área']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evolução Temporal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Produtividade</CardTitle>
          <CardDescription>Últimos 20 registros</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : evolucaoTemporal.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoTemporal}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="data" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                  formatter={(value: number) => [`${(value ?? 0).toFixed(0)} kg/ha`, 'Produtividade']}
                />
                <Line
                  type="monotone"
                  dataKey="produtividade" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
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

      {/* Tabela de Dados */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Produtividade</CardTitle>
          <CardDescription>Dados detalhados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredDados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Data</th>
                    <th className="text-left py-3 px-4 font-medium">Fazenda</th>
                    <th className="text-left py-3 px-4 font-medium">Cultura</th>
                    <th className="text-right py-3 px-4 font-medium">Área (ha)</th>
                    <th className="text-right py-3 px-4 font-medium">Produtividade (kg/ha)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDados.slice(-15).reverse().map((d) => (
                    <tr key={d.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {d.data ? new Date(d.data).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="py-3 px-4">{d.fazenda_nome || `Fazenda ${getFazendaId(d.fazenda)}`}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{d.cultura}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">{(d.area ?? 0).toFixed(1)}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {(d.produtividade ?? 0).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum registro de produtividade encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}