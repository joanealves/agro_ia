import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function FarmMap() {
  return (
    <MapContainer center={[-15.7801, -47.9292]} zoom={5} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[-15.7801, -47.9292]}>
        <Popup>Fazenda Exemplo</Popup>
      </Marker>
    </MapContainer>
  );
}
