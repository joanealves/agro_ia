import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { getFarms } from "../../lib/api";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Configuração do ícone do marcador
const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41], 
  iconAnchor: [12, 41], 
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Farm {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
}

// controlar o centro do mapa
function SetMapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function FarmMap() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const initialCenter: [number, number] = [-15.7801, -47.9292]; // Coordenadas iniciais do mapa

  useEffect(() => {
    async function fetchFarms() {
      try {
        const data = await getFarms();
        setFarms(data.map((farm: any) => ({ ...farm, id: farm.id.toString() })));
      } catch (error) {
        console.error("Erro ao carregar fazendas:", error);
      }
    }
    fetchFarms();
  }, []);

  return (
    <MapContainer
      center={initialCenter} 
      zoom={5}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <SetMapCenter center={initialCenter} /> 
      {farms.map((farm) => (
        <Marker key={farm.id} position={[farm.latitude, farm.longitude]}>
          <Popup>{farm.nome}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}