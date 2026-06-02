'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Pusat Gunungpati, Semarang
const GUNUNGPATI_CENTER = [-7.0680, 110.3950];

const brandIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function GunungpatiMap({ merchants = [], height = 320 }) {
  useEffect(() => {
    // No-op — icon fix handled via explicit Icon above.
  }, []);

  return (
    <div style={{ height }} className="w-full">
      <MapContainer
        center={GUNUNGPATI_CENTER}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {merchants.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]} icon={brandIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-bold">{m.name}</div>
                <div className="text-xs text-slate-600">{m.address}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
