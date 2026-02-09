"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Flame, Filter, TrendingUp, Calendar, MapPin } from "lucide-react";
import type { LatLngTuple } from "leaflet";

// =============================================================================
// TIPOS
// =============================================================================

interface HeatmapPoint {
    lat: number;
    lng: number;
    intensity: number;
    data?: any;
}

interface PragaOcorrencia {
    id: number;
    tipo: string;
    nivel_severidade: "baixo" | "médio" | "alto" | "crítico";
    latitude: number;
    longitude: number;
    data_registro: string;
    talhao_id: number;
}

interface HeatmapConfig {
    radius: number;
    blur: number;
    maxOpacity: number;
    gradient: Record<string, string>;
}

// =============================================================================
// GRADIENTES PRÉ-DEFINIDOS
// =============================================================================

const GRADIENTS = {
    default: {
        name: "Padrão (Verde → Vermelho)",
        gradient: {
            "0.0": "#00ff00",
            "0.25": "#ffff00",
            "0.5": "#ff9900",
            "0.75": "#ff0000",
            "1.0": "#990000",
        },
    },
    fire: {
        name: "Fogo (Amarelo → Vermelho)",
        gradient: {
            "0.0": "#ffff00",
            "0.5": "#ff6600",
            "1.0": "#cc0000",
        },
    },
    ocean: {
        name: "Oceano (Azul → Ciano)",
        gradient: {
            "0.0": "#0000ff",
            "0.5": "#00ffff",
            "1.0": "#ffffff",
        },
    },
    monochrome: {
        name: "Monocromático (Cinza → Preto)",
        gradient: {
            "0.0": "#ffffff",
            "0.5": "#888888",
            "1.0": "#000000",
        },
    },
};

// PESOS DE SEVERIDADE
const SEVERITY_WEIGHTS = {
    crítico: 1.0,
    alto: 0.75,
    médio: 0.5,
    baixo: 0.25,
};

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

const Circle = dynamic(
    () => import("react-leaflet").then((mod) => mod.Circle),
    { ssr: false }
);

const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
);

interface PragaHeatmapProps {
    pragas: PragaOcorrencia[];
    initialCenter?: LatLngTuple;
    initialZoom?: number;
    height?: string;
    showControls?: boolean;
    onPragaClick?: (praga: PragaOcorrencia) => void;
}

