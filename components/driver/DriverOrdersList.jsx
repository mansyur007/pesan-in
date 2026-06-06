'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatPanel from '@/components/chat/ChatPanel';
import { fmtRp, STATUS_LABEL } from '@/lib/format';

export default function DriverOrdersList({ available, mine }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);

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
              <li key={o.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">#{o.id.slice(0, 8)}</div>
                    <div className="mt-1 text-xs text-slate-600">{o.merchant?.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500">📍 {o.delivery_address}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold text-emerald-700">+{fmtRp(o.delivery_fee)}</div>
                    <button
                      disabled={busy === o.id}
                      onClick={() => acceptOrder(o.id)}
                      className="mt-2 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {busy === o.id ? '…' : 'Ambil'}
                    </button>
                  </div>
                </div>
              </li>
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
              <li key={o.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">#{o.id.slice(0, 8)}</div>
                    <div className="mt-0.5 text-xs text-slate-600">{o.buyer?.full_name}</div>
                    <div className="mt-1 text-xs text-slate-600">📍 {o.delivery_address}</div>
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
                      <button
                        onClick={() => setChatOrder(o)}
                        className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                        aria-label="Chat pembeli"
                      >
                        💬
                      </button>
                    </div>
                    <button
                      disabled={busy === o.id}
                      onClick={() => completeOrder(o.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {busy === o.id ? 'Menyelesaikan…' : 'Tandai Selesai'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {chatOrder && (
        <ChatPanel
          orderId={chatOrder.id}
          myRole="driver"
          peerName={chatOrder.buyer?.full_name || 'Pembeli'}
          peerAvatar={chatOrder.buyer?.avatar || '🙂'}
          onClose={() => setChatOrder(null)}
        />
      )}
    </div>
  );
}
