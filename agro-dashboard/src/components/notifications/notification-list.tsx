import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: number;
  mensagem: string;
  tipo: string;
  lida: boolean;
  enviada_em: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
}

export function NotificationList({ notifications, onMarkAsRead }: NotificationListProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Mensagem</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((notification) => (
            <TableRow
              key={notification.id}
              className={!notification.lida ? 'cursor-pointer hover:bg-accent' : ''}
              onClick={() => !notification.lida && onMarkAsRead(notification.id)}
            >
              <TableCell>
                <Badge variant={notification.lida ? "secondary" : "default"}>
                  {notification.lida ? 'Lida' : 'Não lida'}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{notification.mensagem}</TableCell>
              <TableCell>
                <Badge variant="outline">{notification.tipo}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(notification.enviada_em).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}