'use client';

import { useEffect, useState } from 'react';
import { Map, MapPin, Layers, Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import  api  from '../../../lib/api';
import { DataTable } from '../../../components/ui/data-table';

// Nota: Este é um componente fictício para demonstração
// Em um projeto real, você usaria uma biblioteca de mapas como react-leaflet
const MapComponent = () => (
  <div className="w-full h-[500px] bg-muted relative rounded-md overflow-hidden flex items-center justify-center">
    <div className="absolute inset-0 p-4">
      <div className="absolute top-4 left-4 z-10 p-2 bg-white rounded-md shadow-md">
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Layers className="h-4 w-4 mr-1" />
            Camadas
          </Button>
          <Button size="sm" variant="outline">
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>
        </div>
      </div>
    </div>
    <div className="text-center text-muted-foreground">
      <Map className="h-12 w-12 mx-auto mb-2 text-primary" />
      <p>Aqui seria renderizado o componente de mapa real</p>
      <p className="text-sm">(Este é apenas um placeholder para demonstração)</p>
    </div>
  </div>
);

interface MapaData {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  zoom: number;
  data_criacao: string;
  fazenda: {
    id: number;
    nome: string;
  };
}

export default function MapasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mapas, setMapas] = useState<MapaData[]>([]);
  const [filtro, setFiltro] = useState('');
  const [selectedMapa, setSelectedMapa] = useState<MapaData | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [novoMapa, setNovoMapa] = useState({
    nome: '',
    latitude: 0,
    longitude: 0,
    zoom: 10,
    fazenda_id: 1
  });

  useEffect(() => {
    const fetchMapas = async () => {
      try {
        const response = await api.get('/maps/');
        setMapas(response.data);
        if (response.data.length > 0) {
          setSelectedMapa(response.data[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar mapas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapas();
  }, []);

  const handleCreate = async () => {
    try {
      const response = await api.post('/maps/', novoMapa);
      setMapas([...mapas, response.data]);
      setSelectedMapa(response.data);
      setShowDialog(false);
    } catch (error) {
      console.error('Erro ao criar mapa:', error);
    }
  };

  const filteredMapas = mapas.filter(item => 
    item.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    item.fazenda.nome.toLowerCase().includes(filtro.toLowerCase())
  );

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
    { header: 'Nome', accessor: 'nome' },
    { header: 'Fazenda', accessor: 'fazenda.nome' },
    { 
      header: 'Coordenadas', 
      accessor: 'id', 
      cell: (_: any, row: MapaData) => `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`
    },
    { header: 'Zoom', accessor: 'zoom' },
    { 
      header: 'Data de Criação', 
      accessor: 'data_criacao', 
      cell: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      header: 'Ações',
      accessor: 'id',
      cell: (_: any, row: MapaData) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setSelectedMapa(row)}
        >
          <MapPin className="h-4 w-4 mr-1" />
          Visual