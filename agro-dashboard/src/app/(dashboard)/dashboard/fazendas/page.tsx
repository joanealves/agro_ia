"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { getFazendas, createFazenda, updateFazenda, deleteFazenda } from "../../../../lib/api";
import type { Fazenda, FazendaCreate } from "../../../../types";
import { FarmList } from "../../../../components/fazendas/farm-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

export default function FazendasPage() {
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal e formulário
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingFazenda, setEditingFazenda] = useState<Fazenda | null>(null);
  const [formData, setFormData] = useState<FazendaCreate>({
    nome: "",
    localizacao: "",
    latitude: 0,
    longitude: 0,
  });

  // Carregar fazendas
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFazendas();
      setFazendas(data);
    } catch (err) {
      setError("Erro ao carregar fazendas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Abrir modal para criar
  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditingFazenda(null);
    setFormData({
      nome: "",
      localizacao: "",
      latitude: 0,
      longitude: 0,
    });
    setIsOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (fazenda: Fazenda) => {
    setIsEdit(true);
    setEditingFazenda(fazenda);
    setFormData({
      nome: fazenda.nome,
      localizacao: fazenda.localizacao,
      latitude: fazenda.latitude,
      longitude: fazenda.longitude,
    });
    setIsOpen(true);
  };

  // Excluir fazenda
  const handleDelete = async (id: number) => {
    setSubmitting(true);
    try {
      await deleteFazenda(id);
      fetchData();
    } catch {
      setError("Erro ao excluir fazenda.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit && editingFazenda) {
        await updateFazenda(editingFazenda.id, formData);
      } else {
        await createFazenda(formData);
      }
      setIsOpen(false);
      fetchData();
    } catch {
      setError("Erro ao salvar fazenda.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fazendas</h1>
          <p className="text-muted-foreground">Gerencie suas fazendas cadastradas.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Fazenda
        </Button>
      </div>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      <FarmList
        fazendas={fazendas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading || submitting}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar Fazenda" : "Nova Fazenda"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                value={formData.localizacao}
                onChange={e => setFormData({ ...formData, localizacao: e.target.value })}
                required
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
                  onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}