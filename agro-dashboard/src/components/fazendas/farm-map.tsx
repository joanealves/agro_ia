'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Fazenda } from '@/types';

// Corrige o ícone do marker do Leaflet
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface FarmMapProps {
  fazendas: Fazenda[];
  onMarkerClick?: (fazenda: Fazenda) => void;
}

export function FarmMap({ fazendas, onMarkerClick }: FarmMapProps) {
  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={[-15.7801, -47.9292]} // Centro do Brasil
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fazendas.map((fazenda) => (
          <Marker
            key={fazenda.id}
            position={[fazenda.latitude, fazenda.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => onMarkerClick?.(fazenda),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{fazenda.nome}</h3>
                <p className="text-sm">{fazenda.localizacao}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
