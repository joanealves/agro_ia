// 'use client';

// import { useEffect, useState } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { Fazenda } from '@/types';

// // Corrige o ícone do marker do Leaflet
// const icon = L.icon({
//   iconUrl: '/marker-icon.png',
//   shadowUrl: '/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// interface FarmMapProps {
//   fazendas: Fazenda[];
//   onMarkerClick?: (fazenda: Fazenda) => void;
// }

// export function FarmMap({ fazendas, onMarkerClick }: FarmMapProps) {
//   return (
//     <div className="h-[500px] w-full rounded-lg overflow-hidden border">
//       <MapContainer
//         center={[-15.7801, -47.9292]} // Centro do Brasil
//         zoom={4}
//         style={{ height: '100%', width: '100%' }}
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         {fazendas.map((fazenda) => (
//           <Marker
//             key={fazenda.id}
//             position={[fazenda.latitude, fazenda.longitude]}
//             icon={icon}
//             eventHandlers={{
//               click: () => onMarkerClick?.(fazenda),
//             }}
//           >
//             <Popup>
//               <div className="p-2">
//                 <h3 className="font-bold">{fazenda.nome}</h3>
//                 <p className="text-sm">{fazenda.localizacao}</p>
//               </div>
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// }




"use client";

// =============================================================================
// FARM MAP - Mapa com marcadores das fazendas
// =============================================================================

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Fazenda } from "@/types";

// Importa Leaflet dinamicamente para evitar erro de SSR
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

// =============================================================================
// TYPES
// =============================================================================

interface FarmMapProps {
  fazendas: Fazenda[];
  onMarkerClick?: (fazenda: Fazenda) => void;
  height?: string;
  className?: string;
}

// =============================================================================
// FARM MAP COMPONENT
// =============================================================================

export function FarmMap({
  fazendas,
  onMarkerClick,
  height = "400px",
  className,
}: FarmMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [leafletIcon, setLeafletIcon] = useState<L.Icon | null>(null);

  // Centro do Brasil como padrão
  const defaultCenter: [number, number] = [-15.7801, -47.9292];

  // Calcula centro baseado nas fazendas
  const getCenter = (): [number, number] => {
    if (fazendas.length === 0) return defaultCenter;

    const sumLat = fazendas.reduce((sum, f) => sum + f.latitude, 0);
    const sumLng = fazendas.reduce((sum, f) => sum + f.longitude, 0);

    return [sumLat / fazendas.length, sumLng / fazendas.length];
  };

  // Monta componente apenas no cliente
  useEffect(() => {
    setIsMounted(true);

    // Importa Leaflet e configura ícone
    import("leaflet").then((L) => {
      const icon = L.icon({
        iconUrl: "/marker-icon.png",
        shadowUrl: "/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      setLeafletIcon(icon);
    });

    // Importa CSS do Leaflet
    // @ts-ignore - CSS import não tem declaração de tipo
    import("leaflet/dist/leaflet.css");
  }, []);

  if (!isMounted) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Mapa das Fazendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center bg-muted rounded-lg"
            style={{ height }}
          >
            <p className="text-muted-foreground">Carregando mapa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Mapa das Fazendas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border" style={{ height }}>
          <MapContainer
            center={getCenter()}
            zoom={fazendas.length > 0 ? 5 : 4}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {fazendas.map((fazenda) => (
              <Marker
                key={fazenda.id}
                position={[fazenda.latitude, fazenda.longitude]}
                icon={leafletIcon || undefined}
                eventHandlers={{
                  click: () => onMarkerClick?.(fazenda),
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-sm">{fazenda.nome}</h3>
                    <p className="text-xs text-gray-600">{fazenda.localizacao}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {fazenda.latitude.toFixed(4)}, {fazenda.longitude.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}