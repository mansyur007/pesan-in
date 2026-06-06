'use client';

import { useRouter } from 'next/navigation';

export default function AccountRows({ address }) {
  const router = useRouter();
  const rows = [
    { icon: '📍', label: 'Alamat tersimpan', sub: address },
    { icon: '💳', label: 'Wallet & pembayaran', sub: 'Polygon · 0x7a…3f9' },
    { icon: '🧾', label: 'Riwayat transaksi', sub: 'Lihat semua pesanan', go: '/orders' },
    { icon: '❓', label: 'Bantuan', sub: 'Pusat bantuan & FAQ' },
  ];

  async function logout() {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <ul className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        {rows.map((r, i) => (
          <li key={i}>
            <button
              onClick={() => r.go && router.push(r.go)}
              className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left last:border-0 hover:bg-slate-50"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-base">{r.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{r.label}</div>
                <div className="text-xs text-slate-500">{r.sub}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={logout}
        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
      >
        Keluar
      </button>
    </>
  );
}
