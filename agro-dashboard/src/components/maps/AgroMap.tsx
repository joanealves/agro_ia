"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Layers,
  Download,
  Upload,
  Ruler,
  MapPin,
  Satellite,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings,
  Filter,
  TrendingUp,
  AlertCircle,
  Droplet,
  Bug,
  Leaf,
} from "lucide-react";
import type { LatLngTuple } from "leaflet";

// =============================================================================
// TIPOS
// =============================================================================

interface Fazenda {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  area_total: number;
  cor?: string;
}

interface Talhao {
  id: number;
  fazenda_id: number;
  nome: string;
  area: number;
  geometria: any; // GeoJSON geometry
  cultura_atual?: string;
  status: "ativo" | "inativo" | "em_preparacao";
  cor?: string;
}

interface Praga {
  id: number;
  talhao_id: number;
  tipo: string;
  nivel_severidade: "baixo" | "médio" | "alto" | "crítico";
  latitude: number;
  longitude: number;
  data_registro: string;
}

interface Aplicacao {
  id: number;
  talhao_id: number;
  produto: string;
  tipo: string;
  latitude: number;
  longitude: number;
  data_aplicacao: string;
}

interface LayerConfig {
  fazendas: boolean;
  talhoes: boolean;
  pragas: boolean;
  aplicacoes: boolean;
  heatmap: boolean;
  satellite: boolean;
  ndvi: boolean;
}

interface MapMode {
  type: "view" | "draw" | "measure" | "edit";
  tool?: "polygon" | "marker" | "line" | "circle";
}

// =============================================================================
// IMPORTAÇÕES DINÂMICAS (SSR Fix)
// =============================================================================

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

const Polygon = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polygon),
  { ssr: false }
);

const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

// =============================================================================
// PROVEDORES DE MAPA
// =============================================================================

const MAP_PROVIDERS = {
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  },
  satellite: {
    name: "Satélite (Esri)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
  },
  terrain: {
    name: "Terreno",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "© OpenTopoMap",
  },
  dark: {
    name: "Modo Escuro",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO",
  },
};

// =============================================================================
// CORES E ESTILOS
// =============================================================================

const SEVERITY_COLORS = {
  baixo: "#10b981", // green
  médio: "#f59e0b", // amber
  alto: "#f97316", // orange
  crítico: "#ef4444", // red
};

const STATUS_COLORS = {
  ativo: "#10b981",
  inativo: "#6b7280",
  em_preparacao: "#3b82f6",
};

const CULTURE_COLORS: Record<string, string> = {
  soja: "#fbbf24",
  milho: "#fde047",
  algodao: "#ffffff",
  cafe: "#78350f",
  cana: "#a3e635",
  default: "#22c55e",
};

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

interface AgroMapProps {
  fazendas?: Fazenda[];
  talhoes?: Talhao[];
  pragas?: Praga[];
  aplicacoes?: Aplicacao[];
  initialCenter?: LatLngTuple;
  initialZoom?: number;
  height?: string;
  onTalhaoClick?: (talhao: Talhao) => void;
  onPragaClick?: (praga: Praga) => void;
  showControls?: boolean;
  showLegend?: boolean;
  enableDrawing?: boolean;
  enableMeasurement?: boolean;
}

