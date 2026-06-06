'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FoodThumb from '@/components/ui/FoodThumb';
import Stars from '@/components/ui/Stars';
import BuyerTabBar from '@/components/buyer/BuyerTabBar';
import { useCart } from '@/components/buyer/CartProvider';
import { fmtRp, STATUS_LABEL } from '@/lib/format';

const GunungpatiMap = dynamic(() => import('@/components/maps/GunungpatiMap'), {
  ssr: false,
  loading: () => <div className="grid h-[360px] place-items-center bg-slate-100 text-sm text-slate-400">Memuat peta…</div>,
});

export default function BuyerHomeClient({ merchants, categories, activeOrder, address }) {
  const router = useRouter();
  const { count, subtotal } = useCart();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(null);
  const [view, setView] = useState('list');

  const filtered = useMemo(() => {
    let list = merchants;
    if (cat) list = list.filter((m) => m.cat === cat);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (m) => m.name.toLowerCase().includes(s) || m.tags.join(' ').toLowerCase().includes(s)
      );
    }
    return list;
  }, [merchants, cat, q]);

  const cartCount = count();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white">
        <div className="mx-auto max-w-4xl px-4 pt-3">
          <button onClick={() => router.push('/account')} className="flex items-center gap-1.5 text-left">
            <span className="text-brand-500">📍</span>
            <span className="text-xs text-slate-500">Antar ke</span>
            <span className="max-w-[200px] truncate text-xs font-bold text-slate-800">{address}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari warung atau menu di Gunungpati"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-3" style={{ scrollbarWidth: 'none' }}>
            {categories.map((c) => {
              const on = cat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(on ? null : c.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    on ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span>{c.emoji}</span>
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-4">
        {activeOrder && activeOrder.status !== 'delivered' && (
          <Link
            href={`/orders/${activeOrder.id}`}
            className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-3 text-left"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" />
            </span>
            <div className="flex-1">
              <div className="text-xs font-bold text-brand-700">Pesanan sedang diproses</div>
              <div className="text-[11px] text-brand-600/80">
                {STATUS_LABEL[activeOrder.status]} · {activeOrder.merchant?.name}
              </div>
            </div>
            <span className="text-xs font-bold text-brand-600">Lacak ›</span>
          </Link>
        )}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">
            {cat || q ? `Hasil (${filtered.length})` : 'Warung di sekitarmu'}
          </h2>
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            <button onClick={() => setView('list')} className={`rounded-md px-2.5 py-1 ${view === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>List</button>
            <button onClick={() => setView('map')} className={`rounded-md px-2.5 py-1 ${view === 'map' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Peta</button>
          </div>
        </div>

        {view === 'map' ? (
          <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <GunungpatiMap merchants={filtered} height={360} />
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => m.is_open && router.push(`/resto/${m.id}`)}
                  disabled={!m.is_open}
                  className={`flex w-full gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-100 transition ${
                    m.is_open ? 'hover:ring-brand-200' : 'opacity-70'
                  }`}
                >
                  <FoodThumb label={m.cat} accent={m.accent} className="h-20 w-20 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-bold">{m.name}</h3>
                      {!m.is_open && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Tutup</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Stars rating={m.rating} count={m.rating_count} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                      <span>🛵 {m.distance}</span><span>·</span>
                      <span>⏱ {m.eta} mnt</span><span>·</span>
                      <span className="truncate">{m.tags.join(' · ')}</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">Tidak ada warung yang cocok.</p>
            )}
          </ul>
        )}
      </main>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-[60px] z-30 px-4">
          <button
            onClick={() => router.push('/cart')}
            className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-2xl bg-brand-500 px-5 py-3.5 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600"
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 text-xs">{cartCount}</span>
              Lihat Keranjang
            </span>
            <span className="text-sm font-bold">{fmtRp(subtotal())}</span>
          </button>
        </div>
      )}

      <BuyerTabBar />
    </div>
  );
}
