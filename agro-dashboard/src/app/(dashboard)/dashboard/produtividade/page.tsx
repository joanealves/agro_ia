'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Download, Leaf, Loader2, AlertCircle } from 'lucide-react';
import { 
  getDadosProdutividade, 
  createDadosProdutividade,
  getProdutividadeSeriesTemporal,
} from '../../../../lib/api';

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
import { Alert, AlertDescription } from "../../../../components/ui/alert";

import { AreaChartCard } from '../../../../components/dashboard/area-chart';
import { DataTable } from '../../../../components/ui/data-table';
import { DadosProdutividade, ProdutividadeCreate } from '@/src/types';

export default function ProdutividadePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dadosProdutividade, setDadosProdutividade] = useState<DadosProdutividade[]>([]);
  const [seriesTemporal, setSeriesTemporal] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('');
  const [culturaFiltro, setCulturaFiltro] = useState('todas');
  const [showDialog, setShowDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [novoProdutividade, setNovoProdutividade] = useState<ProdutividadeCreate>({
    cultura: '',
    area: 0,
    produtividade: 0,
    fazenda_id: 1,
    data: new Date().toISOString().split('T')[0]
  });

  // 🔥 BUSCAR DADOS
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar lista de produtividade
      const dados = await getDadosProdutividade();
      setDadosProdutividade(dados);

      // Buscar série temporal para o gráfico
      const serie = await getProdutividadeSeriesTemporal();
      
      // Transformar dados para o formato do gráfico
      const dadosGrafico = serie.dados.slice(-6).map((item: any) => ({
        date: new Date(item.data).toLocaleDateString('pt-BR', { month: 'short' }),
        value: item.produtividade,
        meta: item.produtividade * 1.1 // Meta fictícia 10% acima
      }));
      
      setSeriesTemporal(dadosGrafico);
    } catch (err: any) {
      console.error("Erro ao buscar dados:", err);
      setError("Erro ao carregar dados. Verifique se o backend está rodando.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 CRIAR NOVO REGISTRO
  const handleCreate = async () => {
    // Validação básica
    if (!novoProdutividade.cultura || !novoProdutividade.area || !novoProdutividade.produtividade) {
      alert('Preencha todos os campos!');
      return;
    }

    setIsSaving(true);
    try {
      const novoRegistro = await createDadosProdutividade(novoProdutividade);
      
      // Adicionar novo registro no topo da lista
      setDadosProdutividade([novoRegistro, ...dadosProdutividade]);
      
      // Fechar dialog e limpar form
      setShowDialog(false);
      setNovoProdutividade({
        cultura: '',
        area: 0,
        produtividade: 0,
        fazenda_id: 1,
        data: new Date().toISOString().split('T')[0]
      });

      // Recarregar série temporal
      await fetchData();
    } catch (err: any) {
      console.error("Erro ao criar registro:", err);
      alert(err.response?.data?.message || 'Erro ao salvar registro');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtros
  const filteredData = dadosProdutividade.filter(item => {
    const matchesSearch = item.cultura.toLowerCase().includes(filtro.toLowerCase());
    const matchesCultura = culturaFiltro === 'todas' || item.cultura === culturaFiltro;
    return matchesSearch && matchesCultura;
  });

  // Culturas únicas para o filtro
  const culturas = Array.from(
    new Set(dadosProdutividade.map(item => item.cultura))
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Colunas da tabela
  const columns = [
    { header: 'Cultura', accessor: 'cultura' },
    { 
      header: 'Área (ha)', 
      accessor: 'area',
      cell: (value: any) => {
        const num = typeof value === 'number' ? value : parseFloat(value);
        return !isNaN(num) ? num.toFixed(2) : '0.00';
      }
    },
    { 
      header: 'Produtividade (kg/ha)', 
      accessor: 'produtividade',
      cell: (value: any) => {
        const num = typeof value === 'number' ? value : parseFloat(value);
        return !isNaN(num) ? num.toFixed(0) : '0';
      }
    },
    { 
      header: 'Fazenda', 
      accessor: 'fazenda',
      cell: (value: any) => value?.nome || 'N/A'
    },
    {
      header: 'Data',
      accessor: 'data',
      cell: (value: string) => {
        try {
          return new Date(value).toLocaleDateString('pt-BR');
        } catch {
          return value;
        }
      }
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Gráfico de série temporal */}
      {seriesTemporal.length > 0 && (
        <AreaChartCard
          title="Produtividade por período"
          data={seriesTemporal}
          dataKey="value"
          gradientFrom="hsl(var(--primary))"
          gradientTo="hsl(var(--primary)/0.2)"
        />
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <Select value={culturaFiltro} onValueChange={setCulturaFiltro}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione a cultura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as culturas</SelectItem>
            {culturas.map(cultura => (
              <SelectItem key={cultura} value={cultura}>
                {cultura}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Tabela de dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Registros de Produtividade
          </CardTitle>
          <CardDescription>
            {filteredData.length} registro{filteredData.length !== 1 ? 's' : ''} encontrado{filteredData.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredData.length > 0 ? (
            <DataTable data={filteredData} columns={columns} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para novo registro */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Novo Registro de Produtividade</AlertDialogTitle>
            <AlertDialogDescription>
              Adicione os dados de produtividade da cultura
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Cultura</label>
              <Input 
                placeholder="Ex: Soja, Milho, Café..." 
                value={novoProdutividade.cultura}
                onChange={(e) => setNovoProdutividade({ 
                  ...novoProdutividade, 
                  cultura: e.target.value 
                })} 
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Área (hectares)</label>
              <Input 
                type="number" 
                step="0.01"
                placeholder="Ex: 10.5" 
                value={novoProdutividade.area || ''}
                onChange={(e) => setNovoProdutividade({ 
                  ...novoProdutividade, 
                  area: parseFloat(e.target.value) || 0
                })} 
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Produtividade (kg/ha)</label>
              <Input 
                type="number" 
                step="0.01"
                placeholder="Ex: 3500" 
                value={novoProdutividade.produtividade || ''}
                onChange={(e) => setNovoProdutividade({ 
                  ...novoProdutividade, 
                  produtividade: parseFloat(e.target.value) || 0
                })} 
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data</label>
              <Input 
                type="date"
                value={novoProdutividade.data}
                onChange={(e) => setNovoProdutividade({ 
                  ...novoProdutividade, 
                  data: e.target.value 
                })} 
              />
            </div>
          </div>

          <AlertDialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}