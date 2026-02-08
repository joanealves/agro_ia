// import { useEffect, useState, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, GeoJSON } from "react-leaflet";
// // @ts-ignore
// import { EditControl } from "react-leaflet-draw/dist/esm/index.js";
// import "leaflet/dist/leaflet.css";
// import "leaflet-draw/dist/leaflet.draw.css";
// import L from "leaflet";
// import icon from "leaflet/dist/images/marker-icon.png";
// import iconShadow from "leaflet/dist/images/marker-shadow.png";
// import { getMapas, createMapa, updateMapa, deleteMapa } from "../../lib/api";
// import type { Mapa } from "../../types";

// // Adiciona suporte a camadas GeoJSON e seleção de mapas
// interface MapaComCamadas extends Mapa {
//     camadas?: any;
// }

// const DefaultIcon = L.icon({
//     iconUrl: icon.src,
//     shadowUrl: iconShadow.src,
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// interface Props {
//     fazendaId: number;
// }

// export default function MapEditor({ fazendaId }: Props) {
//     const leafletMapRef = useRef<L.Map | null>(null);
//     // Salvar camadas editadas
//     function onEdited(e: L.LeafletEvent) {
//         if (e.layer) {
//             e.layer.eachLayer((layer: any) => {
//                 const geojson = layer.toGeoJSON();
//                 const featureCollection = {
//                     type: "FeatureCollection",
//                     features: [geojson]
//                 };
//                 if (selectedMapa) {
//                     updateMapa(fazendaId, selectedMapa.id, { camadas: featureCollection }).then(fetchMapas);
//                 }
//             });
//         }
//     }
//     // Função para centralizar o mapa na fazenda
//     const handleLocateFazenda = () => {
//         if (selectedMapa && leafletMapRef.current) {
//             leafletMapRef.current.setView([selectedMapa.latitude, selectedMapa.longitude], selectedMapa.zoom || 15);
//         }
//     };
//     // Fallback amigável para evitar erro de contexto
//     if (!fazendaId || typeof fazendaId !== 'number' || isNaN(fazendaId) || fazendaId <= 0) {
//         return (
//             <div className="w-full h-[500px] flex items-center justify-center text-muted-foreground">
//                 Selecione uma fazenda válida para visualizar o mapa.
//             </div>
//         );
//     }
//     const [mapas, setMapas] = useState<MapaComCamadas[]>([]);
//     const [selectedMapa, setSelectedMapa] = useState<MapaComCamadas | null>(null);
//     const [loading, setLoading] = useState(false);
//     const initialCenter: [number, number] = [-15.7801, -47.9292];

//     useEffect(() => {
//         fetchMapas();
//         // eslint-disable-next-line
//     }, [fazendaId]);

//     useEffect(() => {
//         if (mapas.length > 0) {
//             setSelectedMapa(mapas[0]);
//         } else {
//             setSelectedMapa(null);
//         }
//     }, [mapas]);

//     async function fetchMapas() {
//         setLoading(true);
//         try {
//             const data = await getMapas(fazendaId);
//             setMapas(data);
//         } catch (e) {
//             setMapas([]);
//         } finally {
//             setLoading(false);
//         }
//     }

//     function onCreated(e: L.LeafletEvent) {
//         // @ts-ignore
//         const layer = e.layer || (e as any).layer;
//         if (!layer) return;
//         const geojson = layer.toGeoJSON();
//         // Garante que o objeto salvo seja sempre um FeatureCollection
//         const featureCollection = {
//             type: "FeatureCollection",
//             features: [geojson]
//         };
//         createMapa(fazendaId, {
//             nome: "Novo Mapa",
//             latitude: geojson.geometry?.coordinates?.[1] || initialCenter[0],
//             longitude: geojson.geometry?.coordinates?.[0] || initialCenter[1],
//             zoom: 15,
//             camadas: featureCollection,
//         }).then(fetchMapas);
//     }

//     function onDeleted(e: L.LeafletEvent) {
//         mapas.forEach(async (mapa) => {
//             try {
//                 await deleteMapa(fazendaId, mapa.id);
//             } catch (err: any) {
//                 if (err?.response?.status !== 404) {
//                     alert('Erro ao deletar mapa: ' + (err?.message || 'Erro desconhecido'));
//                 }
//             }
//         });
//         fetchMapas();
//     }

//     // Limpar todos os desenhos do mapa
//     function handleClearMap() {
//         if (window.confirm('Deseja realmente remover todos os desenhos do mapa?')) {
//             mapas.forEach((mapa) => {
//                 deleteMapa(fazendaId, mapa.id);
//             });
//             fetchMapas();
//         }
//     }

