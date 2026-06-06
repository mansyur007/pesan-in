'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatButton from '@/components/chat/ChatButton';
import { fmtRp, STATUS_LABEL } from '@/lib/format';

function itemSummary(items = []) {
  return items.map((i) => `${i.qty}× ${i.name}`).join(', ');
}

function AvailableRow({ o, busy, onAccept }) {
  const itemCount = (o.items || []).reduce((a, i) => a + i.qty, 0);
  return (
    <li className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">#{o.id.slice(0, 8)}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {STATUS_LABEL[o.status]}
            </span>
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-700">🏪 {o.merchant?.name}</div>
          <div className="mt-0.5 text-xs text-slate-500">📍 {o.delivery_address}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-bold text-emerald-700">+{fmtRp(o.delivery_fee)}</div>
          <div className="text-[10px] text-slate-400">ongkir</div>
        </div>
      </div>

      {/* Detail isi pesanan */}
      <div className="mt-3 rounded-lg bg-slate-50 p-3">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Detail pesanan · {itemCount} item
        </div>
        <ul className="space-y-0.5 text-xs text-slate-600">
          {(o.items || []).map((it, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span className="truncate">
                <span className="font-semibold text-slate-700">{it.qty}×</span> {it.name}
              </span>
              <span className="shrink-0 tabular-nums text-slate-400">{fmtRp(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-dashed border-slate-200 pt-2 text-xs">
          <span className="text-slate-500">Subtotal makanan</span>
          <span className="font-bold tabular-nums">{fmtRp(o.subtotal)}</span>
        </div>
      </div>

      <button
        disabled={busy}
        onClick={() => onAccept(o.id)}
        className="mt-3 w-full rounded-lg bg-brand-500 py-2 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {busy ? 'Mengambil…' : 'Ambil Pesanan'}
      </button>
    </li>
  );
}

function MineRow({ o, busy, onComplete }) {
  return (
    <li className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">#{o.id.slice(0, 8)}</div>
          <div className="mt-0.5 text-xs text-slate-600">{o.buyer?.full_name}</div>
          <div className="mt-1 text-xs text-slate-600">📍 {o.delivery_address}</div>
          <p className="mt-1 truncate text-[11px] text-slate-400">{itemSummary(o.items)}</p>
          <div className="mt-1 text-xs text-brand-600">{STATUS_LABEL[o.status]}</div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex gap-2">
            {o.buyer?.phone && (
              <a
                href={`tel:${o.buyer.phone.replace(/[^0-9+]/g, '')}`}
                className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                aria-label="Telepon pembeli"
              >
                📞
              </a>
            )}
            <ChatButton
              orderId={o.id}
              myRole="driver"
              peerName={o.buyer?.full_name || 'Pembeli'}
              peerAvatar={o.buyer?.avatar || '🙂'}
              className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            />
          </div>
          <button
            disabled={busy}
            onClick={() => onComplete(o.id)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy ? 'Menyelesaikan…' : 'Tandai Selesai'}
          </button>
        </div>
      </div>
    </li>
  );
}

export default function DriverOrdersList({ available, mine }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);

  async function call(action, orderId) {
    setBusy(orderId);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, orderId }),
    });
    const data = await res.json();
    setBusy(null);
    if (!data.ok) {
      alert(data.error || 'Gagal.');
      return data;
    }
    router.refresh();
    return data;
  }

  async function acceptOrder(id) {
    await call('driver-accept', id);
  }

  async function completeOrder(id) {
    const data = await call('driver-complete', id);
    if (data?.ok && data.txHash) {
      alert(`Dana didistribusi otomatis lewat smart contract.\nTx hash (mock): ${data.txHash.slice(0, 22)}…`);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-bold">Pesanan Tersedia ({available.length})</h2>
        {available.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada pesanan tersedia.</p>
        ) : (
          <ul className="space-y-2">
            {available.map((o) => (
              <AvailableRow key={o.id} o={o} busy={busy === o.id} onAccept={acceptOrder} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Pesanan Saya ({mine.length})</h2>
        {mine.length === 0 ? (
          <p className="text-sm text-slate-500">Tidak ada pesanan aktif.</p>
        ) : (
          <ul className="space-y-2">
            {mine.map((o) => (
              <MineRow key={o.id} o={o} busy={busy === o.id} onComplete={completeOrder} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
