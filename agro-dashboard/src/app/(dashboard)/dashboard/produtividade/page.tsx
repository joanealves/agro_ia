'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Download, Leaf } from 'lucide-react';
import { createClient } from "@supabase/supabase-js";

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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";

import { AreaChartCard } from '../../../../components/dashboard/area-chart';
import { DataTable } from '../../../../components/ui/data-table';

// 🔥 SUPABASE CLIENT DIRETO (SIMPLES)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🔥 TIPAGEM REAL DO SUPABASE (RELATION = ARRAY)
interface DadosProdutividade {
  id: number;
  cultura: string;
  area: number;
  produtividade: number;
  data: string;
  fazenda_fazenda: {
    id: number;
    nome: string;
  }[];
}

export default function ProdutividadePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dadosProdutividade, setDadosProdutividade] = useState<DadosProdutividade[]>([]);
  const [filtro, setFiltro] = useState('');
  const [culturaFiltro, setCulturaFiltro] = useState('todas');
  const [showDialog, setShowDialog] = useState(false);
  const [novoProdutividade, setNovoProdutividade] = useState({
    cultura: '',
    area: 0,
    produtividade: 0,
    fazenda_id: 1
  });

  // fake (só visual)
  const dadosGrafico = [
    { date: "Jan", value: 2500, meta: 2700 },
    { date: "Fev", value: 2800, meta: 2700 },
    { date: "Mar", value: 3200, meta: 2900 },
    { date: "Abr", value: 3100, meta: 3000 },
    { date: "Mai", value: 3500, meta: 3200 },
    { date: "Jun", value: 3700, meta: 3400 },
  ];

  // 🔥 BUSCA REAL
  useEffect(() => {
    const fetchProdutividade = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("produtividade_dadosprodutividade")
        .select(`
          id,
          cultura,
          area,
          produtividade,
          data,
          fazenda_fazenda (
            id,
            nome
          )
        `)
        .order("data", { ascending: false });

      if (error) {
        console.error("Erro Supabase:", error);
      } else {
        setDadosProdutividade(data || []);
      }

      setIsLoading(false);
    };

    fetchProdutividade();
  }, []);

  // 🔥 INSERT REAL
  const handleCreate = async () => {
    const { data, error } = await supabase
      .from("produtividade_dadosprodutividade")
      .insert([novoProdutividade])
      .select(`
        id,
        cultura,
        area,
        produtividade,
        data,
        fazenda_fazenda (
          id,
          nome
        )
      `)
      .single();

    if (error) {
      console.error("Erro insert:", error);
      return;
    }

    setDadosProdutividade([data, ...dadosProdutividade]);
    setShowDialog(false);
  };

  const filteredData = dadosProdutividade.filter(item => {
    const matchesSearch = item.cultura.toLowerCase().includes(filtro.toLowerCase());
    const matchesCultura = culturaFiltro === 'todas' || item.cultura === culturaFiltro;
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

  // 🔥 SEM BRIGA COM DATATABLE
  const columns: any[] = [
    { header: 'Cultura', accessor: 'cultura' },
    { header: 'Área (ha)', accessor: 'area' },
    { header: 'Produtividade (kg/ha)', accessor: 'produtividade' },
    { header: 'Fazenda', accessor: 'fazenda_fazenda.0.nome' },
    {
      header: 'Data',
      accessor: 'data',
      cell: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const culturas = Array.from(
    new Set(dadosProdutividade.map(item => item.cultura))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Produtividade</h1>
          <p className="text-muted-foreground">Monitoramento agrícola</p>
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
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Registro
          </Button>
        </div>
      </div>

      <AreaChartCard
        title="Produtividade por período"
        data={dadosGrafico}
        dataKey="value"
        gradientFrom="hsl(var(--primary))"
        gradientTo="hsl(var(--primary)/0.2)"
      />

      <div className="flex flex-wrap gap-4">
        <Select value={culturaFiltro} onValueChange={setCulturaFiltro}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione a cultura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {culturas.map(cultura => (
              <SelectItem key={cultura} value={cultura}>{cultura}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Registros
          </CardTitle>
          <CardDescription>
            {filteredData.length} registros encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={filteredData} columns={columns} />
        </CardContent>
      </Card>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Novo Registro</AlertDialogTitle>
            <AlertDialogDescription>
              Adicione a produtividade da cultura
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <Input placeholder="Cultura" onChange={(e) => setNovoProdutividade({ ...novoProdutividade, cultura: e.target.value })} />
            <Input type="number" placeholder="Área (ha)" onChange={(e) => setNovoProdutividade({ ...novoProdutividade, area: Number(e.target.value) })} />
            <Input type="number" placeholder="Produtividade (kg/ha)" onChange={(e) => setNovoProdutividade({ ...novoProdutividade, produtividade: Number(e.target.value) })} />
          </div>

          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Salvar</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