//     return (
//         <div>
//             <h2>Editor de Mapas</h2>
//             {loading && <p>Carregando mapas...</p>}
//             <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
//                 {mapas.length > 0 && (
//                     <select
//                         value={selectedMapa?.id || ''}
//                         onChange={e => {
//                             const mapa = mapas.find(m => m.id === Number(e.target.value));
//                             setSelectedMapa(mapa || null);
//                         }}
//                     >
//                         {mapas.map(mapa => (
//                             <option key={mapa.id} value={mapa.id}>{mapa.nome}</option>
//                         ))}
//                     </select>
//                 )}
//                 <button
//                     type="button"
//                     className="px-3 py-1 bg-red-500 text-white rounded"
//                     onClick={handleClearMap}
//                     disabled={mapas.length === 0}
//                 >
//                     Limpar desenhos
//                 </button>
//                 <button
//                     type="button"
//                     className="px-3 py-1 bg-blue-500 text-white rounded"
//                     onClick={handleLocateFazenda}
//                     disabled={!selectedMapa}
//                 >
//                     Centralizar fazenda
//                 </button>
//             </div>
//             <MapContainer
//                 ref={leafletMapRef}
//                 center={selectedMapa ? [selectedMapa.latitude, selectedMapa.longitude] : initialCenter}
//                 zoom={selectedMapa ? selectedMapa.zoom : 5}
//                 style={{ height: "500px", width: "100%" }}
//             >
//                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                 <FeatureGroup>
//                     <EditControl
//                         position="topright"
//                         onCreated={onCreated}
//                         onDeleted={onDeleted}
//                         onEdited={onEdited}
//                         draw={{
//                             rectangle: true,
//                             polygon: true,
//                             marker: true,
//                             polyline: true,
//                             circle: false,
//                             circlemarker: false,
//                         }}
//                         edit={{
//                             edit: true,
//                             remove: true
//                         }}
//                     />
//                     {selectedMapa && selectedMapa.camadas &&
//                         typeof selectedMapa.camadas === 'object' &&
//                         selectedMapa.camadas.type === 'FeatureCollection' &&
//                         Array.isArray(selectedMapa.camadas.features) ? (
//                         <GeoJSON
//                             key={selectedMapa.id}
//                             data={selectedMapa.camadas}
//                             onEachFeature={(feature, layer) => {
//                                 let info = '';
//                                 if (feature.geometry) {
//                                     info += `Tipo: ${feature.geometry.type}`;
//                                     if (feature.geometry.type === 'Polygon') {
//                                         info += ` | Pontos: ${feature.geometry.coordinates[0]?.length}`;
//                                     }
//                                     if (feature.geometry.type === 'Point') {
//                                         info += ` | Coordenadas: ${feature.geometry.coordinates.join(', ')}`;
//                                     }
//                                 }
//                                 layer.bindPopup(info || 'Forma desenhada');
//                             }}
//                         />
//                     ) : selectedMapa ? (
//                         <Marker key={selectedMapa.id} position={[selectedMapa.latitude, selectedMapa.longitude]}>
//                             <Popup>{selectedMapa.nome}</Popup>
//                         </Marker>
//                     ) : null}
//                 </FeatureGroup>
//             </MapContainer>
//             {/* Lista de camadas desenhadas */}
//             {selectedMapa && selectedMapa.camadas &&
//                 typeof selectedMapa.camadas === 'object' &&
//                 selectedMapa.camadas.type === 'FeatureCollection' &&
//                 Array.isArray(selectedMapa.camadas.features) && (
//                     <div className="mt-4 p-2 border rounded bg-gray-50">
//                         <h3 className="font-bold mb-2">Camadas desenhadas:</h3>
//                         <ul>
//                             {selectedMapa.camadas.features.map((feature: any, idx: number) => (
//                                 <li key={idx}>
//                                     Tipo: {feature.geometry?.type}
//                                     {feature.geometry?.type === 'Polygon' && ` | Pontos: ${feature.geometry.coordinates[0]?.length}`}
//                                     {feature.geometry?.type === 'Point' && ` | Coordenadas: ${feature.geometry.coordinates.join(', ')}`}
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 )}
//         </div>
//     );
// }













































"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { getMapas, createMapa, updateMapa, deleteMapa } from "@/src/lib/api";
import type { Mapa } from "@/src/types/index";

// Fix de ícones do Leaflet
const DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapaComCamadas extends Mapa {
    camadas?: any;
    camadas_ativas?: any;
}


