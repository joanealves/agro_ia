"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { useToast } from "@/src/hooks/use-toast";
import {
  Edit3,
  Trash2,
  Save,
  X,
  Maximize2,
  Square,
  Circle as CircleIcon,
  Pencil,
  Undo,
  Redo,
  Download,
  Upload,
  Ruler,
  MapPin,
} from "lucide-react";
import type { LatLngTuple } from "leaflet";

// =============================================================================
// TIPOS
// =============================================================================

interface TalhaoData {
  id?: number;
  nome: string;
  fazenda_id: number;
  area: number;
  tipo_solo?: string;
  cultura_atual?: string;
  status: "ativo" | "inativo" | "em_preparacao";
  observacoes?: string;
  geometria: any; // GeoJSON geometry
}

interface DrawingTool {
  type: "polygon" | "rectangle" | "circle" | "marker" | "edit" | "delete";
  active: boolean;
}

interface MeasurementData {
  area: number;
  perimeter: number;
  centroid: LatLngTuple;
}

// =============================================================================
// COMPONENTE
// =============================================================================

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const FeatureGroup = dynamic(
  () => import("react-leaflet").then((mod) => mod.FeatureGroup),
  { ssr: false }
);

interface TalhaoEditorProps {
  fazendaId: number;
  initialTalhao?: TalhaoData;
  onSave: (talhao: TalhaoData) => Promise<void>;
  onCancel: () => void;
  mode?: "create" | "edit";
}

