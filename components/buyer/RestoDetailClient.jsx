'use client';

import { useRouter } from 'next/navigation';
import BackBar from '@/components/ui/BackBar';
import FoodThumb from '@/components/ui/FoodThumb';
import Stars from '@/components/ui/Stars';
import QtyStepper from '@/components/ui/QtyStepper';
import { useCart } from '@/components/buyer/CartProvider';
import { fmtRp } from '@/lib/format';

export default function RestoDetailClient({ merchant: m, menu }) {
  const router = useRouter();
  const { addItem, decItem, qtyOf, count, subtotal } = useCart();

  const popular = menu.filter((x) => x.popular);
  const rest = menu.filter((x) => !x.popular);
  const cartCount = count();

  const Row = (item) => (
    <li key={item.id} className="flex gap-3 py-4">
      <FoodThumb label="menu" accent={m.accent} className={`h-16 w-16 shrink-0 rounded-xl ${!item.is_available ? 'grayscale' : ''}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">{item.name}</h4>
          {item.popular && (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">Populer</span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold">{fmtRp(item.price)}</span>
          {item.is_available ? (
            <QtyStepper qty={qtyOf(item.id)} onAdd={() => addItem(m, item)} onDec={() => decItem(item.id)} />
          ) : (
            <span className="text-xs font-semibold text-slate-400">Habis</span>
          )}
        </div>
      </div>
    </li>
  );

  return (
    <div className="min-h-screen bg-white pb-28">
      <BackBar title={m.name} back="/buyer" />
      <FoodThumb label={`banner · ${m.name}`} accent={m.accent} className="h-40 w-full" />
      <div className="mx-auto max-w-4xl px-4">
        <div className="border-b border-slate-100 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold">{m.name}</h1>
              <p className="mt-0.5 text-xs text-slate-500">{m.address}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${m.is_open ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {m.is_open ? 'Buka' : 'Tutup'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
            <Stars rating={m.rating} count={m.rating_count} />
            <span>🛵 {m.distance}</span>
            <span>⏱ {m.eta} mnt</span>
          </div>
        </div>

        {popular.length > 0 && (
          <section>
            <h3 className="pt-4 text-sm font-bold uppercase tracking-wide text-slate-500">Paling laris</h3>
            <ul className="divide-y divide-slate-100">{popular.map(Row)}</ul>
          </section>
        )}
        <section>
          <h3 className="pt-4 text-sm font-bold uppercase tracking-wide text-slate-500">Menu lainnya</h3>
          <ul className="divide-y divide-slate-100">{rest.map(Row)}</ul>
        </section>
      </div>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white p-4">
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
    </div>
  );
}
