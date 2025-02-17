'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Notification {
  id: number;
  mensagem: string;
  tipo: string;
  lida: boolean;
  enviada_em: string;
}

export function NotificationBadge() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.lida).length;

  useEffect(() => {
    fetchNotifications();
    // Polling a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notificacoes/recentes/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notificacoes/${id}/ler/`);
      fetchNotifications();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <>
            {notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-4 cursor-pointer"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex flex-col gap-1">
                  <p className={`text-sm ${notification.lida ? 'text-muted-foreground' : 'font-medium'}`}>
                    {notification.mensagem}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.enviada_em).toLocaleString()}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              className="p-2 text-center border-t"
              onClick={() => router.push('/dashboard/notificacoes')}
            >
              Ver todas
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}