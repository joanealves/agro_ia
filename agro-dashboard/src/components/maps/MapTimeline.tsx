"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Calendar,
    TrendingUp,
    Filter,
    Download,
} from "lucide-react";
import AgroMap from "./AgroMap";

// =============================================================================
// TIPOS
// =============================================================================

interface TimelineEvent {
    id: number;
    type: "praga" | "aplicacao" | "safra" | "irrigacao" | "clima";
    data: string;
    talhao_id?: number;
    metadata: any;
}

interface TimelineConfig {
    startDate: Date;
    endDate: Date;
    currentDate: Date;
    interval: "day" | "week" | "month";
    playing: boolean;
    speed: number;
}

interface TimelineStats {
    totalEvents: number;
    eventsByType: Record<string, number>;
    currentPeriod: {
        events: number;
        pragas: number;
        aplicacoes: number;
    };
}

// =============================================================================
// HELPERS
// =============================================================================

const EVENT_COLORS = {
    praga: "#ef4444", // red
    aplicacao: "#3b82f6", // blue
    safra: "#22c55e", // green
    irrigacao: "#06b6d4", // cyan
    clima: "#8b5cf6", // purple
};

const EVENT_LABELS = {
    praga: "Praga",
    aplicacao: "Aplicação",
    safra: "Safra",
    irrigacao: "Irrigação",
    clima: "Clima",
};

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function addWeeks(date: Date, weeks: number): Date {
    return addDays(date, weeks * 7);
}

function addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

function formatDate(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatMonth(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });
}

// =============================================================================
// COMPONENTE
// =============================================================================

interface MapTimelineProps {
    events: TimelineEvent[];
    talhoes?: any[];
    initialStartDate?: Date;
    initialEndDate?: Date;
    onEventClick?: (event: TimelineEvent) => void;
    onDateChange?: (date: Date) => void;
}