interface Props {
    fazendaId: number;
}

export default function MapEditor({ fazendaId }: Props) {
    const [mapas, setMapas] = useState<MapaComCamadas[]>([]);
    const [selectedMapa, setSelectedMapa] = useState<MapaComCamadas | null>(null);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const leafletMapRef = useRef<L.Map | null>(null);
    const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
    const initialCenter: [number, number] = [-15.7801, -47.9292];

    // Fix SSR
    useEffect(() => {
        setMounted(true);
    }, []);

    // Validação de fazendaId
    if (!fazendaId || typeof fazendaId !== 'number' || isNaN(fazendaId) || fazendaId <= 0) {
        return (
            <div className="w-full h-[500px] flex items-center justify-center text-muted-foreground">
                Selecione uma fazenda válida para visualizar o mapa.
            </div>
        );
    }

    useEffect(() => {
        if (mounted) {
            fetchMapas();
        }
    }, [fazendaId, mounted]);

    useEffect(() => {
        if (mapas.length > 0 && !selectedMapa) {
            setSelectedMapa(mapas[0]);
        }
    }, [mapas]);

    async function fetchMapas() {
        setLoading(true);
        try {
            const data = await getMapas(fazendaId);
            setMapas(data);
        } catch (e) {
            console.error("Erro ao carregar mapas:", e);
            setMapas([]);
        } finally {
            setLoading(false);
        }
    }

    function onCreated(e: any) {
        const layer = e.layer;
        if (!layer) return;

        const geojson = layer.toGeoJSON();
        
        // ✅ CORREÇÃO 1: Usar camadas_ativas ao invés de camadas
        const featureCollection = {
            type: "FeatureCollection",
            features: [geojson]
        };

        // ✅ CORREÇÃO 2: Payload correto para o backend
        const mapaData = {
            nome: "Novo Mapa",
            latitude: geojson.geometry?.coordinates?.[1] || initialCenter[0],
            longitude: geojson.geometry?.coordinates?.[0] || initialCenter[1],
            zoom: 15,
            camadas_ativas: featureCollection, // ← Campo correto!
        };

        createMapa(fazendaId, mapaData)
            .then(() => {
                fetchMapas();
            })
            .catch((error) => {
                console.error("Erro ao criar mapa:", error);
                alert("Erro ao criar mapa. Verifique os dados e tente novamente.");
            });
    }

    function onEdited(e: any) {
        const layers = e.layers;
        if (!layers) return;

        layers.eachLayer((layer: any) => {
            const geojson = layer.toGeoJSON();
            const featureCollection = {
                type: "FeatureCollection",
                features: [geojson]
            };

            if (selectedMapa) {
                // ✅ CORREÇÃO: Usar camadas_ativas
                updateMapa(fazendaId, selectedMapa.id, { 
                    camadas_ativas: featureCollection 
                })
                    .then(() => fetchMapas())
                    .catch((error) => {
                        console.error("Erro ao atualizar mapa:", error);
                    });
            }
        });
    }

    function onDeleted(e: any) {
        mapas.forEach(async (mapa) => {
            try {
                await deleteMapa(fazendaId, mapa.id);
            } catch (err: any) {
                if (err?.response?.status !== 404) {
                    console.error('Erro ao deletar mapa:', err);
                }
            }
        });
        fetchMapas();
    }

    function handleLocateFazenda() {
        if (selectedMapa && leafletMapRef.current) {
            leafletMapRef.current.setView(
                [selectedMapa.latitude, selectedMapa.longitude], 
                selectedMapa.zoom || 15
            );
        }
    }

    function handleClearMap() {
        if (window.confirm('Deseja realmente remover todos os desenhos do mapa?')) {
            mapas.forEach((mapa) => {
                deleteMapa(fazendaId, mapa.id).catch(console.error);
            });
            fetchMapas();
        }
    }

    // ✅ CORREÇÃO 3: Aguardar SSR
    if (!mounted) {
        return (
            <div className="w-full h-[500px] flex items-center justify-center">
                <p>Carregando editor de mapas...</p>
            </div>
        );
    }

    // ✅ CORREÇÃO 4: Renderizar camadas corretamente
    const getCamadas = (mapa: MapaComCamadas) => {
        // Suporta tanto camadas quanto camadas_ativas
        return mapa.camadas_ativas || mapa.camadas;
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Editor de Mapas</h2>
            
            {loading && <p>Carregando mapas...</p>}
            
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {mapas.length > 0 && (
                    <select
                        value={selectedMapa?.id || ''}
                        onChange={e => {
                            const mapa = mapas.find(m => m.id === Number(e.target.value));
                            setSelectedMapa(mapa || null);
                        }}
                        className="px-3 py-2 border rounded"
                    >
                        {mapas.map(mapa => (
                            <option key={mapa.id} value={mapa.id}>
                                {mapa.nome}
                            </option>
                        ))}
                    </select>
                )}
                
                <button
                    type="button"
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={handleClearMap}
                    disabled={mapas.length === 0}
                >
                    Limpar desenhos
                </button>
                
                <button
                    type="button"
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleLocateFazenda}
                    disabled={!selectedMapa}
                >
                    Centralizar fazenda
                </button>
            </div>

            <MapContainer
                // @ts-ignore
                whenCreated={(mapInstance: L.Map) => {
                    leafletMapRef.current = mapInstance;
                }}
                center={selectedMapa ? [selectedMapa.latitude, selectedMapa.longitude] : initialCenter}
                zoom={selectedMapa ? selectedMapa.zoom : 5}
                style={{ height: "500px", width: "100%", borderRadius: "8px" }}
            >
                <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                
                <FeatureGroup
                    ref={drawnItemsRef}
                >
                    {/* ✅ CORREÇÃO 5: Usar EditControl dinamicamente */}
                    <EditControlDynamic
                        onCreated={onCreated}
                        onEdited={onEdited}
                        onDeleted={onDeleted}
                    />
                    
                    {/* Renderizar camadas existentes */}
                    {selectedMapa && (() => {
                        const camadas = getCamadas(selectedMapa);
                        
                        if (camadas && 
                            typeof camadas === 'object' &&
                            camadas.type === 'FeatureCollection' &&
                            Array.isArray(camadas.features)) {
                            return (
                                <GeoJSON
                                    key={selectedMapa.id}
                                    data={camadas}
                                    onEachFeature={(feature, layer) => {
                                        let info = '';
                                        if (feature.geometry) {
                                            info += `Tipo: ${feature.geometry.type}`;
                                            if (feature.geometry.type === 'Polygon') {
                                                info += ` | Pontos: ${feature.geometry.coordinates[0]?.length}`;
                                            }
                                        }
                                        layer.bindPopup(info || 'Forma desenhada');
                                    }}
                                />
                            );
                        }
                        
                        // Fallback: marcador
                        return (
                            <Marker 
                                key={selectedMapa.id} 
                                position={[selectedMapa.latitude, selectedMapa.longitude]}
                            >
                                <Popup>{selectedMapa.nome}</Popup>
                            </Marker>
                        );
                    })()}
                </FeatureGroup>
            </MapContainer>

            {/* Lista de camadas */}
            {selectedMapa && (() => {
                const camadas = getCamadas(selectedMapa);
                
                if (camadas &&
                    typeof camadas === 'object' &&
                    camadas.type === 'FeatureCollection' &&
                    Array.isArray(camadas.features)) {
                    return (
                        <div className="mt-4 p-3 border rounded bg-gray-50">
                            <h3 className="font-bold mb-2">Camadas desenhadas:</h3>
                            <ul className="space-y-1">
                                {camadas.features.map((feature: any, idx: number) => (
                                    <li key={idx} className="text-sm">
                                        Tipo: {feature.geometry?.type}
                                        {feature.geometry?.type === 'Polygon' && 
                                            ` | Pontos: ${feature.geometry.coordinates[0]?.length}`
                                        }
                                        {feature.geometry?.type === 'Point' && 
                                            ` | Coordenadas: ${feature.geometry.coordinates.join(', ')}`
                                        }
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                }
                return null;
            })()}
        </div>
    );
}

// ✅ CORREÇÃO 6: EditControl como componente separado com importação dinâmica
function EditControlDynamic({ onCreated, onEdited, onDeleted }: any) {
    const [EditControl, setEditControl] = useState<any>(null);

    useEffect(() => {
        // Importação dinâmica do EditControl
        import('react-leaflet-draw').then((module) => {
            setEditControl(() => module.EditControl);
        }).catch((error) => {
            console.error("Erro ao carregar react-leaflet-draw:", error);
        });
    }, []);

    if (!EditControl) {
        return null; // Não renderiza nada até carregar
    }

    return (
        <EditControl
            position="topright"
            onCreated={onCreated}
            onEdited={onEdited}
            onDeleted={onDeleted}
            draw={{
                rectangle: true,
                polygon: true,
                marker: true,
                polyline: true,
                circle: false,
                circlemarker: false,
            }}
            edit={{
                edit: true,
                remove: true,
            }}
        />
    );
}