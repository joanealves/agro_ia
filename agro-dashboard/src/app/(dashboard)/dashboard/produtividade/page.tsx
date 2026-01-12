'use client';

import { useEffect, useState } from 'react';
import { PlaneTakeoff, LineChart, Filter, Search, Plus, Download } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '../../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import api from '../../../../lib/api';
import { AreaChartCard } from '../../../../components/dashboard/area-chart';
import { DataTable } from '../../../../components/ui/data-table';

interface DadosProdutividade {
  id: number;
  cultura: string;
  area: number;
  produtividade: number;
  data: string;
  fazenda: {
    id: number;
    nome: string;
  };
}

export default function ProdutividadePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dadosProdutividade, setDadosProdutividade] = useState<DadosProdutividade[]>([]);
  const [filtro, setFiltro] = useState('');
  const [culturaFiltro, setCulturaFiltro] = useState('todas');
  const [periodoFiltro, setPeriodoFiltro] = useState('ultimos3meses');
  const [showDialog, setShowDialog] = useState(false);
  const [novoProdutividade, setNovoProdutividade] = useState({
    cultura: '',
    area: 0,
    produtividade: 0,
    fazenda_id: 1
  });

  // Dados para o gráfico
  const dadosGrafico = [
    { date: "Jan", value: 2500, meta: 2700 },
    { date: "Fev", value: 2800, meta: 2700 },
    { date: "Mar", value: 3200, meta: 2900 },
    { date: "Abr", value: 3100, meta: 3000 },
    { date: "Mai", value: 3500, meta: 3200 },
    { date: "Jun", value: 3700, meta: 3400 },
  ];

  useEffect(() => {
    const fetchProdutividade = async () => {
      try {
        const response = await api.get('/produtividade/');
        setDadosProdutividade(response.data);
      } catch (error) {
        console.error('Erro ao carregar dados de produtividade:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProdutividade();
  }, []);

  const handleCreate = async () => {
    try {
      const response = await api.post('/produtividade/', novoProdutividade);
      setDadosProdutividade([...dadosProdutividade, response.data]);
      setShowDialog(false);
    } catch (error) {
      console.error('Erro ao criar registro de produtividade:', error);
    }
  };

  const filteredData = dadosProdutividade.filter(item => {
    const matchesSearch = item.cultura.toLowerCase().includes(filtro.toLowerCase());
    const matchesCultura = culturaFiltro === 'todas' || item.cultura === culturaFiltro;
    // Aqui você implementaria a lógica para o filtro de período
    return matchesSearch && matchesCultura;
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
    { header: 'Cultura', accessor: 'cultura' },
    { header: 'Área (ha)', accessor: 'area' },
    { header: 'Produtividade (kg/ha)', accessor: 'produtividade' },
    { header: 'Fazenda', accessor: 'fazenda.nome' },
    { header: 'Data', accessor: 'data', cell: (value: string) => new Date(value).toLocaleDateString() }
  ];

  const culturas = [...new Set(dadosProdutividade.map(item => item.cultura))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Produtividade</h1>
          <p className="text-muted-foreground">Monitoramento e análise da produtividade por cultura</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cultura..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10 w-full md:w-[200px]"
            />
          </div>
          <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Registro
          </Button>
        </div>
      </div>

      {/* Gráficos de Produtividade */}
      <div className="grid gap-4 md:grid-cols-1">
        <AreaChartCard
          title="Produtividade por Período"
          data={dadosGrafico}
          dataKey="value"
          gradientFrom="hsl(var(--primary))"
          gradientTo="hsl(var(--primary)/0.2)"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <Select value={culturaFiltro} onValueChange={setCulturaFiltro}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione a cultura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as culturas</SelectItem>
            {culturas.map(cultura => (
              <SelectItem key={cultura} value={cultura}>{cultura}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ultimos3meses">Últimos 3 meses</SelectItem>
            <SelectItem value="ultimos6meses">Últimos 6 meses</SelectItem>
            <SelectItem value="ultimo1ano">Último ano</SelectItem>
            <SelectItem value="todos">Todos os registros</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* Tabela de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plant className="h-5 w-5 text-primary" />
            Registros de Produtividade
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

      {/* Modal para novo registro */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Novo Registro de Produtividade</AlertDialogTitle>
            <AlertDialogDescription>
              Preencha os dados do novo registro de produtividade
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Cultura"
              onChange={(e) => setNovoProdutividade({ ...novoProdutividade, cultura: e.target.value })}
            />
            <Input
              placeholder="Área (ha)"
              type="number"
              step="0.01"
              onChange={(e) => setNovoProdutividade({ ...novoProdutividade, area: parseFloat(e.target.value) })}
            />
            <Input
              placeholder="Produtividade (kg/ha)"
              type="number"
              step="0.01"
              onChange={(e) => setNovoProdutividade({ ...novoProdutividade, produtividade: parseFloat(e.target.value) })}
            />
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