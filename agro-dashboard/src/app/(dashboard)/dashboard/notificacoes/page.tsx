// 'use client';

// import { useEffect, useState } from 'react';
// import { Bell, Search, Filter, CheckCircle2, AlertCircle, Info, Clock } from 'lucide-react';
// import { api } from '@/lib/api';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";

// interface Notification {
//   id: number;
//   mensagem: string;
//   tipo: string;
//   lida: boolean;
//   enviada_em: string;
// }

// export default function NotificacoesPage() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [filter, setFilter] = useState<'todas' | 'nao-lidas' | 'lidas'>('todas');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedPeriod, setSelectedPeriod] = useState('7dias');

//   useEffect(() => {
//     fetchNotifications();
//   }, [filter, selectedPeriod]);

//   const fetchNotifications = async () => {
//     try {
//       const response = await api.get('/notificacoes/', {
//         params: {
//           lida: filter === 'lidas' ? true : filter === 'nao-lidas' ? false : undefined,
//           periodo: selectedPeriod,
//         },
//       });
//       setNotifications(response.data);
//     } catch (error) {
//       console.error('Erro ao carregar notificações:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleMarkAsRead = async (id: number) => {
//     try {
//       await api.post(`/notificacoes/${id}/ler/`);
//       fetchNotifications();
//     } catch (error) {
//       console.error('Erro ao marcar notificação como lida:', error);
//     }
//   };

//   const getNotificationIcon = (tipo: string) => {
//     switch (tipo.toLowerCase()) {
//       case 'alerta':
//         return <AlertCircle className="h-5 w-5 text-red-500" />;
//       case 'info':
//         return <Info className="h-5 w-5 text-blue-500" />;
//       default:
//         return <Bell className="h-5 w-5 text-primary" />;
//     }
//   };

//   const filteredNotifications = notifications.filter(notification =>
//     notification.mensagem.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const getRelativeTime = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

//     if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
//     if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
//     return `${Math.floor(diffInMinutes / 1440)}d atrás`;
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
//       {/* Cabeçalho */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold">Notificações</h1>
//           <p className="text-muted-foreground">
//             Gerencie todas as notificações do sistema
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-4 w-full md:w-auto">
//           <div className="relative flex-1 md:flex-none">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Buscar notificações..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 w-full md:w-[250px]"
//             />
//           </div>
//           <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
//             <SelectTrigger className="w-[150px]">
//               <SelectValue placeholder="Período" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="24h">Últimas 24h</SelectItem>
//               <SelectItem value="7dias">Últimos 7 dias</SelectItem>
//               <SelectItem value="30dias">Últimos 30 dias</SelectItem>
//               <SelectItem value="todos">Todos</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Tabs e Filtros */}
//       <Tabs defaultValue="todas" className="w-full">
//         <TabsList>
//           <TabsTrigger value="todas" onClick={() => setFilter('todas')}>
//             Todas
//           </TabsTrigger>
//           <TabsTrigger value="nao-lidas" onClick={() => setFilter('nao-lidas')}>
//             Não lidas
//           </TabsTrigger>
//           <TabsTrigger value="lidas" onClick={() => setFilter('lidas')}>
//             Lidas
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="todas" className="mt-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Bell className="h-5 w-5 text-primary" />
//                 Lista de Notificações
//               </CardTitle>
//               <CardDescription>
//                 {filteredNotifications.length} notificações encontradas
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {filteredNotifications.length === 0 ? (
//                   <div className="text-center py-8 text-muted-foreground">
//                     Nenhuma notificação encontrada
//                   </div>
//                 ) : (
//                   filteredNotifications.map((notification) => (
//                     <div
//                       key={notification.id}
//                       className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
//                         notification.lida
//                           ? 'bg-muted/40 border-border'
//                           : 'bg-primary/5 border-primary/20'
//                       }`}
//                     >
//                       {getNotificationIcon(notification.tipo)}
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium">{notification.mensagem}</p>
//                         <div className="flex items-center gap-2 mt-1">
//                           <Clock className="h-3 w-3 text-muted-foreground" />
//                           <span className="text-xs text-muted-foreground">
//                             {getRelativeTime(notification.enviada_em)}
//                           </span>
//                         </div>
//                       </div>
//                       {!notification.lida && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleMarkAsRead(notification.id)}
//                           className="shrink-0"
//                         >
//                           <CheckCircle2 className="h-4 w-4 mr-1" />
//                           Marcar como lida
//                         </Button>
//                       )}
//                     </div>
//                   ))
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="nao-lidas" className="mt-6">
//           {/* Mesmo conteúdo do "todas" mas filtrado */}
//         </TabsContent>

//         <TabsContent value="lidas" className="mt-6">
//           {/* Mesmo conteúdo do "todas" mas filtrado */}
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }


















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