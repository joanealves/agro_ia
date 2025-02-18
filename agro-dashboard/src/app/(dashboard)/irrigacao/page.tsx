'use client';

import { useEffect, useState } from 'react';
import { Droplets, AreaChart, Filter, Search, Plus, ToggleLeft, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { api } from '@/lib/api';
import { AreaChartCard } from '@/components/dashboard/area-chart';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [setorFiltro, setSetorFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [showDialog, setShowDialog] = useState(false);
  const [novoIrrigacao, setNovoIrrigacao] = useState({
    setor: '',
    volume_agua: 0,
    duracao: 0,
    status: 'inativo',
    fazenda_id: 1
  });

  // Dados para o gráfico
  const consumoAgua = [
    { date: "Jan", value: 120, meta: 130 },
    { date: "Fev", value: 100, meta: 130 },
    { date: "Mar", value: 140, meta: 130 },
    { date: "Abr", value: 160, meta: 130 },
    { date: "Mai", value: 180, meta: 130 },
    { date: "Jun", value: 150, meta: 130 },
  ];

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
      
      // Atualiza o estado local
      setDadosIrrigacao(dadosIrrigacao.map(item => 
        item.id === id ? {...item, status: newStatus as 'ativo' | 'inativo'} : item
      ));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const filteredData = dadosIrrigacao.filter(item => {
    const matchesSearch = item.setor.toLowerCase().includes(filtro.toLowerCase());
    const matchesSetor = setorFiltro === 'todos' || item.setor === setorFiltro;
    const matchesStatus = statusFiltro === 'todos' || item.status === statusFiltro;
    return matchesSearch && matchesSetor && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded"></div>
          <div className="h-64 w-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Colunas para a tabela
  const columns = [
    { header: 'Setor', accessor: 'setor' },
    { header: 'Volume (L)', accessor: 'volume_agua' },
    { header: 'Duração (min)', accessor: 'duracao' },
    { header: 'Fazenda', accessor: 'fazenda.nome' },
    { header: 'Data', accessor: 'timestamp', cell: (value: string) => new Date(value).toLocaleDateString() },
    { 
      header: 'Status', 
      accessor: 'status', 
      cell: (value: string, row: DadosIrrigacao) => (
        <div className="flex items-center gap-2">
          <Switch 
            checked={value === 'ativo'} 
            onCheckedChange={() => toggleStatus(row.id, value)}
          />
          <span className={value === 'ativo' ? 'text-green-500' : 'text-red-500'}>
            {value === 'ativo' ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      )
    }
  ];

  const setores = [...new Set(dadosIrrigacao.map(item => item.setor))];

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

      <Tabs defaultValue="monitoramento" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
          <TabsTrigger value="registros">Registros</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monitoramento" className="space-y-6">
          {/* Gráficos de Consumo de Água */}
          <div className="grid gap-4 md:grid-cols-1">
            <AreaChartCard
              title="Consumo de Água por Período"
              data={consumoAgua}
              dataKey="value"
              gradientFrom="hsl(var(--primary))"
              gradientTo="hsl(var(--primary)/0.2)"
            />
          </div>

          {/* Status atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                Status Atual dos Sistemas
              </CardTitle>
              <CardDescription>
                Visão geral dos sistemas ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dadosIrrigacao
                  .filter(item => item.status === 'ativo')
                  .map(item => (
                    <Card key={item.id} className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{item.setor}</h3>
                            <p className="text-sm text-muted-foreground">{item.fazenda.nome}</p>
                          </div>
                          <Switch 
                            checked={true} 
                            onCheckedChange={() => toggleStatus(item.id, item.status)}
                          />
                        </div>
                        <div className="mt-4 space-y-1">
                          <p className="text-sm flex justify-between">
                            <span>Volume atual:</span>
                            <span className="font-medium">{item.volume_agua} L</span>
                          </p>
                          <p className="text-sm flex justify-between">
                            <span>Duração:</span>
                            <span className="font-medium">{item.duracao} min</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="registros" className="space-y-6">
          {/* Filtros */}
          <div className="flex flex-wrap gap-4">
            <Select value={setorFiltro} onValueChange={setSetorFiltro}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os setores</SelectItem>
                {setores.map(setor => (
                  <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Filtrar por Data
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Dados
            </Button>
          </div>

          {/* Tabela de Dados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                Histórico de Irrigação
              </CardTitle>
              <CardDescription>
                {filteredData.length} registros encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                data={filteredData}
                columns={columns}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para novo sistema */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Novo Sistema de Irrigação</AlertDialogTitle>
            <AlertDialogDescription>
              Configure os parâmetros do novo sistema
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Input 
              placeholder="Nome do Setor" 
              onChange={(e) => setNovoIrrigacao({...novoIrrigacao, setor: e.target.value})}
            />
            <Input 
              placeholder="Volume de Água (L)" 
              type="number" 
              step="0.1"
              onChange={(e) => setNovoIrrigacao({...novoIrrigacao, volume_agua: parseFloat(e.target.value)})}
            />
            <Input 
              placeholder="Duração (min)" 
              type="number" 
              onChange={(e) => setNovoIrrigacao({...novoIrrigacao, duracao: parseInt(e.target.value)})}
            />
            <div className="flex items-center gap-2">
              <Switch 
                id="status"
                onCheckedChange={(checked) => 
                  setNovoIrrigacao({...novoIrrigacao, status: checked ? 'ativo' : 'inativo'})
                }
              />
              <label htmlFor="status">Status Inicial</label>
            </div>
            {/* Aqui poderia ter um select para escolher a fazenda */}
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              Salvar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}