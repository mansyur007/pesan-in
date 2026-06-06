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
