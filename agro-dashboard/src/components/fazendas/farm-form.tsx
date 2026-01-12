// import { useState } from 'react';
// import { Fazenda } from '@/types';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// interface FarmFormProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: Omit<Fazenda, 'id'>) => void;
//   initialData?: Fazenda;
// }

// export function FarmForm({ isOpen, onClose, onSubmit, initialData }: FarmFormProps) {
//   const [formData, setFormData] = useState({
//     nome: initialData?.nome || '',
//     localizacao: initialData?.localizacao || '',
//     latitude: initialData?.latitude || 0,
//     longitude: initialData?.longitude || 0,
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//     onClose();
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>
//             {initialData ? 'Editar Fazenda' : 'Nova Fazenda'}
//           </DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <Label htmlFor="nome">Nome</Label>
//             <Input
//               id="nome"
//               value={formData.nome}
//               onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
//               required
//             />
//           </div>
//           <div>
//             <Label htmlFor="localizacao">Localização</Label>
//             <Input
//               id="localizacao"
//               value={formData.localizacao}
//               onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
//               required
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="latitude">Latitude</Label>
//               <Input
//                 id="latitude"
//                 type="number"
//                 step="any"
//                 value={formData.latitude}
//                 onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="longitude">Longitude</Label>
//               <Input
//                 id="longitude"
//                 type="number"
//                 step="any"
//                 value={formData.longitude}
//                 onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
//                 required
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancelar
//             </Button>
//             <Button type="submit">
//               {initialData ? 'Salvar' : 'Criar'}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
















"use client";

// =============================================================================
// FARM FORM - Formulário de criação/edição de fazendas
// =============================================================================

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import type { Fazenda, FazendaCreate } from "../../types";

// =============================================================================
// TYPES
// =============================================================================

interface FarmFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FazendaCreate) => void;
  initialData?: Fazenda | null;
  isLoading?: boolean;
}

// =============================================================================
// FARM FORM COMPONENT
// =============================================================================

export function FarmForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: FarmFormProps) {
  const [formData, setFormData] = useState<FazendaCreate>({
    nome: "",
    localizacao: "",
    latitude: 0,
    longitude: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FazendaCreate, string>>>({});

  // Preenche form com dados iniciais
  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome,
        localizacao: initialData.localizacao,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
      });
    } else {
      setFormData({
        nome: "",
        localizacao: "",
        latitude: 0,
        longitude: 0,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Validação
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FazendaCreate, string>> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.localizacao.trim()) {
      newErrors.localizacao = "Localização é obrigatória";
    }

    if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = "Latitude deve estar entre -90 e 90";
    }

    if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = "Longitude deve estar entre -180 e 180";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  // Handle close
  const handleClose = () => {
    setFormData({
      nome: "",
      localizacao: "",
      latitude: 0,
      longitude: 0,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Fazenda" : "Nova Fazenda"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Fazenda Santa Maria"
              disabled={isLoading}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="localizacao">Localização</Label>
            <Input
              id="localizacao"
              value={formData.localizacao}
              onChange={(e) =>
                setFormData({ ...formData, localizacao: e.target.value })
              }
              placeholder="Ex: Norte de Minas Gerais"
              disabled={isLoading}
            />
            {errors.localizacao && (
              <p className="text-sm text-destructive">{errors.localizacao}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                }
                placeholder="-15.7801"
                disabled={isLoading}
              />
              {errors.latitude && (
                <p className="text-sm text-destructive">{errors.latitude}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                }
                placeholder="-47.9292"
                disabled={isLoading}
              />
              {errors.longitude && (
                <p className="text-sm text-destructive">{errors.longitude}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : initialData ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}