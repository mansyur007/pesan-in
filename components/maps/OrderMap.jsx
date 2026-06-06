'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Peta rute sederhana: warung → alamat pengantaran.
export default function OrderMap({ merchant, height = 224 }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current || !merchant) return;
    const src = [merchant.latitude, merchant.longitude];
    const dest = [merchant.latitude - 0.004, merchant.longitude + 0.005];
    const map = L.map(elRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false,
    }).setView([(src[0] + dest[0]) / 2, (src[1] + dest[1]) / 2], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const mk = (latlng, color, label) =>
      L.marker(latlng, {
        icon: L.divIcon({
          className: '',
          html: `<div style="background:${color};color:#fff;font-size:14px;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.3)"><span style="transform:rotate(45deg)">${label}</span></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }),
      }).addTo(map);

    mk(src, '#f97316', '🏪');
    mk(dest, '#0d9488', '🏠');
    L.polyline([src, dest], { color: '#f97316', weight: 4, dashArray: '8 6', opacity: 0.8 }).addTo(map);

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [merchant]);

  return <div ref={elRef} style={{ height }} className="w-full" />;
}
