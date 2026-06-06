'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fmtRp, STATUS_LABEL } from '@/lib/format';

const NEXT_ACTION = {
  paid: { status: 'accepted_merchant', label: 'Terima & Siapkan' },
  accepted_merchant: { status: 'ready_for_pickup', label: 'Tandai Siap Diambil' },
};

export default function MerchantOrders({ orders }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);

  async function advance(orderId, status) {
    setBusy(orderId);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'merchant-advance', orderId, status }),
    });
    const data = await res.json();
    setBusy(null);
    if (!data.ok) {
      alert(data.error || 'Gagal memperbarui pesanan.');
      return;
    }
    router.refresh();
  }

  if (orders.length === 0) {
    return <p className="text-sm text-slate-500">Belum ada pesanan.</p>;
  }

  return (
    <ul className="space-y-2">
      {orders.map((o) => {
        const action = NEXT_ACTION[o.status];
        return (
          <li key={o.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">#{o.id.slice(0, 8)}</div>
                <div className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString('id-ID')}</div>
                <p className="mt-1 truncate text-xs text-slate-600">
                  {o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-slate-400">📍 {o.delivery_address}</p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-bold">{fmtRp(o.subtotal)}</div>
                <div className="text-[11px] font-semibold text-brand-600">{STATUS_LABEL[o.status]}</div>
              </div>
            </div>
            {action && (
              <button
                disabled={busy === o.id}
                onClick={() => advance(o.id, action.status)}
                className="mt-3 w-full rounded-lg bg-brand-500 py-2 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {busy === o.id ? 'Memproses…' : action.label}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
