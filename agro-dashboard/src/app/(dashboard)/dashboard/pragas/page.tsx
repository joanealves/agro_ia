"use client";

// =============================================================================
// PÁGINA DE PRAGAS - Gestão de pragas e doenças
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
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
  Filter,
  Trash2,
  Edit,
  Eye,
  Upload,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";
import { getPragas, createPraga, deletePraga, getFazendas } from "../../../../lib/api";
import type { Praga, PragaCreate, Fazenda } from "../../../../types";

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function PragasPage() {
  const [pragas, setPragas] = useState<Praga[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFazenda, setFilterFazenda] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PragaCreate>({
    fazenda: 0,
    nome: "",
    descricao: "",
    status: "pendente"
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pragasData, fazendasData] = await Promise.all([
        getPragas(),
        getFazendas()
      ]);
      setPragas(pragasData);
      setFazendas(fazendasData);
    } catch (err) {
      console.error("Erro ao carregar pragas:", err);
      setError("Não foi possível carregar os dados. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar pragas
  const filteredPragas = pragas.filter(praga => {
    const matchesSearch = praga.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      praga.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || praga.status === filterStatus;
    const matchesFazenda = filterFazenda === "all" || praga.fazenda.toString() === filterFazenda;
    return matchesSearch && matchesStatus && matchesFazenda;
  });

  // Estatísticas
  const stats = {
    total: pragas.length,
    pendentes: pragas.filter(p => p.status === "pendente").length,
    resolvidos: pragas.filter(p => p.status === "resolvido").length,
  };

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fazenda || !formData.nome) return;

    setSubmitting(true);
    try {
      await createPraga({
        ...formData,
        imagem: selectedFile || undefined
      });
      setDialogOpen(false);
      setFormData({ fazenda: 0, nome: "", descricao: "", status: "pendente" });
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      console.error("Erro ao criar praga:", err);
      setError("Erro ao registrar praga. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;

    try {
      await deletePraga(id);
      fetchData();
    } catch (err) {
      console.error("Erro ao excluir praga:", err);
      setError("Erro ao excluir registro.");
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

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

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Praga
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Registrar Nova Praga</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para registrar uma nova ocorrência de praga
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fazenda">Fazenda *</Label>
                    <Select
                      value={formData.fazenda.toString()}
                      onValueChange={(v) => setFormData({ ...formData, fazenda: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma fazenda" />
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
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Lagarta-do-cartucho"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descreva a ocorrência, localização, severidade..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imagem">Imagem (opcional)</Label>
                    <Input
                      id="imagem"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as "pendente" | "resolvido" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="resolvido">Resolvido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting || !formData.fazenda || !formData.nome}>
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.pendentes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.resolvidos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="resolvido">Resolvidos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterFazenda} onValueChange={setFilterFazenda}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Fazenda" />
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
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredPragas.length > 0 ? (
            <div className="space-y-4">
              {filteredPragas.map((praga) => (
                <div
                  key={praga.id}
                  className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {praga.imagem && (
                    <img
                      src={praga.imagem}
                      alt={praga.nome}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{praga.nome}</h3>
                      <Badge variant={praga.status === "pendente" ? "destructive" : "default"}>
                        {praga.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {praga.descricao || "Sem descrição"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(praga.data_criacao).toLocaleDateString('pt-BR')}
                      </span>
                      <span>Fazenda: {praga.fazenda_nome || `#${praga.fazenda}`}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
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
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Bug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum registro encontrado</h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm || filterStatus !== "all" || filterFazenda !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Clique em 'Registrar Praga' para adicionar o primeiro registro"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}