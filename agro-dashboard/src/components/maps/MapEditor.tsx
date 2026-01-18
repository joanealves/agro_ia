import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, GeoJSON } from "react-leaflet";
// @ts-ignore
import { EditControl } from "react-leaflet-draw/dist/esm/index.js";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { getMapas, createMapa, updateMapa, deleteMapa } from "../../lib/api";
import type { Mapa } from "../../types";

// Adiciona suporte a camadas GeoJSON e seleção de mapas
interface MapaComCamadas extends Mapa {
    camadas?: any;
}

const DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
    fazendaId: number;
}

export default function MapEditor({ fazendaId }: Props) {
    // Fallback amigável para evitar erro de contexto
    if (!fazendaId || typeof fazendaId !== 'number' || isNaN(fazendaId) || fazendaId <= 0) {
        return (
            <div className="w-full h-[500px] flex items-center justify-center text-muted-foreground">
                Selecione uma fazenda válida para visualizar o mapa.
            </div>
        );
    }
    const [mapas, setMapas] = useState<MapaComCamadas[]>([]);
    const [selectedMapa, setSelectedMapa] = useState<MapaComCamadas | null>(null);
    const [loading, setLoading] = useState(false);
    const initialCenter: [number, number] = [-15.7801, -47.9292];

    useEffect(() => {
        fetchMapas();
        // eslint-disable-next-line
    }, [fazendaId]);

    useEffect(() => {
        if (mapas.length > 0) {
            setSelectedMapa(mapas[0]);
        } else {
            setSelectedMapa(null);
        }
    }, [mapas]);

    async function fetchMapas() {
        setLoading(true);
        try {
            const data = await getMapas(fazendaId);
            setMapas(data);
        } catch (e) {
            setMapas([]);
        } finally {
            setLoading(false);
        }
    }

    function onCreated(e: L.LeafletEvent) {
        // @ts-ignore
        const layer = e.layer || (e as any).layer;
        if (!layer) return;
        const geojson = layer.toGeoJSON();
        // Garante que o objeto salvo seja sempre um FeatureCollection
        const featureCollection = {
            type: "FeatureCollection",
            features: [geojson]
        };
        createMapa(fazendaId, {
            nome: "Novo Mapa",
            latitude: geojson.geometry?.coordinates?.[1] || initialCenter[0],
            longitude: geojson.geometry?.coordinates?.[0] || initialCenter[1],
            zoom: 15,
            camadas: featureCollection,
        }).then(fetchMapas);
    }

    function onDeleted(e: L.LeafletEvent) {
        mapas.forEach((mapa) => {
            deleteMapa(fazendaId, mapa.id);
        });
        fetchMapas();
    }

    return (
        <div>
            <h2>Editor de Mapas</h2>
            {loading && <p>Carregando mapas...</p>}
            <div style={{ marginBottom: 12 }}>
                {mapas.length > 0 && (
                    <select
                        value={selectedMapa?.id || ''}
                        onChange={e => {
                            const mapa = mapas.find(m => m.id === Number(e.target.value));
                            setSelectedMapa(mapa || null);
                        }}
                    >
                        {mapas.map(mapa => (
                            <option key={mapa.id} value={mapa.id}>{mapa.nome}</option>
                        ))}
                    </select>
                )}
            </div>
            <MapContainer center={selectedMapa ? [selectedMapa.latitude, selectedMapa.longitude] : initialCenter} zoom={selectedMapa ? selectedMapa.zoom : 5} style={{ height: "500px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FeatureGroup>
                    <EditControl
                        position="topright"
                        onCreated={onCreated}
                        onDeleted={onDeleted}
                        draw={{
                            rectangle: true,
                            polygon: true,
                            marker: true,
                            polyline: true,
                            circle: false,
                            circlemarker: false,
                        }}
                    />
                    {selectedMapa && selectedMapa.camadas &&
                        typeof selectedMapa.camadas === 'object' &&
                        selectedMapa.camadas.type === 'FeatureCollection' &&
                        Array.isArray(selectedMapa.camadas.features) ? (
                        <GeoJSON key={selectedMapa.id} data={selectedMapa.camadas} />
                    ) : selectedMapa ? (
                        <Marker key={selectedMapa.id} position={[selectedMapa.latitude, selectedMapa.longitude]}>
                            <Popup>{selectedMapa.nome}</Popup>
                        </Marker>
                    ) : null}
                </FeatureGroup>
            </MapContainer>
        </div>
    );
}
