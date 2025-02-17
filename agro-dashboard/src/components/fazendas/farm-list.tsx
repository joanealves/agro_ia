import { Fazenda } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from 'lucide-react';

interface FarmListProps {
  fazendas: Fazenda[];
  onEdit: (fazenda: Fazenda) => void;
  onDelete: (id: number) => void;
}

export function FarmList({ fazendas, onEdit, onDelete }: FarmListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Localização</TableHead>
          <TableHead>Coordenadas</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fazendas.map((fazenda) => (
          <TableRow key={fazenda.id}>
            <TableCell className="font-medium">{fazenda.nome}</TableCell>
            <TableCell>{fazenda.localizacao}</TableCell>
            <TableCell>
              {fazenda.latitude.toFixed(6)}, {fazenda.longitude.toFixed(6)}
            </TableCell>
            <TableCell className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(fazenda)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(fazenda.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
