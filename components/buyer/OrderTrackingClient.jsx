'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import BackBar from '@/components/ui/BackBar';
import Stars from '@/components/ui/Stars';
import ChatPanel from '@/components/chat/ChatPanel';
import { fmtRp, STATUS_FLOW, STATUS_LABEL } from '@/lib/format';
import { initNotifications, ensurePermission, notify } from '@/lib/notify';

const OrderMap = dynamic(() => import('@/components/maps/OrderMap'), {
  ssr: false,
  loading: () => <div className="h-56 w-full bg-slate-100" />,
});

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-600">{k}</dt>
      <dd className="font-semibold tabular-nums">{v}</dd>
    </div>
  );
}

export default function OrderTrackingClient({ initialOrder }) {
  const router = useRouter();
  const [o, setO] = useState(initialOrder);
  const [chatOpen, setChatOpen] = useState(false);
  const lastStatus = useRef(initialOrder.status);
  const done = o.status === 'delivered';

  // Aktifkan notifikasi saat halaman tracking dibuka.
  useEffect(() => {
    initNotifications();
    ensurePermission();
  }, []);

  // Poll status sampai selesai; kirim notifikasi tiap status berubah.
  useEffect(() => {
    if (done) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${o.id}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.ok) {
          if (data.order.status !== lastStatus.current) {
            lastStatus.current = data.order.status;
            notify('Pesan.in — Update pesanan', {
              body: `${STATUS_LABEL[data.order.status]} · ${data.order.merchant?.name || ''}`,
              data: { url: `/orders/${data.order.id}` },
              tag: `order-${data.order.id}`,
            });
          }
          setO(data.order);
        }
      } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [o.id, done]);

  const idx = STATUS_FLOW.indexOf(o.status);

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <BackBar title="Lacak Pesanan" back="/buyer" />
      <div className="relative">
        <OrderMap merchant={o.merchant} />
        <div className="absolute inset-x-0 bottom-0 translate-y-px bg-gradient-to-t from-slate-50 to-transparent pt-8" />
      </div>

      <main className="mx-auto -mt-4 max-w-2xl space-y-4 px-4">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            {!done && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" />
              </span>
            )}
            <span className={`text-xs font-bold uppercase tracking-wide ${done ? 'text-emerald-600' : 'text-brand-600'}`}>
              {done ? '✓ Selesai' : 'Sedang berjalan'}
            </span>
          </div>
          <h2 className="mt-1.5 text-xl font-extrabold">{STATUS_LABEL[o.status]}</h2>
          <p className="text-sm text-slate-500">
            Estimasi tiba {o.merchant?.eta} menit · {o.merchant?.name}
          </p>

          <ol className="mt-5 space-y-0">
            {STATUS_FLOW.map((s, i) => {
              const reached = i <= idx;
              const current = i === idx && !done;
              return (
                <li key={s} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold transition ${reached ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-400'} ${current ? 'ring-4 ring-brand-100' : ''}`}>
                      {reached ? '✓' : i + 1}
                    </span>
                    {i < STATUS_FLOW.length - 1 && (
                      <span className={`my-0.5 w-0.5 flex-1 ${i < idx ? 'bg-brand-500' : 'bg-slate-200'}`} style={{ minHeight: 18 }} />
                    )}
                  </div>
                  <div className={`pb-3 text-sm ${reached ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>
                    {STATUS_LABEL[s]}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {o.driver && !done && (
          <section className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-2xl">{o.driver.avatar || '🏍️'}</div>
            <div className="flex-1">
              <div className="text-sm font-bold">{o.driver.full_name}</div>
              <div className="text-xs text-slate-500">Driver Pesan.in {o.driver.phone ? `· ${o.driver.phone}` : ''}</div>
              <div className="mt-0.5"><Stars rating={4.9} /></div>
            </div>
            {o.driver.phone && (
              <a
                href={`tel:${o.driver.phone.replace(/[^0-9+]/g, '')}`}
                className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                aria-label="Telepon driver"
              >
                📞
              </a>
            )}
            <button
              onClick={() => setChatOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              aria-label="Chat driver"
            >
              💬
            </button>
          </section>
        )}

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Ringkasan Pesanan</h3>
          <ul className="space-y-1.5 text-sm">
            {o.items.map((it, i) => (
              <li key={i} className="flex justify-between">
                <span className="text-slate-700"><span className="font-semibold text-brand-600">{it.qty}×</span> {it.name}</span>
                <span className="tabular-nums text-slate-500">{fmtRp(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="my-3 border-t border-dashed border-slate-200" />
          <dl className="space-y-1.5 text-sm">
            <Row k="Subtotal" v={fmtRp(o.subtotal)} />
            <Row k="Ongkir" v={fmtRp(o.delivery_fee)} />
            <Row k="Biaya jaringan (gas)" v={fmtRp(o.gas_fee)} />
            <Row k={<span className="font-bold text-slate-800">Total</span>} v={<span className="font-extrabold">{fmtRp(o.total)}</span>} />
          </dl>
        </section>

        <section className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-700"><span>⛓️</span> Tercatat on-chain · Polygon</div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <code className="truncate font-mono text-[11px] text-violet-600">{o.tx_hash}</code>
            <span className="shrink-0 text-[11px] font-semibold text-violet-500">Lihat ↗</span>
          </div>
        </section>

        {done && (
          <button onClick={() => router.push('/buyer')} className="w-full rounded-2xl bg-brand-500 py-3.5 text-sm font-bold text-white hover:bg-brand-600">
            Selesai · Kembali ke Beranda
          </button>
        )}
      </main>

      {chatOpen && o.driver && (
        <ChatPanel
          orderId={o.id}
          myRole="buyer"
          peerName={o.driver.full_name}
          peerAvatar={o.driver.avatar || '🏍️'}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
