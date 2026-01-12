// import { Fazenda } from '@/types';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Edit, Trash2 } from 'lucide-react';

// interface FarmListProps {
//   fazendas: Fazenda[];
//   onEdit: (fazenda: Fazenda) => void;
//   onDelete: (id: number) => void;
// }

// export function FarmList({ fazendas, onEdit, onDelete }: FarmListProps) {
//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Nome</TableHead>
//           <TableHead>Localização</TableHead>
//           <TableHead>Coordenadas</TableHead>
//           <TableHead>Ações</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {fazendas.map((fazenda) => (
//           <TableRow key={fazenda.id}>
//             <TableCell className="font-medium">{fazenda.nome}</TableCell>
//             <TableCell>{fazenda.localizacao}</TableCell>
//             <TableCell>
//               {fazenda.latitude.toFixed(6)}, {fazenda.longitude.toFixed(6)}
//             </TableCell>
//             <TableCell className="flex gap-2">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => onEdit(fazenda)}
//               >
//                 <Edit className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => onDelete(fazenda.id)}
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   );
// }











"use client";

// =============================================================================
// FARM LIST - Lista de fazendas em tabela
// =============================================================================

import { Edit, Trash2, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import type { Fazenda } from "../../types";

// =============================================================================
// TYPES
// =============================================================================

interface FarmListProps {
  fazendas: Fazenda[];
  onEdit: (fazenda: Fazenda) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

// =============================================================================
// FARM LIST COMPONENT
// =============================================================================

export function FarmList({ fazendas, onEdit, onDelete, isLoading = false }: FarmListProps) {
  if (fazendas.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Nenhuma fazenda cadastrada.
            <br />
            Clique em &quot;Nova Fazenda&quot; para começar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suas Fazendas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Coordenadas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fazendas.map((fazenda) => (
              <TableRow key={fazenda.id}>
                <TableCell className="font-medium">{fazenda.nome}</TableCell>
                <TableCell>{fazenda.localizacao}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {fazenda.latitude.toFixed(6)}, {fazenda.longitude.toFixed(6)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(fazenda)}
                      disabled={isLoading}
                      title="Editar fazenda"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isLoading}
                          title="Excluir fazenda"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a fazenda &quot;{fazenda.nome}&quot;?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(fazenda.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}