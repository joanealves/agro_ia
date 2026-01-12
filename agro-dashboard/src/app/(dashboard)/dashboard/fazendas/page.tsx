// "use client";
// import { useEffect, useState } from 'react';
// import { MapPin, Trash2, Edit, Plus, Search } from 'lucide-react';
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// interface Farm {
//   id: number;
//   nome: string;
//   localizacao: string;
//   latitude: number;
//   longitude: number;
// }

// export default function FarmManagement() {
//   const [farms, setFarms] = useState<Farm[]>([
//     {
//       id: 1,
//       nome: "Fazenda São João",
//       localizacao: "São Paulo, SP",
//       latitude: -23.5505,
//       longitude: -46.6333
//     },
//     {
//       id: 2,
//       nome: "Fazenda Santa Maria",
//       localizacao: "Ribeirão Preto, SP",
//       latitude: -21.1704,
//       longitude: -47.8103
//     }
//   ]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showDialog, setShowDialog] = useState(false);

//   useEffect(() => {
//     // Simulate API loading
//     setTimeout(() => {
//       setIsLoading(false);
//     }, 1000);
//   }, []);

//   const filteredFarms = farms.filter(farm =>
//     farm.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     farm.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
//   );

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
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold">Gerenciamento de Fazendas</h1>
//           <p className="text-muted-foreground">Gerencie suas fazendas e propriedades</p>
//         </div>

//         <div className="flex gap-4 w-full md:w-auto">
//           <div className="relative flex-1 md:flex-none">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//             <Input 
//               placeholder="Buscar fazendas..." 
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 w-full md:w-[250px]"
//             />
//           </div>
//           <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
//             <Plus className="h-4 w-4" />
//             Nova Fazenda
//           </Button>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <MapPin className="h-5 w-5 text-primary" />
//             Lista de Fazendas
//           </CardTitle>
//           <CardDescription>
//             {filteredFarms.length} fazendas encontradas
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="w-full overflow-auto">
//             <div className="min-w-full divide-y divide-gray-200">
//               {/* Table Header */}
//               <div className="bg-muted/50">
//                 <div className="grid grid-cols-4 px-4 py-3">
//                   <div className="font-medium">Nome</div>
//                   <div className="font-medium">Localização</div>
//                   <div className="font-medium">Coordenadas</div>
//                   <div className="font-medium text-right">Ações</div>
//                 </div>
//               </div>
//               {/* Table Body */}
//               <div className="divide-y divide-gray-200 bg-white">
//                 {filteredFarms.map((farm) => (
//                   <div key={farm.id} className="grid grid-cols-4 px-4 py-3">
//                     <div className="font-medium">{farm.nome}</div>
//                     <div>{farm.localizacao}</div>
//                     <div>
//                       {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
//                     </div>
//                     <div className="flex justify-end gap-2">
//                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Adicionar Nova Fazenda</AlertDialogTitle>
//             <AlertDialogDescription>
//               Preencha os dados da nova fazenda
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <div className="grid gap-4 py-4">
//             <Input placeholder="Nome da fazenda" />
//             <Input placeholder="Localização" />
//             <div className="grid grid-cols-2 gap-4">
//               <Input placeholder="Latitude" type="number" step="0.000001" />
//               <Input placeholder="Longitude" type="number" step="0.000001" />
//             </div>
//           </div>
//           <AlertDialogFooter>
//             <Button variant="outline" onClick={() => setShowDialog(false)}>
//               Cancelar
//             </Button>
//             <Button onClick={() => setShowDialog(false)}>
//               Salvar
//             </Button>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }
















"use client";

// =============================================================================
// FAZENDAS PAGE - Página de gestão de fazendas
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw, MapPin, Edit, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
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
} from "../../../../components/ui/alert-dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { useToast } from "../../../../hooks/use-toast";
import { getFazendas, createFazenda, updateFazenda, deleteFazenda } from "../../../../lib/api";
import type { Fazenda, FazendaCreate } from "../../../../types";

// =============================================================================
// FAZENDAS PAGE COMPONENT
// =============================================================================

export default function FazendasPage() {
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFazenda, setEditingFazenda] = useState<Fazenda | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<FazendaCreate>({
    nome: "",
    localizacao: "",
    latitude: 0,
    longitude: 0,
  });

  // Carrega fazendas
  const fetchFazendas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFazendas();
      setFazendas(data);
    } catch (error) {
      console.error("Erro ao carregar fazendas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as fazendas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFazendas();
  }, [fetchFazendas]);

  // Abre form para edição
  const handleEdit = (fazenda: Fazenda) => {
    setEditingFazenda(fazenda);
    setFormData({
      nome: fazenda.nome,
      localizacao: fazenda.localizacao,
      latitude: fazenda.latitude,
      longitude: fazenda.longitude,
    });
    setIsFormOpen(true);
  };

  // Abre form para novo
  const handleNew = () => {
    setEditingFazenda(null);
    setFormData({ nome: "", localizacao: "", latitude: 0, longitude: 0 });
    setIsFormOpen(true);
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (editingFazenda) {
        const updated = await updateFazenda(editingFazenda.id, formData);
        setFazendas((prev) =>
          prev.map((f) => (f.id === editingFazenda.id ? updated : f))
        );
        toast({ title: "Sucesso", description: "Fazenda atualizada!" });
      } else {
        const created = await createFazenda(formData);
        setFazendas((prev) => [...prev, created]);
        toast({ title: "Sucesso", description: "Fazenda criada!" });
      }

      setIsFormOpen(false);
      setEditingFazenda(null);
    } catch (error) {
      console.error("Erro ao salvar fazenda:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a fazenda.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    try {
      await deleteFazenda(id);
      setFazendas((prev) => prev.filter((f) => f.id !== id));
      toast({ title: "Sucesso", description: "Fazenda excluída!" });
    } catch (error) {
      console.error("Erro ao excluir fazenda:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a fazenda.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fazendas</h1>
          <p className="text-muted-foreground">
            Gerencie suas fazendas e propriedades.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchFazendas} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Fazenda
          </Button>
        </div>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Fazendas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : fazendas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma fazenda cadastrada.</p>
            </div>
          ) : (
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
                      {fazenda.latitude.toFixed(4)}, {fazenda.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(fazenda)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir &quot;{fazenda.nome}&quot;?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(fazenda.id)}
                                className="bg-destructive text-destructive-foreground"
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
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFazenda ? "Editar Fazenda" : "Nova Fazenda"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="Ex: Fazenda Santa Maria"
              />
            </div>
            <div>
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                value={formData.localizacao}
                onChange={(e) =>
                  setFormData({ ...formData, localizacao: e.target.value })
                }
                placeholder="Ex: Norte de Minas"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitude: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitude: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}