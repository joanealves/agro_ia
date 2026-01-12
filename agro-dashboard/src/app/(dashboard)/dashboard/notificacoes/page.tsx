"use client";

// =============================================================================
// NOTIFICACOES PAGE - Página de notificações (CORRIGIDA)
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Bell, CheckCheck, Mail, MessageSquare } from "lucide-react";
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
  getNotificacoes,
  marcarNotificacaoLida,
  marcarTodasLidas,
} from "../../../../lib/api";
import type { Notificacao } from "../../../../types";

// =============================================================================
// HELPER - Formata data/hora
// =============================================================================

function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString("pt-BR");
  } catch {
    return dateString;
  }
}

// =============================================================================
// NOTIFICACOES PAGE COMPONENT
// =============================================================================

export default function NotificacoesPage() {
  // ✅ CORREÇÃO: Garantir que notificacoes seja sempre um array
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotificacoes();
      
      // ✅ CORREÇÃO: Verificar se data é um array antes de usar
      if (Array.isArray(data)) {
        setNotificacoes(data);
      } else if (data && typeof data === 'object' && 'results' in data) {
        // Caso a API retorne paginação: { results: [], count: X }
        setNotificacoes(Array.isArray((data as any).results) ? (data as any).results : []);
      } else {
        // Se não for array nem objeto com results, usar array vazio
        console.warn("API retornou formato inesperado:", data);
        setNotificacoes([]);
      }
    } catch (err) {
      console.error("Erro ao carregar notificações:", err);
      setError("Erro ao carregar notificações");
      setNotificacoes([]); // ✅ Garantir array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotificacoes();
  }, [fetchNotificacoes]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await marcarNotificacaoLida(id);
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
    } catch (err) {
      console.error("Erro ao marcar como lida:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await marcarTodasLidas();
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  };

  // ✅ CORREÇÃO: Usar operador opcional e fallback para array vazio
  const naoLidas = (notificacoes ?? []).filter((n) => !n.lida).length;

  const getTipoIcon = (tipo: string) => {
    return tipo === "email" ? (
      <Mail className="h-4 w-4" />
    ) : (
      <MessageSquare className="h-4 w-4" />
    );
  };

  const getTipoBadge = (tipo: string) => {
    return (
      <Badge variant={tipo === "email" ? "default" : "secondary"}>
        <span className="flex items-center gap-1">
          {getTipoIcon(tipo)}
          {tipo === "email" ? "E-mail" : "WhatsApp"}
        </span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie suas notificações e alertas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={naoLidas === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
          <Button variant="outline" onClick={fetchNotificacoes} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificacoes.length}</div>
            <p className="text-xs text-muted-foreground">Notificações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{naoLidas}</div>
            <p className="text-xs text-muted-foreground">Aguardando leitura</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {notificacoes.length - naoLidas}
            </div>
            <p className="text-xs text-muted-foreground">Já visualizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Erro */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={fetchNotificacoes}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabela de notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notificacoes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificacoes.map((notificacao) => (
                  <TableRow
                    key={notificacao.id}
                    className={notificacao.lida ? "opacity-60" : ""}
                  >
                    <TableCell className="font-medium max-w-md">
                      {notificacao.mensagem}
                    </TableCell>
                    <TableCell>{getTipoBadge(notificacao.tipo)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(notificacao.enviada_em)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={notificacao.lida ? "secondary" : "default"}>
                        {notificacao.lida ? "Lida" : "Não lida"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!notificacao.lida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notificacao.id)}
                        >
                          Marcar como lida
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma notificação encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}