export default function TalhaoEditor({
  fazendaId,
  initialTalhao,
  onSave,
  onCancel,
  mode = "create",
}: TalhaoEditorProps) {
  // =============================================================================
  // ESTADO
  // =============================================================================

  const [mounted, setMounted] = useState(false);
  const [talhao, setTalhao] = useState<TalhaoData>(
    initialTalhao || {
      nome: "",
      fazenda_id: fazendaId,
      area: 0,
      status: "ativo",
      geometria: null,
    }
  );
  const [drawingTool, setDrawingTool] = useState<DrawingTool>({
    type: "polygon",
    active: false,
  });
  const [measurements, setMeasurements] = useState<MeasurementData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saving, setSaving] = useState(false);
  const mapRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);
  const { toast } = useToast();

  // =============================================================================
  // EFEITOS
  // =============================================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (talhao.geometria) {
      calculateMeasurements();
    }
  }, [talhao.geometria]);

  // =============================================================================
  // CÁLCULOS
  // =============================================================================

  const calculateMeasurements = useCallback(() => {
    if (!talhao.geometria?.coordinates) return;

    // Calcular área (aproximação simples)
    const coords = talhao.geometria.coordinates[0];
    let area = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      area += x1 * y2 - x2 * y1;
    }
    area = Math.abs(area / 2);

    // Converter para hectares (aproximação)
    const areaHectares = area * 111 * 111; // Conversão graus para km, depois para hectares

    // Calcular perímetro
    let perimeter = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      const dx = x2 - x1;
      const dy = y2 - y1;
      perimeter += Math.sqrt(dx * dx + dy * dy) * 111; // Conversão para km
    }

    // Calcular centroide
    const sumX = coords.reduce((acc: number, c: [number, number]) => acc + c[0], 0);
    const sumY = coords.reduce((acc: number, c: [number, number]) => acc + c[1], 0);
    const centroid: LatLngTuple = [sumY / coords.length, sumX / coords.length];

    setMeasurements({
      area: areaHectares,
      perimeter: perimeter,
      centroid: centroid,
    });

    // Atualizar área no talhão
    setTalhao((prev) => ({ ...prev, area: areaHectares }));
  }, [talhao.geometria]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleDrawStart = useCallback((toolType: DrawingTool["type"]) => {
    setDrawingTool({ type: toolType, active: true });
  }, []);

  const handleDrawComplete = useCallback((layer: any) => {
    const geojson = layer.toGeoJSON();
    
    setTalhao((prev) => ({
      ...prev,
      geometria: geojson.geometry,
    }));

    // Adicionar ao histórico
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), geojson.geometry]);
    setHistoryIndex((prev) => prev + 1);

    setDrawingTool((prev) => ({ ...prev, active: false }));

    toast({
      title: "Polígono desenhado",
      description: "Área calculada automaticamente",
    });
  }, [historyIndex, toast]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setTalhao((prev) => ({
        ...prev,
        geometria: history[historyIndex - 1],
      }));
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setTalhao((prev) => ({
        ...prev,
        geometria: history[historyIndex + 1],
      }));
    }
  }, [history, historyIndex]);

  const handleExportGeoJSON = useCallback(() => {
    if (!talhao.geometria) {
      toast({
        title: "Erro",
        description: "Nenhuma geometria para exportar",
        variant: "destructive",
      });
      return;
    }

    const geojson = {
      type: "Feature",
      properties: {
        nome: talhao.nome,
        area: talhao.area,
        cultura: talhao.cultura_atual,
        status: talhao.status,
      },
      geometry: talhao.geometria,
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talhao_${talhao.nome.replace(/\s+/g, "_")}.geojson`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado",
      description: "GeoJSON baixado com sucesso",
    });
  }, [talhao, toast]);

  const handleImportGeoJSON = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const geojson = JSON.parse(e.target?.result as string);
        
        if (geojson.type === "Feature" && geojson.geometry) {
          setTalhao((prev) => ({
            ...prev,
            geometria: geojson.geometry,
            nome: geojson.properties?.nome || prev.nome,
          }));

          toast({
            title: "Importado",
            description: "GeoJSON carregado com sucesso",
          });
        } else {
          throw new Error("Formato inválido");
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Arquivo GeoJSON inválido",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  }, [toast]);

  const handleSave = async () => {
    // Validações
    if (!talhao.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do talhão é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!talhao.geometria) {
      toast({
        title: "Erro",
        description: "Desenhe o talhão no mapa",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(talhao);
      toast({
        title: "Sucesso",
        description: `Talhão ${mode === "create" ? "criado" : "atualizado"} com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o talhão",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // =============================================================================
  // RENDERIZAÇÃO
  // =============================================================================

  if (!mounted) {
    return <div className="p-8 text-center">Carregando editor...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* FORMULÁRIO */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Novo Talhão" : "Editar Talhão"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* INFORMAÇÕES BÁSICAS */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="nome">Nome do Talhão *</Label>
              <Input
                id="nome"
                value={talhao.nome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTalhao((prev) => ({ ...prev, nome: e.target.value }))
                }
                placeholder="Ex: Talhão A"
              />
            </div>

            <div>
              <Label htmlFor="cultura">Cultura Atual</Label>
              <Select
                value={talhao.cultura_atual || ""}
                onValueChange={(value) =>
                  setTalhao((prev) => ({ ...prev, cultura_atual: value }))
                }
              >
                <SelectTrigger id="cultura">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soja">Soja</SelectItem>
                  <SelectItem value="milho">Milho</SelectItem>
                  <SelectItem value="algodao">Algodão</SelectItem>
                  <SelectItem value="cafe">Café</SelectItem>
                  <SelectItem value="cana">Cana-de-açúcar</SelectItem>
                  <SelectItem value="trigo">Trigo</SelectItem>
                  <SelectItem value="feijao">Feijão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipo_solo">Tipo de Solo</Label>
              <Select
                value={talhao.tipo_solo || ""}
                onValueChange={(value) =>
                  setTalhao((prev) => ({ ...prev, tipo_solo: value }))
                }
              >
                <SelectTrigger id="tipo_solo">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arenoso">Arenoso</SelectItem>
                  <SelectItem value="argiloso">Argiloso</SelectItem>
                  <SelectItem value="humoso">Humoso</SelectItem>
                  <SelectItem value="calcario">Calcário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={talhao.status}
                onValueChange={(value: any) =>
                  setTalhao((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="em_preparacao">Em Preparação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={talhao.observacoes || ""}
                onChange={(e) =>
                  setTalhao((prev) => ({ ...prev, observacoes: e.target.value }))
                }
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* MEDIÇÕES */}
          {measurements && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Medições</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Área:</span>
                  <span className="font-medium">
                    {measurements.area.toFixed(2)} ha
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Perímetro:</span>
                  <span className="font-medium">
                    {measurements.perimeter.toFixed(2)} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Centroide:</span>
                  <span className="font-mono text-xs">
                    {measurements.centroid[0].toFixed(6)}, {measurements.centroid[1].toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* IMPORT/EXPORT */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Importar/Exportar</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleExportGeoJSON}
                disabled={!talhao.geometria}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => document.getElementById("import-geojson")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <input
                id="import-geojson"
                type="file"
                accept=".geojson,.json"
                className="hidden"
                onChange={handleImportGeoJSON}
              />
            </div>
          </div>

          <Separator />

          {/* AÇÕES */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={saving || !talhao.geometria}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* MAPA */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Desenhar Talhão</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* FERRAMENTAS DE DESENHO */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              variant={drawingTool.type === "polygon" && drawingTool.active ? "default" : "outline"}
              size="sm"
              onClick={() => handleDrawStart("polygon")}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Polígono
            </Button>
            <Button
              variant={drawingTool.type === "rectangle" && drawingTool.active ? "default" : "outline"}
              size="sm"
              onClick={() => handleDrawStart("rectangle")}
            >
              <Square className="h-4 w-4 mr-2" />
              Retângulo
            </Button>
            <Button
              variant={drawingTool.type === "circle" && drawingTool.active ? "default" : "outline"}
              size="sm"
              onClick={() => handleDrawStart("circle")}
            >
              <CircleIcon className="h-4 w-4 mr-2" />
              Círculo
            </Button>
            <Button
              variant={drawingTool.type === "edit" ? "default" : "outline"}
              size="sm"
              onClick={() => setDrawingTool({ type: "edit", active: true })}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTalhao((prev) => ({ ...prev, geometria: null }));
                setMeasurements(null);
                setHistory([]);
                setHistoryIndex(-1);
              }}
              disabled={!talhao.geometria}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>

          {/* MAPA */}
          <div style={{ height: "500px", borderRadius: "0.5rem", overflow: "hidden" }}>
            <MapContainer
              ref={mapRef}
              center={[-15.7942, -47.8822]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              
              {/* Renderizar polígono existente aqui */}
              {/* Implementar DrawControl aqui */}
            </MapContainer>
          </div>

          {/* INSTRUÇÕES */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Instruções:</strong> Selecione uma ferramenta e clique no mapa para
              desenhar. Use o botão direito para finalizar o polígono. A área será calculada
              automaticamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { TalhaoEditor };
export type { TalhaoData, DrawingTool, MeasurementData };