'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const GUNUNGPATI_CENTER = [-7.068, 110.395];

function pinIcon(accent = '#f97316', open = true) {
  const color = open ? accent : '#94a3b8';
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid #fff"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });
}

export default function GunungpatiMap({ merchants = [], height = 320 }) {
  return (
    <div style={{ height }} className="w-full">
      <MapContainer
        center={GUNUNGPATI_CENTER}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {merchants.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]} icon={pinIcon(m.accent, m.is_open)}>
            <Popup>
              <div className="text-sm">
                <div className="font-bold">{m.name}</div>
                <div className="text-xs text-slate-600">{m.address}</div>
                <a href={`/resto/${m.id}`} className="mt-1 inline-block text-xs font-semibold text-brand-600">
                  Lihat menu ›
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
