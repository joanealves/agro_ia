"use client";

import { useEffect, useState } from "react";
import {
  Map,
  MapPin,
  Layers,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Card,
  CardContent,
} from "../../../../components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import { DataTable } from "../../../../components/ui/data-table";

import api from "../../../../lib/api";

// =============================================================================
// MAP PLACEHOLDER
// =============================================================================

const MapComponent = () => (
  <div className="w-full h-[500px] bg-muted relative rounded-md overflow-hidden flex items-center justify-center">
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

    <div className="text-center text-muted-foreground">
      <Map className="h-12 w-12 mx-auto mb-2 text-primary" />
      <p>Aqui seria renderizado o mapa real</p>
      <p className="text-sm">(placeholder)</p>
    </div>
  </div>
);

// =============================================================================
// TYPES
// =============================================================================

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

// =============================================================================
// PAGE
// =============================================================================

export default function MapasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mapas, setMapas] = useState<MapaData[]>([]);
  const [filtro, setFiltro] = useState("");
  const [selectedMapa, setSelectedMapa] = useState<MapaData | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const [novoMapa, setNovoMapa] = useState({
    nome: "",
    latitude: 0,
    longitude: 0,
    zoom: 10,
    fazenda_id: 1,
  });

  // =============================================================================
  // FETCH
  // =============================================================================

  useEffect(() => {
    const fetchMapas = async () => {
      try {
        const response = await api.get("/maps/");
        setMapas(response.data);
        if (response.data.length > 0) {
          setSelectedMapa(response.data[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar mapas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapas();
  }, []);

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const handleCreate = async () => {
    try {
      const response = await api.post("/maps/", novoMapa);
      setMapas((prev) => [...prev, response.data]);
      setSelectedMapa(response.data);
      setShowDialog(false);
    } catch (error) {
      console.error("Erro ao criar mapa:", error);
    }
  };

  const filteredMapas = mapas.filter(
    (item) =>
      item.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      item.fazenda.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  // =============================================================================
  // TABLE COLUMNS (TanStack v8 ✔)
  // =============================================================================

  const columns: ColumnDef<MapaData>[] = [
    {
      header: "Nome",
      accessorKey: "nome",
    },
    {
      header: "Fazenda",
      accessorFn: (row) => row.fazenda.nome,
      id: "fazenda",
    },
    {
      header: "Coordenadas",
      accessorFn: (row) =>
        `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`,
      id: "coordenadas",
    },
    {
      header: "Zoom",
      accessorKey: "zoom",
    },
    {
      header: "Data de Criação",
      accessorKey: "data_criacao",
      cell: (info) =>
        new Date(info.getValue() as string).toLocaleDateString(),
    },
    {
      header: "Ações",
      id: "acoes",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedMapa(row.original)}
        >
          <MapPin className="h-4 w-4 mr-1" />
          Visualizar
        </Button>
      ),
    },
  ];

  // =============================================================================
  // LOADING
  // =============================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-64 w-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mapas</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie os mapas das fazendas.
          </p>
        </div>

        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo mapa
        </Button>
      </div>

      {/* Filtro */}
      <div className="relative w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar mapa ou fazenda..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Conteúdo */}
      <Tabs defaultValue="lista">
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="mapa">Mapa</TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <Card>
            <CardContent className="pt-6">
              <DataTable columns={columns} data={filteredMapas} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapa">
          <Card>
            <CardContent className="pt-6">
              <MapComponent />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Novo mapa</AlertDialogTitle>
            <AlertDialogDescription>
              Informe os dados do novo mapa.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Nome"
              value={novoMapa.nome}
              onChange={(e) =>
                setNovoMapa({ ...novoMapa, nome: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Latitude"
              value={novoMapa.latitude}
              onChange={(e) =>
                setNovoMapa({
                  ...novoMapa,
                  latitude: Number(e.target.value),
                })
              }
            />
            <Input
              type="number"
              placeholder="Longitude"
              value={novoMapa.longitude}
              onChange={(e) =>
                setNovoMapa({
                  ...novoMapa,
                  longitude: Number(e.target.value),
                })
              }
            />
            <Input
              type="number"
              placeholder="Zoom"
              value={novoMapa.zoom}
              onChange={(e) =>
                setNovoMapa({
                  ...novoMapa,
                  zoom: Number(e.target.value),
                })
              }
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCreate}>
              Criar mapa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
