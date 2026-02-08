"use client";

// =============================================================================
// PÁGINA DE IRRIGAÇÃO - Gestão de irrigação
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Progress } from "../../../../components/ui/progress";
import {
  Droplets,
  RefreshCw,
  AlertTriangle,
  Play,
  Pause,
  Clock,
  Calendar,
  TrendingUp,
  Waves
} from "lucide-react";
import { getIrrigacoes, getFazendas, getDadosClimaticos } from "../../../../lib/api";
import type { Irrigacao, Fazenda, DadosClimaticos } from "../../../../types";

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function IrrigacaoPage() {
  const [irrigacoes, setIrrigacoes] = useState<Irrigacao[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [climaData, setClimaData] = useState<DadosClimaticos[]>([]);
  const [selectedFazenda, setSelectedFazenda] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fazendaId = selectedFazenda !== "all" ? parseInt(selectedFazenda) : undefined;
      const [irrigData, fazendasData, clima] = await Promise.all([
        getIrrigacoes(fazendaId),
        getFazendas(),
        getDadosClimaticos(fazendaId)
      ]);
      setIrrigacoes(irrigData);
      setFazendas(fazendasData);
      setClimaData(clima);
    } catch (err) {
      console.error("Erro ao carregar dados de irrigação:", err);
      setError("Não foi possível carregar os dados. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  }, [selectedFazenda]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Estatísticas
  const stats = {
    total: irrigacoes.length,
    emAndamento: irrigacoes.filter(i => i.status === "em_andamento").length,
    agendadas: irrigacoes.filter(i => i.status === "agendada").length,
    concluidas: irrigacoes.filter(i => i.status === "concluida").length,
    volumeTotal: irrigacoes.reduce((acc, i) => acc + (i.quantidade_agua || 0), 0),
    umidadeMedia: climaData.length > 0
      ? climaData.reduce((acc, c) => acc + c.umidade, 0) / climaData.length
      : 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_andamento": return "bg-blue-500";
      case "agendada": return "bg-yellow-500";
      case "concluida": return "bg-green-500";
      case "cancelada": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "em_andamento": return "Em Andamento";
      case "agendada": return "Agendada";
      case "concluida": return "Concluída";
      case "cancelada": return "Cancelada";
      default: return status;
    }
  };

  // Necessidade de irrigação baseada na umidade
  const necessidadeIrrigacao = stats.umidadeMedia < 40 ? "Alta"
    : stats.umidadeMedia < 60 ? "Média"
      : "Baixa";

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Droplets className="h-8 w-8 text-blue-500" />
            Irrigação
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão e monitoramento de irrigação
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
            </div>
            <Button variant="outline" size="sm" onClick={fetchData}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
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
              <CardTitle className="text-sm font-medium">Total de Irrigações</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.emAndamento} em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
              <Waves className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.volumeTotal.toFixed(0)} L</div>
              <p className="text-xs text-muted-foreground mt-1">
                Água utilizada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Umidade Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.umidadeMedia.toFixed(1)}%</div>
              <Progress value={stats.umidadeMedia} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Necessidade</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${necessidadeIrrigacao === "Alta" ? "text-red-500"
                  : necessidadeIrrigacao === "Média" ? "text-yellow-500"
                    : "text-green-500"
                }`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${necessidadeIrrigacao === "Alta" ? "text-red-500"
                  : necessidadeIrrigacao === "Média" ? "text-yellow-500"
                    : "text-green-500"
                }`}>
                {necessidadeIrrigacao}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Baseado na umidade atual
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recomendação */}
      {!loading && stats.umidadeMedia < 40 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div className="flex-1">
              <p className="font-medium text-yellow-700 dark:text-yellow-400">
                Recomendação de Irrigação
              </p>
              <p className="text-sm text-muted-foreground">
                A umidade está abaixo do ideal ({stats.umidadeMedia.toFixed(1)}%).
                Considere iniciar uma irrigação nas próximas horas.
              </p>
            </div>
            <Button variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Iniciar Irrigação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.emAndamento}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              Agendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.agendadas}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.concluidas}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Irrigações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Irrigações</CardTitle>
          <CardDescription>Registros de irrigação</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : irrigacoes.length > 0 ? (
            <div className="space-y-4">
              {irrigacoes.map((irrigacao) => (
                <div
                  key={irrigacao.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(irrigacao.status)}`} />
                    <div>
                      <p className="font-medium">
                        {irrigacao.fazenda_nome || `Fazenda ${irrigacao.fazenda}`}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {irrigacao.data ? new Date(irrigacao.data).toLocaleDateString('pt-BR') : '-'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {irrigacao.duracao} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Droplets className="h-3 w-3" />
                          {irrigacao.quantidade_agua} L
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={
                      irrigacao.status === "em_andamento" ? "default"
                        : irrigacao.status === "concluida" ? "secondary"
                          : "outline"
                    }>
                      {getStatusLabel(irrigacao.status)}
                    </Badge>

                    {irrigacao.status === "em_andamento" && (
                      <Button variant="ghost" size="icon">
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {irrigacao.status === "agendada" && (
                      <Button variant="ghost" size="icon">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma irrigação encontrada</h3>
              <p className="text-muted-foreground mt-1">
                Não há registros de irrigação para esta fazenda
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}