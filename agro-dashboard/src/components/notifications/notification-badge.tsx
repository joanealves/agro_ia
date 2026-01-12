// 'use client';

// import { useEffect, useState } from 'react';
// import { Bell } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { api } from '@/lib/api';
// import { useRouter } from 'next/navigation';

// interface Notification {
//   id: number;
//   mensagem: string;
//   tipo: string;
//   lida: boolean;
//   enviada_em: string;
// }

// export function NotificationBadge() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const router = useRouter();

//   const unreadCount = notifications.filter(n => !n.lida).length;

//   useEffect(() => {
//     fetchNotifications();
//     // Polling a cada 30 segundos
//     const interval = setInterval(fetchNotifications, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       const response = await api.get('/notificacoes/recentes/');
//       setNotifications(response.data);
//     } catch (error) {
//       console.error('Erro ao carregar notificações:', error);
//     }
//   };

//   const markAsRead = async (id: number) => {
//     try {
//       await api.post(`/notificacoes/${id}/ler/`);
//       fetchNotifications();
//     } catch (error) {
//       console.error('Erro ao marcar notificação como lida:', error);
//     }
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" size="icon" className="relative">
//           <Bell className="h-5 w-5" />
//           {unreadCount > 0 && (
//             <Badge 
//               className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
//               variant="destructive"
//             >
//               {unreadCount}
//             </Badge>
//           )}
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-80">
//         {notifications.length === 0 ? (
//           <div className="p-4 text-center text-sm text-muted-foreground">
//             Nenhuma notificação
//           </div>
//         ) : (
//           <>
//             {notifications.slice(0, 5).map((notification) => (
//               <DropdownMenuItem
//                 key={notification.id}
//                 className="p-4 cursor-pointer"
//                 onClick={() => markAsRead(notification.id)}
//               >
//                 <div className="flex flex-col gap-1">
//                   <p className={`text-sm ${notification.lida ? 'text-muted-foreground' : 'font-medium'}`}>
//                     {notification.mensagem}
//                   </p>
//                   <span className="text-xs text-muted-foreground">
//                     {new Date(notification.enviada_em).toLocaleString()}
//                   </span>
//                 </div>
//               </DropdownMenuItem>
//             ))}
//             <DropdownMenuItem
//               className="p-2 text-center border-t"
//               onClick={() => router.push('/dashboard/notificacoes')}
//             >
//               Ver todas
//             </DropdownMenuItem>
//           </>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }



"use client";

// =============================================================================
// NOTIFICATION BADGE - Badge de notificações no header
// =============================================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import { getNotificacoesRecentes, marcarNotificacaoLida } from "../../lib/api";
import type { Notificacao } from "../../types";

// =============================================================================
// NOTIFICATION BADGE COMPONENT
// =============================================================================

export function NotificationBadge() {
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();
  const hasErrorRef = useRef(false);

  const unreadCount = notifications.filter((n) => !n.lida).length;

  // Busca notificações
  const fetchNotifications = useCallback(async () => {
    if (disabled) return;

    try {
      setIsLoading(true);
      const data = await getNotificacoesRecentes();
      setNotifications(data);
    } catch (error) {
      const status = (error as any)?.response?.status;

      // Se a API não existir, desativa o badge
      if (status === 404) {
        console.warn("🔕 API de notificações não existe. Badge desativado.");
        setDisabled(true);
        setNotifications([]);
        return;
      }

      if (!hasErrorRef.current) {
        console.error("Erro ao carregar notificações:", error);
        hasErrorRef.current = true;
      }
    } finally {
      setIsLoading(false);
    }
  }, [disabled]);

  // Polling a cada 30 segundos
  useEffect(() => {
    fetchNotifications();

    if (disabled) return;

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, disabled]);

  // Marca notificação como lida
  const handleMarkAsRead = async (id: number) => {
    try {
      await marcarNotificacaoLida(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  // Formata data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  // Se a API não existe, não renderiza o componente
  if (disabled) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} novas</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <>
            <div className="max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-4 cursor-pointer focus:bg-accent"
                  onClick={() => {
                    if (!notification.lida) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm flex-1 ${
                          notification.lida
                            ? "text-muted-foreground"
                            : "font-medium"
                        }`}
                      >
                        {notification.mensagem}
                      </p>
                      {!notification.lida && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {notification.tipo}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.enviada_em)}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="p-2 text-center justify-center text-primary"
              onClick={() => router.push("/dashboard/notificacoes")}
            >
              Ver todas as notificações
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
