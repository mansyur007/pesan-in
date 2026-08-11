'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Saklar buka/tutup toko. Optimistik, dibalik lagi kalau server menolak.
export default function StoreToggle({ isOpen }) {
  const router = useRouter();
  const [open, setOpen] = useState(isOpen);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !open;
    setOpen(next);
    setBusy(true);
    const res = await fetch('/api/merchant', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'store-toggle', is_open: next }),
    });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) {
      setOpen(!next);
      alert(data.error || 'Gagal mengubah status toko.');
      return;
    }
    router.refresh();
  }

  return (
    <section className="mb-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div>
        <div className="text-sm font-bold">{open ? 'Toko sedang buka' : 'Toko sedang tutup'}</div>
        <div className="text-xs text-slate-500">
          {open ? 'Menerima pesanan masuk' : 'Pelanggan tidak bisa memesan'}
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={busy}
        aria-label="Buka atau tutup toko"
        aria-pressed={open}
        className={`relative h-7 w-12 rounded-full transition disabled:opacity-60 ${open ? 'bg-emerald-500' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${open ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </section>
  );
}
