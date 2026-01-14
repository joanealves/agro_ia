"use client";

// =============================================================================
// PRAGAS PAGE - Página de gestão de pragas
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Bug, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { getPragas, updatePraga } from "../../../../lib/api";
import { formatDate } from "../../../../lib/utils";
import type { Praga } from "../../../../types";

// =============================================================================
// PRAGAS PAGE COMPONENT
// =============================================================================

export default function PragasPage() {
  const [pragas, setPragas] = useState<Praga[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pendente" | "resolvido">("all");

  // Carrega pragas
  const fetchPragas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPragas();
      setPragas(data);
    } catch (error) {
      console.error("Erro ao carregar pragas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPragas();
  }, [fetchPragas]);

  // Atualiza status
  const handleStatusChange = async (
    id: number,
    status: "pendente" | "resolvido"
  ) => {
    try {
      await updatePraga(id, { status });
      setPragas((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  // Filtra
  const filteredPragas = pragas.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const pendentesCount = pragas.filter((p) => p.status === "pendente").length;
  const resolvidosCount = pragas.filter((p) => p.status === "resolvido").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pragas</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie as pragas detectadas.
          </p>
        </div>
        <Button variant="outline" onClick={fetchPragas} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pragas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendentesCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {resolvidosCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Filtrar:</span>
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as typeof filter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="resolvido">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPragas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Bug className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma praga encontrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Fazenda</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPragas.map((praga) => (
                  <TableRow key={praga.id}>
                    <TableCell className="font-medium">{praga.nome}</TableCell>
                    <TableCell>
                      {praga.fazenda_nome || `Fazenda ${praga.fazenda}`}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {praga.descricao}
                    </TableCell>
                    <TableCell>{formatDate(praga.data_criacao)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          praga.status === "pendente" ? "destructive" : "default"
                        }
                      >
                        {praga.status === "pendente" ? "Pendente" : "Resolvido"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={praga.status}
                        onValueChange={(v) =>
                          handleStatusChange(
                            praga.id,
                            v as "pendente" | "resolvido"
                          )
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="resolvido">Resolvido</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}