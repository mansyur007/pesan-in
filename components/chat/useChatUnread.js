'use client';

import { useEffect, useRef, useState } from 'react';

// Hitung jumlah pesan masuk (dari lawan bicara) yang belum terbaca untuk satu
// pesanan. "Terbaca" disimpan di localStorage per pesanan.
export function useChatUnread(orderId, myRole, { active = true, interval = 5000 } = {}) {
  const [unread, setUnread] = useState(0);
  const maxRef = useRef(0);
  const lastReadRef = useRef(0);
  const readKey = `chat_read_${orderId}`;

  useEffect(() => {
    if (!orderId || !active) return;
    lastReadRef.current = Number(localStorage.getItem(readKey) || 0);
    let stop = false;

    async function poll() {
      try {
        const res = await fetch(`/api/orders/${orderId}/messages`, { cache: 'no-store' });
        const data = await res.json();
        if (!data.ok || stop) return;
        maxRef.current = data.messages.reduce((a, m) => Math.max(a, m.id), 0);
        const count = data.messages.filter(
          (m) => m.sender_role !== myRole && m.id > lastReadRef.current
        ).length;
        setUnread(count);
      } catch {}
    }

    poll();
    const t = setInterval(poll, interval);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [orderId, myRole, active, interval, readKey]);

  function markRead() {
    lastReadRef.current = maxRef.current;
    try {
      localStorage.setItem(readKey, String(maxRef.current));
    } catch {}
    setUnread(0);
  }

  return { unread, markRead };
}
