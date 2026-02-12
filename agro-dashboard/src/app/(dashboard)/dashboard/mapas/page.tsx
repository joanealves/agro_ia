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
import dynamic from "next/dynamic";
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

import api, { getFazendas } from "../../../../lib/api";

// =============================================================================
// MAP EDITOR (dinâmico para evitar SSR)
const MapEditor = dynamic(() => import("../../../../components/maps/MapEditor"), { ssr: false });

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
  const [fazendas, setFazendas] = useState<any[]>([]);
  const [selectedFazenda, setSelectedFazenda] = useState<any | null>(null);
  const [filtro, setFiltro] = useState("");
  const [selectedMapa, setSelectedMapa] = useState<MapaData | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [novoMapa, setNovoMapa] = useState({ nome: "", latitude: 0, longitude: 0, zoom: 10, fazenda_id: undefined as number | undefined });

  useEffect(() => {
    const fetchFazendas = async () => {
      const fazendasData = await getFazendas();
      setFazendas(fazendasData);
      if (fazendasData.length > 0) {
        setSelectedFazenda(fazendasData[0]);
      }
    };
    fetchFazendas();
  }, []);

  useEffect(() => {
    if (!selectedFazenda) {
      setMapas([]);
      setSelectedMapa(null);
      return;
    }
    const fetchMapas = async () => {
      try {
        const response = await api.get(`/api/maps/fazenda/${selectedFazenda.id}/mapas/`);
        setMapas(response.data);
        if (response.data.length > 0) {
          setSelectedMapa(response.data[0]);
        } else {
          setSelectedMapa(null);
        }
      } catch (error) {
        setMapas([]);
        setSelectedMapa(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMapas();
  }, [selectedFazenda]);

  const handleCreate = async () => {
    try {
      let fazendaId = novoMapa.fazenda_id;
      if (!fazendaId) {
        if (mapas.length > 0) {
          fazendaId = mapas[0].fazenda.id;
        } else {
          alert("Nenhuma fazenda disponível para associar ao mapa. Cadastre uma fazenda primeiro.");
          return;
        }
      }
      const response = await api.post(`/api/maps/fazenda/${fazendaId}/mapas/`, {
        nome: novoMapa.nome,
        latitude: novoMapa.latitude,
        longitude: novoMapa.longitude,
        zoom: novoMapa.zoom,
      });
      setMapas((prev) => [...prev, response.data]);
      setSelectedMapa(response.data);
      setShowDialog(false);
      setNovoMapa({ nome: "", latitude: 0, longitude: 0, zoom: 10, fazenda_id: fazendaId });
    } catch (error) {
      console.error("Erro ao criar mapa:", error);
    }
  };

  const filteredMapas = mapas.filter(
    (item) =>
      item.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      item.fazenda.nome.toLowerCase().includes(filtro.toLowerCase())
  );

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
        {fazendas.length > 0 && selectedFazenda && (
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo mapa
          </Button>
        )}
      </div>

      {/* Seleção de Fazenda */}
      {fazendas.length > 0 && (
        <div className="mb-4">
          <label className="mr-2">Fazenda:</label>
          <select
            value={selectedFazenda?.id || ''}
            onChange={e => {
              const fazenda = fazendas.find(f => f.id === Number(e.target.value));
              setSelectedFazenda(fazenda || null);
            }}
          >
            {fazendas.map(fazenda => (
              <option key={fazenda.id} value={fazenda.id}>{fazenda.nome}</option>
            ))}
          </select>
        </div>
      )}

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
              {selectedFazenda && selectedFazenda.id ? (
                <MapEditor fazendaId={selectedFazenda.id} />
              ) : (
                <div className="w-full h-[500px] flex items-center justify-center text-muted-foreground">
                  Cadastre e selecione uma fazenda para visualizar mapas.
                </div>
              )}
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
              Para criar um novo mapa, feche este diálogo e desenhe uma área ou marcador diretamente no mapa abaixo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDialog(false)}>
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
