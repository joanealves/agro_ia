'use client';

import { useEffect, useState } from 'react';
import { Droplets, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { api } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from "@tanstack/react-table";

interface DadosIrrigacao {
  id: number;
  setor: string;
  volume_agua: number;
  duracao: number;
  status: 'ativo' | 'inativo';
  timestamp: string;
  fazenda: {
    id: number;
    nome: string;
  };
}

export default function IrrigacaoPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dadosIrrigacao, setDadosIrrigacao] = useState<DadosIrrigacao[]>([]);
  const [filtro, setFiltro] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [novoIrrigacao, setNovoIrrigacao] = useState({
    setor: '',
    volume_agua: 0,
    duracao: 0,
    status: 'inativo',
    fazenda_id: 1
  });

  useEffect(() => {
    const fetchIrrigacao = async () => {
      try {
        const response = await api.get('/irrigacao/');
        setDadosIrrigacao(response.data);
      } catch (error) {
        console.error('Erro ao carregar dados de irrigação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIrrigacao();
  }, []);

  const handleCreate = async () => {
    try {
      const response = await api.post('/irrigacao/', novoIrrigacao);
      setDadosIrrigacao([...dadosIrrigacao, response.data]);
      setShowDialog(false);
    } catch (error) {
      console.error('Erro ao criar registro de irrigação:', error);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
      await api.patch(`/irrigacao/${id}/`, { status: newStatus });
      setDadosIrrigacao(dadosIrrigacao.map(item =>
        item.id === id ? { ...item, status: newStatus as 'ativo' | 'inativo' } : item
      ));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const filteredData = dadosIrrigacao.filter(item =>
    item.setor.toLowerCase().includes(filtro.toLowerCase())
  );

  const columns: ColumnDef<DadosIrrigacao>[] = [
    { accessorKey: "setor", header: "Setor" },
    { accessorKey: "volume_agua", header: "Volume (L)" },
    { accessorKey: "duracao", header: "Duração (min)" },
    { accessorKey: "fazenda.nome", header: "Fazenda" },
    { accessorKey: "timestamp", header: "Data", cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString() },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={status === "ativo"}
              onCheckedChange={() => toggleStatus(row.original.id, status)}
            />
            <span className={status === "ativo" ? "text-green-500" : "text-red-500"}>
              {status === "ativo" ? "Ativo" : "Inativo"}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Irrigação</h1>
          <p className="text-muted-foreground">Monitoramento e controle dos sistemas de irrigação</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar setor..." 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10 w-full md:w-[200px]"
            />
          </div>
          <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Sistema
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Irrigação</CardTitle>
          <CardDescription>{filteredData.length} registros encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={filteredData} columns={columns} />
        </CardContent>
      </Card>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Novo Sistema de Irrigação</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Salvar</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
