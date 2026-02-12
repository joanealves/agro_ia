"use client";

// =============================================================================
// PÁGINA DE IRRIGAÇÃO - Gestão de sistemas de irrigação
// Backend model: Irrigacao(fazenda, nome, status['ativo'|'inativo'])
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Badge } from "../../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Progress } from "../../../../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import {
  Droplets,
  RefreshCw,
  AlertTriangle,
  Plus,
  Power,
  PowerOff,
  TrendingUp,
} from "lucide-react";
import { getFazendas, getDadosClimaticos } from "../../../../lib/api";
import api from "../../../../lib/api";
import type { Fazenda, DadosClimaticos } from "../../../../types";

// =============================================================================
// TIPOS - Alinhados com o modelo do backend
// =============================================================================

interface IrrigacaoSistema {
  id: number;
  fazenda: number;
  fazenda_nome?: string;
  nome: string;
  status: "ativo" | "inativo";
}

interface IrrigacaoCreate {
  nome: string;
  fazenda: number;
  status: string;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function IrrigacaoPage() {
  const [irrigacoes, setIrrigacoes] = useState<IrrigacaoSistema[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [climaData, setClimaData] = useState<DadosClimaticos[]>([]);
  const [selectedFazenda, setSelectedFazenda] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<IrrigacaoCreate>({
    nome: "",
    fazenda: 0,
    status: "ativo",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fazendaId = selectedFazenda !== "all" ? parseInt(selectedFazenda) : undefined;
      const url = fazendaId
        ? `/api/irrigacao/irrigacao/?fazenda=${fazendaId}`
        : "/api/irrigacao/irrigacao/";
      const [irrigRes, fazendasData, clima] = await Promise.all([
        api.get(url),
        getFazendas(),
        fazendaId ? getDadosClimaticos(fazendaId) : Promise.resolve([])
      ]);
      const irrigData = Array.isArray(irrigRes.data) ? irrigRes.data : irrigRes.data.results || [];
      setIrrigacoes(irrigData);
      setFazendas(fazendasData);
      setClimaData(clima);

      if (fazendasData.length > 0 && formData.fazenda === 0) {
        setFormData(prev => ({ ...prev, fazenda: fazendasData[0].id }));
      }
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

  // Criar sistema de irrigação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      setError("Nome do sistema é obrigatório");
      return;
    }

    if (formData.fazenda === 0) {
      setError("Selecione uma fazenda");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post("/api/irrigacao/irrigacao/", {
        nome: formData.nome,
        fazenda: formData.fazenda,
        status: formData.status,
      });

      setFormData({
        nome: "",
        fazenda: fazendas.length > 0 ? fazendas[0].id : 0,
        status: "ativo",
      });
      setIsOpen(false);
      await fetchData();
    } catch (err) {
      console.error("Erro ao criar sistema:", err);
      setError("Erro ao criar sistema de irrigação.");
    } finally {
      setSubmitting(false);
    }
  };

  // Alternar status do sistema
  const handleToggleStatus = async (irrigacao: IrrigacaoSistema) => {
    const novoStatus = irrigacao.status === "ativo" ? "inativo" : "ativo";
    try {
      await api.patch(`/api/irrigacao/irrigacao/${irrigacao.id}/atualizar_status/`, {
        status: novoStatus,
      });
      await fetchData();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      setError("Erro ao atualizar status do sistema.");
    }
  };

  // Estatísticas
  const stats = {
    total: irrigacoes.length,
    ativos: irrigacoes.filter(i => i.status === "ativo").length,
    inativos: irrigacoes.filter(i => i.status === "inativo").length,
    umidadeMedia: climaData.length > 0
      ? climaData.reduce((acc, c) => acc + (c.umidade ?? 0), 0) / climaData.length
      : 0
  };

  // Necessidade de irrigação baseada na umidade
  const necessidadeIrrigacao = stats.umidadeMedia < 40 ? "Alta"
    : stats.umidadeMedia < 60 ? "Média"
      : "Baixa";

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
            Gestão dos sistemas de irrigação
          </p>
        </div>

        <div className="flex items-center gap-2">
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

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Sistema
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Sistema de Irrigação</DialogTitle>
                <DialogDescription>
                  Cadastre um novo sistema de irrigação para sua fazenda
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fazenda">Fazenda *</Label>
                  <Select
                    value={formData.fazenda.toString()}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, fazenda: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fazenda" />
                    </SelectTrigger>
                    <SelectContent>
                      {fazendas.map((f) => (
                        <SelectItem key={f.id} value={f.id.toString()}>
                          {f.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Sistema *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Gotejamento Talhão A, Pivô Central..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status Inicial</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Salvando..." : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
              <CardTitle className="text-sm font-medium">Total de Sistemas</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.ativos} ativo(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sistemas Ativos</CardTitle>
              <Power className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.ativos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Em operação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Umidade Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan-500" />
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
      {!loading && stats.umidadeMedia > 0 && stats.umidadeMedia < 40 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div className="flex-1">
              <p className="font-medium text-yellow-700 dark:text-yellow-400">
                Recomendação de Irrigação
              </p>
              <p className="text-sm text-muted-foreground">
                A umidade está abaixo do ideal ({stats.umidadeMedia.toFixed(1)}%).
                Considere ativar os sistemas de irrigação.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Sistemas de Irrigação */}
      <Card>
        <CardHeader>
          <CardTitle>Sistemas de Irrigação</CardTitle>
          <CardDescription>Gerencie os sistemas cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
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
                    <div className={`p-2 rounded-full ${irrigacao.status === "ativo" ? "bg-green-500/10" : "bg-gray-500/10"}`}>
                      <Droplets className={`h-5 w-5 ${irrigacao.status === "ativo" ? "text-green-500" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <p className="font-medium">{irrigacao.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {irrigacao.fazenda_nome || `Fazenda ${irrigacao.fazenda}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={irrigacao.status === "ativo" ? "default" : "secondary"}>
                      {irrigacao.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(irrigacao)}
                      title={irrigacao.status === "ativo" ? "Desativar" : "Ativar"}
                    >
                      {irrigacao.status === "ativo" ? (
                        <PowerOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Power className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum sistema de irrigação</h3>
              <p className="text-muted-foreground mt-1">
                Clique em &apos;Novo Sistema&apos; para cadastrar o primeiro
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
