'use client';

// Helper notifikasi status pesanan (Web Notifications + service worker).
// Pendekatan ringan tanpa server push: notifikasi dipicu dari sisi client
// saat polling mendeteksi perubahan status.

let swReg = null;

export async function initNotifications() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    swReg = await navigator.serviceWorker.register('/sw.js');
    return swReg;
  } catch {
    return null;
  }
}

export async function ensurePermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const res = await Notification.requestPermission();
  return res === 'granted';
}

export async function notify(title, options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  const opts = { ...options };
  try {
    const reg = swReg || (await navigator.serviceWorker?.getRegistration());
    if (reg?.showNotification) await reg.showNotification(title, opts);
    else new Notification(title, opts);
  } catch {
    try {
      new Notification(title, opts);
    } catch {}
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// Daftarkan device ini ke server (VAPID) supaya notifikasi status pesanan tetap
// masuk walau tab/app sedang tertutup — pelengkap notify() yang cuma jalan saat
// halaman tracking/dashboard sedang terbuka dan polling aktif. Best-effort,
// gagal diam-diam (device lama / browser tanpa Push API / offline saat subscribe).
export async function subscribeToPush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try {
    const reg = swReg || (await navigator.serviceWorker.ready);
    const existing = await reg.pushManager.getSubscription();
    if (existing) return;

    const keyRes = await fetch('/api/push');
    const { ok, publicKey } = await keyRes.json();
    if (!ok || !publicKey) return;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    await fetch('/api/push', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'subscribe', subscription: sub.toJSON() }),
    });
  } catch {}
}

// Lepas subscription device ini — dipanggil saat logout supaya device yang
// dipakai bergantian (mis. HP bersama) tidak terus menerima notifikasi milik
// akun yang sudah keluar.
export async function unsubscribeFromPush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const reg = swReg || (await navigator.serviceWorker.getRegistration());
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await fetch('/api/push', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'unsubscribe', endpoint: sub.endpoint }),
    });
    await sub.unsubscribe();
  } catch {}
}
