'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fmtRp, MERCHANT_STATUS } from '@/lib/format';

const TABS = [
  { key: 'paid', label: 'Baru', match: (s) => s === 'paid' },
  { key: 'accepted_merchant', label: 'Diproses', match: (s) => s === 'accepted_merchant' },
  { key: 'ready_for_pickup', label: 'Siap', match: (s) => s === 'ready_for_pickup' },
  { key: 'done', label: 'Selesai', match: (s) => s === 'picked_up' || s === 'delivered' },
  { key: 'rejected', label: 'Ditolak', match: (s) => s === 'rejected' },
];

// Kode pesanan yang enak dibaca, diturunkan dari id asli (bukan nomor baru).
function orderCode(id) {
  return `PSN-${id.slice(0, 4)}-${id.slice(4, 8)}`.toUpperCase();
}

// Waktu relatif baru dihitung setelah mount supaya render server & klien cocok.
function TimeAgo({ iso }) {
  const [text, setText] = useState('');
  useEffect(() => {
    const tick = () => {
      const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
      setText(m < 1 ? 'baru saja' : m < 60 ? `${m} mnt lalu` : `${Math.round(m / 60)} jam lalu`);
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, [iso]);
  return <span className="text-[11px] text-slate-400">{text}</span>;
}

function OrderCard({ o, busy, onAdvance, onReject }) {
  const s = MERCHANT_STATUS[o.status] || MERCHANT_STATUS.paid;
  return (
    <li className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          <span className="font-mono text-xs font-semibold text-slate-700">{orderCode(o.id)}</span>
        </div>
        <TimeAgo iso={o.created_at} />
      </div>

      <div className="px-4 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate text-sm font-bold">{o.buyer?.full_name || 'Pembeli'}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${s.chip}`}>{s.label}</span>
        </div>

        <ul className="space-y-1 text-sm">
          {o.items.map((it, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span className="truncate text-slate-700">
                <span className="font-semibold text-brand-600">{it.qty}×</span> {it.name}
              </span>
              <span className="shrink-0 tabular-nums text-slate-500">{fmtRp(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>

        {o.note && <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">📝 {o.note}</p>}

        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <span>📍</span>
          <span className="truncate">{o.delivery_address}</span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
          <span className="text-xs text-slate-400">Total makanan</span>
          <span className="text-sm font-extrabold">{fmtRp(o.subtotal)}</span>
        </div>

        {o.status === 'paid' && (
          <div className="mt-3 flex gap-2">
            <button
              disabled={busy}
              onClick={() => onReject(o)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              Tolak
            </button>
            <button
              disabled={busy}
              onClick={() => onAdvance(o.id, 'accepted_merchant')}
              className="flex-1 rounded-xl bg-brand-500 py-2.5 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? 'Memproses…' : 'Terima Pesanan'}
            </button>
          </div>
        )}

        {o.status === 'accepted_merchant' && (
          <button
            disabled={busy}
            onClick={() => onAdvance(o.id, 'ready_for_pickup')}
            className="mt-3 w-full rounded-xl bg-violet-500 py-2.5 text-xs font-bold text-white hover:bg-violet-600 disabled:opacity-50"
          >
            {busy ? 'Memproses…' : 'Tandai Siap Diambil'}
          </button>
        )}

        {o.status === 'ready_for_pickup' && (
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 text-xs font-semibold text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            Menunggu driver menjemput
          </div>
        )}
      </div>
    </li>
  );
}

export default function MerchantOrders({ orders }) {
  const router = useRouter();
  const [tab, setTab] = useState('paid');
  const [busy, setBusy] = useState(null);

  async function call(payload, orderId) {
    setBusy(orderId);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(null);
    if (!data.ok) {
      alert(data.error || 'Gagal memperbarui pesanan.');
      return;
    }
    router.refresh();
  }

  const advance = (orderId, status) => call({ action: 'merchant-advance', orderId, status }, orderId);

  function reject(o) {
    if (!confirm(`Tolak pesanan ${orderCode(o.id)} dari ${o.buyer?.full_name || 'pembeli'}?`)) return;
    call({ action: 'merchant-reject', orderId: o.id }, o.id);
  }

  const count = (key) => orders.filter((o) => TABS.find((t) => t.key === key).match(o.status)).length;
  const list = orders.filter((o) => TABS.find((t) => t.key === tab).match(o.status));

  return (
    <>
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                on ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 text-[10px] ${on ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>
                {count(t.key)}
              </span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="grid place-items-center py-20 text-center text-slate-400">
          <div className="mb-2 text-4xl">📭</div>
          <p className="text-sm font-semibold text-slate-500">Tidak ada pesanan di tab ini</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((o) => (
            <OrderCard key={o.id} o={o} busy={busy === o.id} onAdvance={advance} onReject={reject} />
          ))}
        </ul>
      )}
    </>
  );
}