export default function MapTimeline({
    events,
    talhoes = [],
    initialStartDate,
    initialEndDate,
    onEventClick,
    onDateChange,
}: MapTimelineProps) {
    // =============================================================================
    // ESTADO
    // =============================================================================

    const [config, setConfig] = useState<TimelineConfig>({
        startDate: initialStartDate || new Date(new Date().setMonth(new Date().getMonth() - 6)),
        endDate: initialEndDate || new Date(),
        currentDate: initialStartDate || new Date(new Date().setMonth(new Date().getMonth() - 6)),
        interval: "week",
        playing: false,
        speed: 1000, // ms
    });
    const [filterType, setFilterType] = useState<string>("all");
    const [showMap, setShowMap] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

    // =============================================================================
    // EVENTOS FILTRADOS
    // =============================================================================

    const filteredEvents = useMemo(() => {
        let filtered = events;

        // Filtrar por tipo
        if (filterType !== "all") {
            filtered = filtered.filter((e) => e.type === filterType);
        }

        // Filtrar por data
        filtered = filtered.filter((e) => {
            const eventDate = new Date(e.data);
            return eventDate >= config.startDate && eventDate <= config.endDate;
        });

        // Ordenar por data
        return filtered.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    }, [events, filterType, config.startDate, config.endDate]);

    // =============================================================================
    // EVENTOS VISÍVEIS (baseado na data atual)
    // =============================================================================

    const visibleEvents = useMemo(() => {
        return filteredEvents.filter((e) => {
            const eventDate = new Date(e.data);
            return eventDate <= config.currentDate;
        });
    }, [filteredEvents, config.currentDate]);

    // =============================================================================
    // ESTATÍSTICAS
    // =============================================================================

    const statistics: TimelineStats = useMemo(() => {
        const eventsByType = visibleEvents.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalEvents: visibleEvents.length,
            eventsByType,
            currentPeriod: {
                events: visibleEvents.length,
                pragas: eventsByType.praga || 0,
                aplicacoes: eventsByType.aplicacao || 0,
            },
        };
    }, [visibleEvents]);

    // =============================================================================
    // TIMELINE DE DADOS
    // =============================================================================

    const timeline = useMemo(() => {
        const totalDays = Math.ceil(
            (config.endDate.getTime() - config.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const currentProgress =
            ((config.currentDate.getTime() - config.startDate.getTime()) /
                (config.endDate.getTime() - config.startDate.getTime())) *
            100;

        return {
            totalDays,
            currentProgress: Math.max(0, Math.min(100, currentProgress)),
        };
    }, [config]);

    // =============================================================================
    // HANDLERS
    // =============================================================================

    const handlePlay = useCallback(() => {
        setConfig((prev) => ({ ...prev, playing: true }));
    }, []);

    const handlePause = useCallback(() => {
        setConfig((prev) => ({ ...prev, playing: false }));
    }, []);

    const handleStepForward = useCallback(() => {
        setConfig((prev) => {
            let nextDate: Date;
            switch (prev.interval) {
                case "day":
                    nextDate = addDays(prev.currentDate, 1);
                    break;
                case "week":
                    nextDate = addWeeks(prev.currentDate, 1);
                    break;
                case "month":
                    nextDate = addMonths(prev.currentDate, 1);
                    break;
                default:
                    nextDate = prev.currentDate;
            }

            if (nextDate > prev.endDate) {
                return { ...prev, playing: false };
            }

            onDateChange?.(nextDate);
            return { ...prev, currentDate: nextDate };
        });
    }, [onDateChange]);

    const handleStepBackward = useCallback(() => {
        setConfig((prev) => {
            let prevDate: Date;
            switch (prev.interval) {
                case "day":
                    prevDate = addDays(prev.currentDate, -1);
                    break;
                case "week":
                    prevDate = addWeeks(prev.currentDate, -1);
                    break;
                case "month":
                    prevDate = addMonths(prev.currentDate, -1);
                    break;
                default:
                    prevDate = prev.currentDate;
            }

            if (prevDate < prev.startDate) {
                prevDate = prev.startDate;
            }

            onDateChange?.(prevDate);
            return { ...prev, currentDate: prevDate };
        });
    }, [onDateChange]);

    const handleReset = useCallback(() => {
        setConfig((prev) => ({
            ...prev,
            currentDate: prev.startDate,
            playing: false,
        }));
        onDateChange?.(config.startDate);
    }, [config.startDate, onDateChange]);

    const handleSliderChange = useCallback(
        (value: number[]) => {
            const progress = value[0] / 100;
            const timeRange = config.endDate.getTime() - config.startDate.getTime();
            const newDate = new Date(config.startDate.getTime() + progress * timeRange);

            setConfig((prev) => ({ ...prev, currentDate: newDate, playing: false }));
            onDateChange?.(newDate);
        },
        [config.startDate, config.endDate, onDateChange]
    );

    const handleExportData = useCallback(() => {
        const data = {
            period: {
                start: config.startDate.toISOString(),
                end: config.endDate.toISOString(),
                current: config.currentDate.toISOString(),
            },
            statistics,
            events: visibleEvents.map((e) => ({
                type: e.type,
                date: e.data,
                metadata: e.metadata,
            })),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `timeline_${formatDate(config.currentDate).replace(/\//g, "-")}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [config, statistics, visibleEvents]);

    // =============================================================================
    // EFEITO DE REPRODUÇÃO
    // =============================================================================

    useState(() => {
        if (!config.playing) return;

        const interval = setInterval(() => {
            handleStepForward();
        }, config.speed);

        return () => clearInterval(interval);
    });

    // =============================================================================
    // RENDERIZAÇÃO
    // =============================================================================

    return (
        <div className="space-y-4">
            {/* ESTATÍSTICAS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{statistics.totalEvents}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            até {formatDate(config.currentDate)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pragas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">
                            {statistics.currentPeriod.pragas}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Aplicações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">
                            {statistics.currentPeriod.aplicacoes}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Período</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-bold">{timeline.totalDays} dias</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatMonth(config.startDate)} - {formatMonth(config.endDate)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* CONTROLES */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Linha do Tempo
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* DATA ATUAL */}
                    <div className="text-center">
                        <p className="text-3xl font-bold">{formatDate(config.currentDate)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {timeline.currentProgress.toFixed(1)}% do período
                        </p>
                    </div>

                    {/* SLIDER */}
                    <div className="px-2">
                        <Slider
                            value={[timeline.currentProgress]}
                            onValueChange={handleSliderChange}
                            min={0}
                            max={100}
                            step={0.1}
                            className="w-full"
                        />
                    </div>

                    {/* CONTROLES DE REPRODUÇÃO */}
                    <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="icon" onClick={handleReset}>
                            <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleStepBackward}>
                            <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            onClick={config.playing ? handlePause : handlePlay}
                            disabled={config.currentDate >= config.endDate}
                        >
                            {config.playing ? (
                                <Pause className="h-4 w-4" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleStepForward}>
                            <SkipForward className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setConfig((prev) => ({
                                    ...prev,
                                    currentDate: prev.endDate,
                                    playing: false,
                                }))
                            }
                        >
                            <SkipForward className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* CONFIGURAÇÕES */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                            <Label className="text-sm mb-2 block">Intervalo</Label>
                            <Select
                                value={config.interval}
                                onValueChange={(value: any) =>
                                    setConfig((prev) => ({ ...prev, interval: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Diário</SelectItem>
                                    <SelectItem value="week">Semanal</SelectItem>
                                    <SelectItem value="month">Mensal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm mb-2 block">Filtrar Tipo</Label>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="praga">Pragas</SelectItem>
                                    <SelectItem value="aplicacao">Aplicações</SelectItem>
                                    <SelectItem value="safra">Safras</SelectItem>
                                    <SelectItem value="irrigacao">Irrigação</SelectItem>
                                    <SelectItem value="clima">Clima</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm mb-2 block">
                                Velocidade: {config.speed}ms
                            </Label>
                            <Slider
                                value={[config.speed]}
                                onValueChange={([value]) =>
                                    setConfig((prev) => ({ ...prev, speed: value }))
                                }
                                min={100}
                                max={3000}
                                step={100}
                            />
                        </div>
                    </div>

                    {/* AÇÕES */}
                    <div className="flex gap-2 pt-4 border-t">
                        <div className="flex items-center gap-2 flex-1">
                            <Label htmlFor="show-map" className="text-sm">
                                Mostrar Mapa
                            </Label>
                            <Switch
                                id="show-map"
                                checked={showMap}
                                onCheckedChange={setShowMap}
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={handleExportData}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* LISTA DE EVENTOS */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Eventos até {formatDate(config.currentDate)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {visibleEvents.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Nenhum evento neste período
                            </p>
                        ) : (
                            visibleEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        onEventClick?.(event);
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: EVENT_COLORS[event.type] }}
                                        />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {EVENT_LABELS[event.type]}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(new Date(event.data))}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{event.type}</Badge>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* MAPA (se ativado) */}
            {showMap && (
                <AgroMap
                    talhoes={talhoes}
                    pragas={visibleEvents
                        .filter((e) => e.type === "praga")
                        .map((e) => e.metadata)}
                    aplicacoes={visibleEvents
                        .filter((e) => e.type === "aplicacao")
                        .map((e) => e.metadata)}
                    height="500px"
                    showControls={false}
                    showLegend={true}
                />
            )}
        </div>
    );
}

export { MapTimeline };
export type { TimelineEvent, TimelineConfig, TimelineStats };