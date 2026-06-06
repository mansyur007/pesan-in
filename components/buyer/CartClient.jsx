'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackBar from '@/components/ui/BackBar';
import FoodThumb from '@/components/ui/FoodThumb';
import QtyStepper from '@/components/ui/QtyStepper';
import { useCart } from '@/components/buyer/CartProvider';
import { fmtRp, DELIVERY_FEE, GAS_FEE } from '@/lib/format';

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-600">{k}</dt>
      <dd className="font-semibold tabular-nums">{v}</dd>
    </div>
  );
}

export default function CartClient({ defaultAddress }) {
  const router = useRouter();
  const { cart, ready, lines, addItem, decItem, subtotal, clearCart } = useCart();
  const [address, setAddress] = useState(defaultAddress);
  const [note, setNote] = useState('');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  const m = cart.merchant;
  const items = lines();

  if (ready && (!m || items.length === 0)) {
    return (
      <div className="min-h-screen bg-white">
        <BackBar title="Keranjang" back="/buyer" />
        <div className="grid place-items-center px-6 py-24 text-center">
          <div className="mb-3 text-5xl">🛒</div>
          <p className="font-bold">Keranjang masih kosong</p>
          <p className="mt-1 text-sm text-slate-500">Yuk pilih makanan favoritmu dulu.</p>
          <button onClick={() => router.push('/buyer')} className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
            Cari Makanan
          </button>
        </div>
      </div>
    );
  }

  const sub = subtotal();
  const total = sub + DELIVERY_FEE + GAS_FEE;

  async function pay() {
    if (!address.trim()) {
      setError('Alamat pengantaran wajib diisi.');
      return;
    }
    setPaying(true);
    setError(null);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        merchantId: m.id,
        items: items.map((l) => ({ id: l.id, qty: l.qty, name: l.name })),
        address,
        note,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error || 'Pembayaran gagal.');
      setPaying(false);
      return;
    }
    clearCart();
    router.push(`/orders/${data.order.id}`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      <BackBar title="Keranjang" back={m ? `/resto/${m.id}` : '/buyer'} />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            <span>📍</span> Alamat Pengantaran
          </div>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            placeholder="Tulis alamat lengkap pengantaran"
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FoodThumb label={m?.cat} accent={m?.accent} className="h-9 w-9 rounded-lg" />
            <h2 className="font-bold">{m?.name}</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {items.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{l.name}</div>
                  <div className="text-xs text-slate-500">{fmtRp(l.price)}</div>
                </div>
                <QtyStepper qty={l.qty} onAdd={() => addItem(m, l)} onDec={() => decItem(l.id)} />
                <div className="w-20 text-right text-sm font-bold tabular-nums">{fmtRp(l.lineTotal)}</div>
              </li>
            ))}
          </ul>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan untuk merchant (opsional)"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Rincian Pembayaran</h3>
          <dl className="space-y-2 text-sm">
            <Row k="Subtotal makanan" v={fmtRp(sub)} />
            <Row k="Ongkir (ke driver)" v={fmtRp(DELIVERY_FEE)} />
            <Row
              k={<span className="inline-flex items-center gap-1">Biaya jaringan (gas) <span className="rounded bg-violet-50 px-1 text-[10px] font-bold text-violet-600">Polygon</span></span>}
              v={fmtRp(GAS_FEE)}
            />
            <div className="my-2 border-t border-dashed border-slate-200" />
            <Row
              k={<span className="font-bold text-slate-800">Total bayar</span>}
              v={<span className="text-base font-extrabold text-slate-900">{fmtRp(total)}</span>}
            />
          </dl>
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-slate-50 p-2.5 text-[11px] leading-relaxed text-slate-500">
            <span>🔒</span> Dana ditahan di smart contract (escrow) dan baru dirilis ke merchant &amp; driver saat pesanan
            selesai. 0% komisi platform.
          </p>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white p-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="leading-tight">
            <div className="text-[11px] text-slate-400">Total</div>
            <div className="text-lg font-extrabold">{fmtRp(total)}</div>
          </div>
          <button
            onClick={pay}
            disabled={paying}
            className="flex-1 rounded-2xl bg-brand-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600 disabled:opacity-60"
          >
            {paying ? 'Memproses pembayaran…' : 'Pesan & Bayar'}
          </button>
        </div>
      </div>
    </div>
  );
}