export default function PragaHeatmap({
    pragas,
    initialCenter = [-15.7942, -47.8822],
    initialZoom = 12,
    height = "600px",
    showControls = true,
    onPragaClick,
}: PragaHeatmapProps) {
    // =============================================================================
    // ESTADO
    // =============================================================================

    const [mounted, setMounted] = useState(false);
    const [config, setConfig] = useState<HeatmapConfig>({
        radius: 30,
        blur: 15,
        maxOpacity: 0.8,
        gradient: GRADIENTS.default.gradient,
    });
    const [selectedGradient, setSelectedGradient] = useState("default");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterSeverity, setFilterSeverity] = useState<string>("all");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [showPoints, setShowPoints] = useState(true);
    const [showIntensity, setShowIntensity] = useState(true);
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

    const filteredPragas = useMemo(() => {
        let filtered = pragas;

        // Filtro por tipo
        if (filterType !== "all") {
            filtered = filtered.filter((p) => p.tipo === filterType);
        }

        // Filtro por severidade
        if (filterSeverity !== "all") {
            filtered = filtered.filter((p) => p.nivel_severidade === filterSeverity);
        }

        // Filtro por data
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
    }, [pragas, filterType, filterSeverity, dateRange]);

    const heatmapPoints = useMemo(() => {
        return filteredPragas.map((praga) => ({
            lat: praga.latitude,
            lng: praga.longitude,
            intensity: SEVERITY_WEIGHTS[praga.nivel_severidade],
            data: praga,
        }));
    }, [filteredPragas]);

    const statistics = useMemo(() => {
        const totalPontos = heatmapPoints.length;
        const pontosCriticos = filteredPragas.filter(
            (p) => p.nivel_severidade === "crítico"
        ).length;
        const pontosAltos = filteredPragas.filter(
            (p) => p.nivel_severidade === "alto"
        ).length;

        // Calcular densidade média
        const intensidadeMedia =
            heatmapPoints.reduce((acc, p) => acc + p.intensity, 0) / totalPontos || 0;

        // Tipos de pragas
        const tipos = new Set(filteredPragas.map((p) => p.tipo));

        return {
            totalPontos,
            pontosCriticos,
            pontosAltos,
            intensidadeMedia: intensidadeMedia.toFixed(2),
            tiposUnicos: tipos.size,
        };
    }, [heatmapPoints, filteredPragas]);

    const tiposPraga = useMemo(() => {
        return Array.from(new Set(pragas.map((p) => p.tipo)));
    }, [pragas]);

    // =============================================================================
    // HANDLERS
    // =============================================================================

    const handleGradientChange = (value: string) => {
        setSelectedGradient(value);
        setConfig((prev) => ({
            ...prev,
            gradient: GRADIENTS[value as keyof typeof GRADIENTS].gradient,
        }));
    };

    const handleResetFilters = () => {
        setFilterType("all");
        setFilterSeverity("all");
        setDateRange({ start: "", end: "" });
    };

    // =============================================================================
    // RENDERIZAÇÃO
    // =============================================================================

    if (!mounted) {
        return (
            <div
                className="flex items-center justify-center bg-muted rounded-lg"
                style={{ height }}
            >
                <p className="text-muted-foreground">Carregando heatmap...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* ESTATÍSTICAS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{statistics.totalPontos}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Flame className="h-4 w-4 text-red-600" />
                            Críticos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">
                            {statistics.pontosCriticos}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                            Altos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-orange-600">
                            {statistics.pontosAltos}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Intensidade Média</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{statistics.intensidadeMedia}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tipos Únicos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{statistics.tiposUnicos}</p>
                    </CardContent>
                </Card>
            </div>

            {/* CONTROLES E MAPA */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* CONTROLES */}
                {showControls && (
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Controles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* CONFIGURAÇÕES DO HEATMAP */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold">Heatmap</h3>

                                <div>
                                    <Label className="text-sm mb-2 block">
                                        Gradiente de Cores
                                    </Label>
                                    <Select
                                        value={selectedGradient}
                                        onValueChange={handleGradientChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(GRADIENTS).map(([key, { name }]) => (
                                                <SelectItem key={key} value={key}>
                                                    {name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-sm mb-2 block">
                                        Raio: {config.radius}px
                                    </Label>
                                    <Slider
                                        value={[config.radius]}
                                        onValueChange={([value]) =>
                                            setConfig((prev) => ({ ...prev, radius: value }))
                                        }
                                        min={10}
                                        max={50}
                                        step={1}
                                    />
                                </div>

                                <div>
                                    <Label className="text-sm mb-2 block">
                                        Desfoque: {config.blur}px
                                    </Label>
                                    <Slider
                                        value={[config.blur]}
                                        onValueChange={([value]) =>
                                            setConfig((prev) => ({ ...prev, blur: value }))
                                        }
                                        min={5}
                                        max={30}
                                        step={1}
                                    />
                                </div>

                                <div>
                                    <Label className="text-sm mb-2 block">
                                        Opacidade: {(config.maxOpacity * 100).toFixed(0)}%
                                    </Label>
                                    <Slider
                                        value={[config.maxOpacity]}
                                        onValueChange={([value]) =>
                                            setConfig((prev) => ({ ...prev, maxOpacity: value }))
                                        }
                                        min={0.1}
                                        max={1}
                                        step={0.1}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show-points" className="text-sm">
                                        Mostrar Pontos
                                    </Label>
                                    <Switch
                                        id="show-points"
                                        checked={showPoints}
                                        onCheckedChange={setShowPoints}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show-intensity" className="text-sm">
                                        Mostrar Intensidade
                                    </Label>
                                    <Switch
                                        id="show-intensity"
                                        checked={showIntensity}
                                        onCheckedChange={setShowIntensity}
                                    />
                                </div>
                            </div>

                            {/* FILTROS */}
                            <div className="space-y-3 pt-4 border-t">
                                <h3 className="text-sm font-semibold">Filtros</h3>

                                <div>
                                    <Label className="text-sm mb-2 block">Tipo de Praga</Label>
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            {tiposPraga.map((tipo) => (
                                                <SelectItem key={tipo} value={tipo}>
                                                    {tipo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-sm mb-2 block">Severidade</Label>
                                    <Select
                                        value={filterSeverity}
                                        onValueChange={setFilterSeverity}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            <SelectItem value="crítico">Crítico</SelectItem>
                                            <SelectItem value="alto">Alto</SelectItem>
                                            <SelectItem value="médio">Médio</SelectItem>
                                            <SelectItem value="baixo">Baixo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={handleResetFilters}
                                >
                                    Limpar Filtros
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
                                    style={{
                                        height: "100%",
                                        width: "100%",
                                        borderRadius: "0.5rem",
                                    }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="© OpenStreetMap contributors"
                                    />

                                    {/* PONTOS (se ativado) */}
                                    {showPoints &&
                                        heatmapPoints.map((point, idx) => (
                                            <Circle
                                                key={`point-${idx}`}
                                                center={[point.lat, point.lng]}
                                                radius={config.radius}
                                                pathOptions={{
                                                    color: "#ff0000",
                                                    fillColor: "#ff0000",
                                                    fillOpacity: point.intensity * config.maxOpacity,
                                                    weight: 1,
                                                }}
                                                eventHandlers={{
                                                    click: () => onPragaClick?.(point.data),
                                                }}
                                            >
                                                {showIntensity && (
                                                    <Popup>
                                                        <div className="p-2">
                                                            <h3 className="font-bold">{point.data.tipo}</h3>
                                                            <Badge
                                                                className="mt-2"
                                                                variant={
                                                                    point.data.nivel_severidade === "crítico"
                                                                        ? "destructive"
                                                                        : "default"
                                                                }
                                                            >
                                                                {point.data.nivel_severidade}
                                                            </Badge>
                                                            <p className="text-sm mt-2">
                                                                Intensidade: {(point.intensity * 100).toFixed(0)}%
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {new Date(
                                                                    point.data.data_registro
                                                                ).toLocaleDateString("pt-BR")}
                                                            </p>
                                                        </div>
                                                    </Popup>
                                                )}
                                            </Circle>
                                        ))}
                                </MapContainer>

                                {/* LEGENDA */}
                                <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border z-[1000]">
                                    <p className="text-xs font-semibold mb-2">Intensidade</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col gap-1">
                                            {Object.entries(config.gradient).map(([stop, color]) => (
                                                <div
                                                    key={stop}
                                                    className="w-4 h-4 rounded"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-xs space-y-1">
                                            <div>Máximo</div>
                                            <div>Alto</div>
                                            <div>Médio</div>
                                            <div>Baixo</div>
                                            <div>Mínimo</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export { PragaHeatmap, GRADIENTS, SEVERITY_WEIGHTS };
export type { HeatmapPoint, PragaOcorrencia, HeatmapConfig };