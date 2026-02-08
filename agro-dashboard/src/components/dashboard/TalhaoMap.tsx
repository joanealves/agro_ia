'use client';

import { useEffect, useRef, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, Save } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';

interface MapProps {
    fazendaId: number;
    latitude: number;
    longitude: number;
}

interface Talhao {
    id: number;
    nome: string;
    geometria?: Record<string, any>;
    area_hectares?: number;
}

interface GeoJSONGeometry {
    type: string;
    coordinates: number[][][] | number[][];
}

interface MapState {
    map: any;
    drawnItems: any;
    talhaoLayers: Map<number, any>;
}

export function TalhaoMap({ fazendaId, latitude, longitude }: MapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapStateRef = useRef<MapState | null>(null);
    const leafletRef = useRef<any>(null);

    const [talhoes, setTalhoes] = useState<Talhao[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedGeometry, setSelectedGeometry] = useState<GeoJSONGeometry | null>(null);
    const [talhaoName, setTalhaoName] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Carrega Leaflet apenas no cliente
    useEffect(() => {
        setIsClient(true);

        const loadLeaflet = async () => {
            try {
                const L = (await import('leaflet')).default;
                require('leaflet/dist/leaflet.css');
                require('leaflet-draw/dist/leaflet.draw.css');
                require('leaflet-draw');
                leafletRef.current = L;
            } catch (err) {
                console.error('Erro ao carregar Leaflet:', err);
            }
        };

        loadLeaflet();
    }, []);

    // Inicializa o mapa
    useEffect(() => {
        if (!isClient || !leafletRef.current || !mapContainerRef.current) return;

        const L = leafletRef.current;

        try {
            // Criar mapa
            const map = L.map(mapContainerRef.current).setView([latitude, longitude], 13);

            // Adicionar tiles OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors',
            }).addTo(map);

            // Criar FeatureGroup para items desenhados
            const drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);

            // Adicionar controle de desenho
            const drawControl = new (L.Control as any).Draw({
                position: 'topleft',
                draw: {
                    polygon: true,
                    polyline: false,
                    rectangle: false,
                    circle: false,
                    marker: false,
                },
                edit: {
                    featureGroup: drawnItems,
                    remove: true,
                },
            });
            map.addControl(drawControl);

            // Evento ao desenhar
            map.on('draw:created', (e: any) => {
                const layer = e.layer;
                drawnItems.addLayer(layer);

                // Extrair GeoJSON
                if (layer.toGeoJSON) {
                    const geoJSON = layer.toGeoJSON();
                    setSelectedGeometry(geoJSON.geometry);
                    setShowForm(true);
                }
            });

            mapStateRef.current = {
                map,
                drawnItems,
                talhaoLayers: new Map(),
            };

            // Carregar talhões existentes
            fetchTalhoes(map);

            return () => {
                if (mapStateRef.current?.map) {
                    mapStateRef.current.map.remove();
                }
            };
        } catch (err) {
            console.error('Erro ao inicializar mapa:', err);
            setError('Erro ao inicializar mapa');
        }
    }, [isClient, latitude, longitude]);

    // Buscar talhões da API
    const fetchTalhoes = async (map?: any) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/api/talhoes/?fazenda=${fazendaId}`);
            const talhoesList = Array.isArray(data) ? data : data.results || [];
            setTalhoes(talhoesList);

            // Adicionar ao mapa
            const L = leafletRef.current;
            if (L && (map || mapStateRef.current?.map)) {
                const mapInstance = map || mapStateRef.current?.map;
                const talhaoLayersMap = mapStateRef.current?.talhaoLayers || new Map();

                talhoesList.forEach((talhao: Talhao) => {
                    if (talhao.geometria) {
                        try {
                            const geoJsonLayer = L.geoJSON(talhao.geometria, {
                                style: {
                                    color: '#10b981',
                                    weight: 2,
                                    opacity: 0.7,
                                    fillOpacity: 0.3,
                                },
                                onEachFeature: (feature: any, layer: any) => {
                                    const popupContent = `<strong>${talhao.nome}</strong><br/>ID: ${talhao.id}${talhao.area_hectares ? `<br/>Área: ${talhao.area_hectares} ha` : ''
                                        }`;
                                    if (layer.bindPopup) {
                                        layer.bindPopup(popupContent);
                                    }
                                },
                            });

                            geoJsonLayer.addTo(mapInstance);
                            talhaoLayersMap.set(talhao.id, geoJsonLayer);
                        } catch (err) {
                            console.warn(`Erro ao adicionar talhão ${talhao.id}:`, err);
                        }
                    }
                });
            }

            setError(null);
        } catch (err: any) {
            console.error('Erro ao carregar talhões:', err);
            setError('Erro ao carregar talhões');
        } finally {
            setLoading(false);
        }
    };

    // Calcular área em hectares
    const calculateArea = (geometry: GeoJSONGeometry): number => {
        if (!geometry || geometry.type !== 'Polygon') return 0;

        const coords = geometry.coordinates[0] as number[][];
        let area = 0;

        for (let i = 0; i < coords.length - 1; i++) {
            const [lng1, lat1] = coords[i];
            const [lng2, lat2] = coords[i + 1];
            area += (lng2 - lng1) * (lat2 + lat1);
        }

        area = Math.abs(area / 2);
        const hectares = area * 1210000; // conversão aproximada
        return Math.round(hectares * 100) / 100;
    };

    // Salvar novo talhão
    const handleSaveTalhao = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!talhaoName || !selectedGeometry) {
            setError('Preencha o nome do talhão e desenhe a área');
            return;
        }

        try {
            setLoading(true);

            await api.post('/api/talhoes/', {
                fazenda: fazendaId,
                nome: talhaoName,
                cultura: 'outro',
                area_hectares: calculateArea(selectedGeometry),
                geometria: selectedGeometry,
                status: 'ativo',
            });

            // Limpar estado
            setTalhaoName('');
            setSelectedGeometry(null);
            setShowForm(false);

            // Limpar desenho
            if (mapStateRef.current?.drawnItems) {
                mapStateRef.current.drawnItems.clearLayers();
            }

            // Recarregar talhões
            await fetchTalhoes();
            setError(null);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || err.message || 'Erro ao salvar talhão';
            setError(errorMsg);
            console.error('Erro ao salvar:', err);
        } finally {
            setLoading(false);
        }
    };

    // Focar talhão no mapa
    const focusOnMap = (talhaoId: number) => {
        const layer = mapStateRef.current?.talhaoLayers.get(talhaoId);
        const map = mapStateRef.current?.map;
        const L = leafletRef.current;

        if (layer && map && L) {
            try {
                if (typeof (layer as any).getBounds === 'function') {
                    map.fitBounds((layer as any).getBounds());
                }
            } catch (err) {
                console.warn('Erro ao focar talhão:', err);
            }
        }
    };

    if (!isClient) {
        return (
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                Carregando mapa...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Mapa de Talhões</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Container do mapa */}
                    <div
                        ref={mapContainerRef}
                        className="w-full rounded-lg border border-gray-300 bg-gray-100"
                        style={{ height: '400px' }}
                    />

                    {/* Instruções */}
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="font-semibold mb-2">📍 Como usar o mapa:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Clique no ícone de polígono na esquerda superior</li>
                            <li>Clique no mapa para adicionar pontos da sua parcela</li>
                            <li>Clique duas vezes para finalizar o desenho</li>
                            <li>Digite o nome e clique em "Salvar Talhão"</li>
                        </ul>
                    </div>

                    {/* Formulário para novo talhão */}
                    {showForm && (
                        <form onSubmit={handleSaveTalhao} className="space-y-4 border-t pt-4">
                            <h3 className="font-semibold text-lg">Novo Talhão</h3>

                            <div className="space-y-2">
                                <Label htmlFor="talhao-name">Nome do Talhão *</Label>
                                <Input
                                    id="talhao-name"
                                    type="text"
                                    value={talhaoName}
                                    onChange={(e) => setTalhaoName(e.target.value)}
                                    placeholder="Ex: Talhão Leste A"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {selectedGeometry && (
                                <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                                    <p>✓ Geometria: {selectedGeometry.type}</p>
                                    <p>✓ Área estimada: {calculateArea(selectedGeometry).toFixed(2)} ha</p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <Button
                                    type="submit"
                                    disabled={loading || !talhaoName}
                                    className="flex-1"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? 'Salvando...' : 'Salvar Talhão'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setTalhaoName('');
                                        setSelectedGeometry(null);
                                        if (mapStateRef.current?.drawnItems) {
                                            mapStateRef.current.drawnItems.clearLayers();
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* Lista de talhões registrados */}
            {talhoes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Talhões Registrados ({talhoes.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {talhoes.map((t) => (
                                <div
                                    key={t.id}
                                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 cursor-pointer transition-colors"
                                    onClick={() => focusOnMap(t.id)}
                                >
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{t.nome}</p>
                                        {t.area_hectares && (
                                            <p className="text-xs text-gray-600 mt-1">Área: {t.area_hectares} ha</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">ID: {t.id}</p>
                                    </div>
                                    <span className="ml-2 w-3 h-3 bg-green-500 rounded-full flex-shrink-0 mt-1"></span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {talhoes.length === 0 && !loading && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-500">
                            Nenhum talhão registrado. Comece desenhando um no mapa!
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
