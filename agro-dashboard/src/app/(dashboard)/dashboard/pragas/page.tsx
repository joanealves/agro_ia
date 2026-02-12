"use client";

// =============================================================================
// PÁGINA DE PRAGAS - CRUD de pragas e doenças
// Campos corretos do banco: nome, nivel, descricao, fazenda
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Badge } from "../../../../components/ui/badge";
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
  Bug,
  Plus,
  RefreshCw,
  AlertTriangle,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  XCircle
} from "lucide-react";
import { getFazendas } from "../../../../lib/api";
import api from "../../../../lib/api";
import type { Fazenda } from "../../../../types";

// =============================================================================
// TIPOS
// =============================================================================

interface PragaRegistro {
  id: number;
  nome: string;
  nivel: "baixo" | "medio" | "alto" | "critico";
  descricao: string | null;
  data_registro: string;
  fazenda: number;
  fazenda_nome?: string;
  status?: string;
  imagem?: string;
}

interface PragaCreate {
  nome: string;
  nivel: string;
  descricao: string;
  fazenda: number;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function PragasPage() {
  const [pragas, setPragas] = useState<PragaRegistro[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNivel, setFilterNivel] = useState<string>("all");
  const [filterFazenda, setFilterFazenda] = useState<string>("all");

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<PragaCreate>({
    nome: "",
    nivel: "baixo",
    descricao: "",
    fazenda: 0,
  });

  // Carregar dados
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pragasRes, fazendasData] = await Promise.all([
        api.get("/api/pragas/"),
        getFazendas()
      ]);

      const pragasData = Array.isArray(pragasRes.data)
        ? pragasRes.data
        : pragasRes.data.results || [];

      setPragas(pragasData);
      setFazendas(fazendasData);

      if (fazendasData.length > 0 && formData.fazenda === 0) {
        setFormData(prev => ({ ...prev, fazenda: fazendasData[0].id }));
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Não foi possível carregar os dados. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Criar praga
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      setError("Nome da praga é obrigatório");
      return;
    }

    if (formData.fazenda === 0) {
      setError("Selecione uma fazenda");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post("/api/pragas/", {
        nome: formData.nome,
        nivel: formData.nivel,
        descricao: formData.descricao || "",
        fazenda: formData.fazenda
      });

      setFormData({
        nome: "",
        nivel: "baixo",
        descricao: "",
        fazenda: fazendas.length > 0 ? fazendas[0].id : 0,
      });
      setIsOpen(false);
      await fetchData();
    } catch (err: unknown) {
      console.error("Erro ao criar praga:", err);

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: unknown } };
        const errorData = axiosErr.response?.data;
        const statusCode = axiosErr.response?.status;
        if (statusCode === 500) {
          setError("Erro interno do servidor. Tente novamente.");
        } else if (errorData && typeof errorData === 'object' && !Array.isArray(errorData)) {
          const messages = Object.entries(errorData as Record<string, unknown>)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
          setError(`Erro ao registrar praga: ${messages}`);
        } else {
          setError("Erro ao registrar praga. Verifique os campos.");
        }
      } else {
        setError("Erro ao registrar praga. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Deletar praga
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;

    try {
      await api.delete(`/api/pragas/${id}/`);
      await fetchData();
    } catch (err) {
      console.error("Erro ao deletar:", err);
      setError("Erro ao excluir registro.");
    }
  };

  // Filtrar pragas
  const filteredPragas = pragas.filter(p => {
    const matchSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchNivel = filterNivel === "all" || p.nivel === filterNivel;
    const matchFazenda = filterFazenda === "all" || p.fazenda.toString() === filterFazenda;
    return matchSearch && matchNivel && matchFazenda;
  });

  // Estatísticas
  const stats = {
    total: pragas.length,
    baixo: pragas.filter(p => p.nivel === "baixo").length,
    medio: pragas.filter(p => p.nivel === "medio").length,
    alto: pragas.filter(p => p.nivel === "alto").length,
    critico: pragas.filter(p => p.nivel === "critico").length,
  };

  // Helper para badge de nível
  const getNivelBadge = (nivel: string) => {
    switch (nivel) {
      case "baixo":
        return <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">Baixo</Badge>;
      case "medio":
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">Médio</Badge>;
      case "alto":
        return <Badge variant="outline" className="bg-orange-500/20 text-orange-500 border-orange-500/50">Alto</Badge>;
      case "critico":
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="outline">{nivel}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bug className="h-8 w-8 text-red-500" />
            Pragas e Doenças
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento e gestão de pragas nas fazendas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Praga
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nova Praga</DialogTitle>
                <DialogDescription>
                  Preencha os dados para registrar uma nova ocorrência de praga
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fazenda">Fazenda *</Label>
                  <Select
                    value={formData.fazenda.toString()}
                    onValueChange={(v: string) => setFormData(prev => ({ ...prev, fazenda: parseInt(v) }))}
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
                  <Label htmlFor="nome">Nome da Praga *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Lagarta-do-cartucho, Ferrugem asiática..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivel">Nível de Severidade *</Label>
                  <Select
                    value={formData.nivel}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, nivel: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">Baixo - Monitorar</SelectItem>
                      <SelectItem value="medio">Médio - Atenção</SelectItem>
                      <SelectItem value="alto">Alto - Ação necessária</SelectItem>
                      <SelectItem value="critico">Crítico - Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva a ocorrência, localização específica, área afetada..."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Salvando..." : "Registrar"}
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
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              Fechar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cards de Estatísticas */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nível Crítico</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.critico}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nível Alto</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.alto}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Controlados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.baixo}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterNivel} onValueChange={setFilterNivel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="baixo">Baixo</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="alto">Alto</SelectItem>
                <SelectItem value="critico">Crítico</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterFazenda} onValueChange={setFilterFazenda}>
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pragas */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Pragas</CardTitle>
          <CardDescription>
            {filteredPragas.length} registro(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredPragas.length > 0 ? (
            <div className="space-y-4">
              {filteredPragas.map((praga) => (
                <div
                  key={praga.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-red-500/10">
                      <Bug className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">{praga.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {praga.fazenda_nome || `Fazenda ${praga.fazenda}`} • {new Date(praga.data_registro).toLocaleDateString('pt-BR')}
                      </p>
                      {praga.descricao && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {praga.descricao}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getNivelBadge(praga.nivel)}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(praga.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Bug className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg">Nenhum registro encontrado</h3>
              <p className="text-muted-foreground">
                Clique em &apos;Registrar Praga&apos; para adicionar o primeiro registro
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