export default function AgroMap({
  fazendas = [],
  talhoes = [],
  pragas = [],
  aplicacoes = [],
  initialCenter = [-15.7942, -47.8822], // Brasília
  initialZoom = 10,
  height = "600px",
  onTalhaoClick,
  onPragaClick,
  showControls = true,
  showLegend = true,
  enableDrawing = false,
  enableMeasurement = false,
}: AgroMapProps) {
  // =============================================================================
  // ESTADO
  // =============================================================================

  const [mounted, setMounted] = useState(false);
  const [mapProvider, setMapProvider] = useState<keyof typeof MAP_PROVIDERS>("osm");
  const [layers, setLayers] = useState<LayerConfig>({
    fazendas: true,
    talhoes: true,
    pragas: true,
    aplicacoes: false,
    heatmap: false,
    satellite: false,
    ndvi: false,
  });
  const [mode, setMode] = useState<MapMode>({ type: "view" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTalhao, setSelectedTalhao] = useState<number | null>(null);
  const [opacity, setOpacity] = useState(1);
  const [clusterEnabled, setClusterEnabled] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const mapRef = useRef<any>(null);

  // =============================================================================
  // EFEITOS
  // =============================================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // =============================================================================
  // FILTROS E CÁLCULOS
  // =============================================================================

  const filteredTalhoes = useMemo(() => {
    return talhoes.filter((t) =>
      t.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [talhoes, searchTerm]);

  const filteredPragas = useMemo(() => {
    let filtered = pragas;

    if (filterSeverity !== "all") {
      filtered = filtered.filter((p) => p.nivel_severidade === filterSeverity);
    }

    if (dateRange.start) {
      filtered = filtered.filter(
        (p) => new Date(p.data_registro) >= new Date(dateRange.start)
      );
    }

    if (dateRange.end) {
      filtered = filtered.filter(
        (p) => new Date(p.data_registro) <= new Date(dateRange.end)
      );
    }

    return filtered;
  }, [pragas, filterSeverity, dateRange]);

  const statistics = useMemo(() => {
    const totalArea = talhoes.reduce((acc, t) => acc + t.area, 0);
    const pragasCount = pragas.length;
    const talhaosCriticos = talhoes.filter((t) =>
      pragas.some(
        (p) => p.talhao_id === t.id && p.nivel_severidade === "crítico"
      )
    ).length;

    return {
      totalArea: totalArea.toFixed(2),
      totalTalhoes: talhoes.length,
      totalPragas: pragasCount,
      talhaosCriticos,
    };
  }, [talhoes, pragas]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const toggleLayer = useCallback((layer: keyof LayerConfig) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const handleExportGeoJSON = useCallback(() => {
    const geojson = {
      type: "FeatureCollection",
      features: talhoes.map((t) => ({
        type: "Feature",
        properties: {
          id: t.id,
          nome: t.nome,
          area: t.area,
          cultura: t.cultura_atual,
          status: t.status,
        },
        geometry: t.geometria,
      })),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talhoes_${new Date().toISOString().split("T")[0]}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }, [talhoes]);

  const handleCenterMap = useCallback((lat: number, lng: number, zoom = 15) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], zoom);
    }
  }, []);

  const handleFitBounds = useCallback(() => {
    if (mapRef.current && filteredTalhoes.length > 0) {
      const bounds = filteredTalhoes
        .filter((t) => t.geometria?.coordinates)
        .map((t) => {
          const coords = t.geometria.coordinates[0];
          return coords.map((c: [number, number]) => [c[1], c[0]] as LatLngTuple);
        })
        .flat();

      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds);
      }
    }
  }, [filteredTalhoes]);

  // =============================================================================
  // RENDERIZAÇÃO DO MAPA
  // =============================================================================

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center bg-muted rounded-lg"
        style={{ height }}
      >
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ESTATÍSTICAS */}
      {showLegend && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                Área Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statistics.totalArea} ha</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Talhões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statistics.totalTalhoes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bug className="h-4 w-4 text-orange-600" />
                Pragas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statistics.totalPragas}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statistics.talhaosCriticos}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CONTROLES E MAPA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* PAINEL DE CONTROLES */}
        {showControls && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Controles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="layers">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="layers">
                    <Layers className="h-4 w-4 mr-2" />
                    Camadas
                  </TabsTrigger>
                  <TabsTrigger value="filters">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </TabsTrigger>
                </TabsList>

                {/* ABA CAMADAS */}
                <TabsContent value="layers" className="space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="layer-fazendas" className="text-sm">
                        Fazendas
                      </Label>
                      <Switch
                        id="layer-fazendas"
                        checked={layers.fazendas}
                        onCheckedChange={() => toggleLayer("fazendas")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="layer-talhoes" className="text-sm">
                        Talhões
                      </Label>
                      <Switch
                        id="layer-talhoes"
                        checked={layers.talhoes}
                        onCheckedChange={() => toggleLayer("talhoes")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="layer-pragas" className="text-sm">
                        Pragas
                      </Label>
                      <Switch
                        id="layer-pragas"
                        checked={layers.pragas}
                        onCheckedChange={() => toggleLayer("pragas")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="layer-aplicacoes" className="text-sm">
                        Aplicações
                      </Label>
                      <Switch
                        id="layer-aplicacoes"
                        checked={layers.aplicacoes}
                        onCheckedChange={() => toggleLayer("aplicacoes")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="layer-heatmap" className="text-sm">
                        Mapa de Calor
                      </Label>
                      <Switch
                        id="layer-heatmap"
                        checked={layers.heatmap}
                        onCheckedChange={() => toggleLayer("heatmap")}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <Label className="text-sm mb-2 block">
                      Estilo do Mapa
                    </Label>
                    <Select
                      value={mapProvider}
                      onValueChange={(value: any) => setMapProvider(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(MAP_PROVIDERS).map(([key, provider]) => (
                          <SelectItem key={key} value={key}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-3 border-t">
                    <Label className="text-sm mb-2 block">
                      Opacidade: {opacity.toFixed(2)}
                    </Label>
                    <Slider
                      value={[opacity]}
                      onValueChange={([value]) => setOpacity(value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cluster" className="text-sm">
                        Agrupar Marcadores
                      </Label>
                      <Switch
                        id="cluster"
                        checked={clusterEnabled}
                        onCheckedChange={setClusterEnabled}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* ABA FILTROS */}
                <TabsContent value="filters" className="space-y-3">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="search" className="text-sm mb-2 block">
                        Buscar Talhão
                      </Label>
                      <Input
                        id="search"
                        placeholder="Nome do talhão..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">
                        Severidade de Pragas
                      </Label>
                      <Select
                        value={filterSeverity}
                        onValueChange={setFilterSeverity}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="baixo">Baixo</SelectItem>
                          <SelectItem value="médio">Médio</SelectItem>
                          <SelectItem value="alto">Alto</SelectItem>
                          <SelectItem value="crítico">Crítico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">
                        Período
                      </Label>
                      <div className="space-y-2">
                        <Input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              start: e.target.value,
                            }))
                          }
                        />
                        <Input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              end: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterSeverity("all");
                        setDateRange({ start: "", end: "" });
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* AÇÕES */}
              <div className="pt-4 border-t space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleFitBounds}
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Ajustar Visualização
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleExportGeoJSON}
                  disabled={talhoes.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar GeoJSON
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* MAPA */}
        <div className={showControls ? "lg:col-span-3" : "lg:col-span-4"}>
          <Card>
            <CardContent className="p-0">
              <div style={{ height, position: "relative" }}>
                <MapContainer
                  ref={mapRef}
                  center={initialCenter}
                  zoom={initialZoom}
                  style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
                  zoomControl={true}
                >
                  {/* TILE LAYER */}
                  <TileLayer
                    url={MAP_PROVIDERS[mapProvider].url}
                    attribution={MAP_PROVIDERS[mapProvider].attribution}
                  />

                  {/* TALHÕES */}
                  {layers.talhoes &&
                    filteredTalhoes.map((talhao) => {
                      if (!talhao.geometria?.coordinates) return null;

                      const positions = talhao.geometria.coordinates[0].map(
                        (coord: [number, number]) => [coord[1], coord[0]] as LatLngTuple
                      );

                      const color =
                        talhao.cultura_atual
                          ? CULTURE_COLORS[talhao.cultura_atual.toLowerCase()] ||
                            CULTURE_COLORS.default
                          : STATUS_COLORS[talhao.status];

                      return (
                        <Polygon
                          key={`talhao-${talhao.id}`}
                          positions={positions}
                          pathOptions={{
                            color: color,
                            fillColor: color,
                            fillOpacity: opacity * 0.3,
                            weight: selectedTalhao === talhao.id ? 3 : 2,
                          }}
                          eventHandlers={{
                            click: () => {
                              setSelectedTalhao(talhao.id);
                              onTalhaoClick?.(talhao);
                            },
                          }}
                        >
                          <Popup>
                            <div className="p-2">
                              <h3 className="font-bold text-lg">{talhao.nome}</h3>
                              <p className="text-sm text-muted-foreground">
                                Área: {talhao.area.toFixed(2)} ha
                              </p>
                              {talhao.cultura_atual && (
                                <p className="text-sm">
                                  Cultura: {talhao.cultura_atual}
                                </p>
                              )}
                              <Badge
                                variant={
                                  talhao.status === "ativo"
                                    ? "default"
                                    : "secondary"
                                }
                                className="mt-2"
                              >
                                {talhao.status}
                              </Badge>
                            </div>
                          </Popup>
                        </Polygon>
                      );
                    })}

                  {/* PRAGAS */}
                  {layers.pragas &&
                    filteredPragas.map((praga) => (
                      <Circle
                        key={`praga-${praga.id}`}
                        center={[praga.latitude, praga.longitude]}
                        radius={50}
                        pathOptions={{
                          color: SEVERITY_COLORS[praga.nivel_severidade],
                          fillColor: SEVERITY_COLORS[praga.nivel_severidade],
                          fillOpacity: opacity * 0.6,
                          weight: 2,
                        }}
                        eventHandlers={{
                          click: () => onPragaClick?.(praga),
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold">{praga.tipo}</h3>
                            <Badge
                              style={{
                                backgroundColor:
                                  SEVERITY_COLORS[praga.nivel_severidade],
                              }}
                              className="mt-2"
                            >
                              {praga.nivel_severidade}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              {new Date(praga.data_registro).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </Popup>
                      </Circle>
                    ))}

                  {/* APLICAÇÕES */}
                  {layers.aplicacoes &&
                    aplicacoes.map((app) => (
                      <Marker
                        key={`app-${app.id}`}
                        position={[app.latitude, app.longitude]}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold">{app.produto}</h3>
                            <p className="text-sm">Tipo: {app.tipo}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(app.data_aplicacao).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>

                {/* LEGENDA FLUTUANTE */}
                {showLegend && (
                  <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border z-[1000]">
                    <p className="text-xs font-semibold mb-2">Legenda</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: SEVERITY_COLORS.crítico }}
                        />
                        <span>Crítico</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: SEVERITY_COLORS.alto }}
                        />
                        <span>Alto</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: SEVERITY_COLORS.médio }}
                        />
                        <span>Médio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: SEVERITY_COLORS.baixo }}
                        />
                        <span>Baixo</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Export components individuais
export { MAP_PROVIDERS, SEVERITY_COLORS, STATUS_COLORS, CULTURE_COLORS };
export type { LayerConfig, MapMode, Fazenda, Talhao, Praga, Aplicacao };