'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

const pin = (color, label) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${color};color:#fff;font-size:14px;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.3)"><span style="transform:rotate(45deg)">${label}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

// Peta rute warung → alamat pengantaran.
// Menggambar rute jalan asli via OSRM; fallback ke garis lurus bila gagal.
export default function OrderMap({ merchant, dest, height = 224 }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current || !merchant) return;
    const src = [merchant.latitude, merchant.longitude];
    // Tujuan: koordinat pesanan bila ada, jika tidak pakai offset dekat warung.
    const to =
      dest && dest[0] != null && dest[1] != null
        ? [dest[0], dest[1]]
        : [merchant.latitude - 0.004, merchant.longitude + 0.005];

    const map = L.map(elRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false,
    }).setView([(src[0] + to[0]) / 2, (src[1] + to[1]) / 2], 15);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker(src, { icon: pin('#f97316', '🏪') }).addTo(map);
    L.marker(to, { icon: pin('#0d9488', '🏠') }).addTo(map);

    // Garis lurus sementara (juga jadi fallback).
    let route = L.polyline([src, to], {
      color: '#f97316',
      weight: 4,
      dashArray: '8 6',
      opacity: 0.7,
    }).addTo(map);

    const fit = (layer) => map.fitBounds(layer.getBounds(), { padding: [28, 28], maxZoom: 16 });
    fit(route);

    // Ambil geometri rute jalan dari OSRM (server demo publik).
    const controller = new AbortController();
    const url = `https://router.project-osrm.org/route/v1/driving/${src[1]},${src[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const coords = data?.routes?.[0]?.geometry?.coordinates;
        if (!coords?.length || !mapRef.current) return;
        const latlngs = coords.map(([lng, lat]) => [lat, lng]);
        route.remove();
        route = L.polyline(latlngs, { color: '#f97316', weight: 5, opacity: 0.9 }).addTo(map);
        fit(route);
      })
      .catch(() => {});

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      controller.abort();
      map.remove();
      mapRef.current = null;
    };
  }, [merchant, dest]);

  return <div ref={elRef} style={{ height }} className="w-full" />;
}
