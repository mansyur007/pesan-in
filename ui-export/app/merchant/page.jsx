import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { isDemoMode } from '@/lib/auth/demo';
import { DEMO_MERCHANTS, DEMO_MENU, DEMO_ORDERS } from '@/lib/data/demo-db';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/layout/TopBar';

export default async function MerchantDashboard() {
  const user = await getCurrentUser();

  let merchant = null;
  let menu = [];
  let orders = [];

  if (isDemoMode()) {
    merchant = DEMO_MERCHANTS.find((m) => m.owner_id === user.id) || DEMO_MERCHANTS[0];
    menu = DEMO_MENU[merchant.id] || [];
    orders = DEMO_ORDERS.filter((o) => o.merchant_id === merchant.id);
  } else {
    const supabase = createClient();
    const { data: m } = await supabase
      .from('merchants').select('*').eq('owner_id', user.id).maybeSingle();
    merchant = m;
    if (merchant) {
      const { data: mi } = await supabase
        .from('menu_items').select('*').eq('merchant_id', merchant.id);
      menu = mi ?? [];
      const { data: ord } = await supabase
        .from('orders').select('id, total, status, created_at, subtotal')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false }).limit(20);
      orders = ord ?? [];
    }
  }

  return (
    <>
      <TopBar user={user} title="Merchant" />
      <main className="mx-auto max-w-4xl px-4 py-6">
        {isDemoMode() && <DemoBanner />}

        {!merchant ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <p className="mb-4 text-slate-600">Kamu belum setup toko.</p>
          </div>
        ) : (
          <>
            <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-lg font-bold">{merchant.name}</h2>
              <p className="text-sm text-slate-600">{merchant.address}</p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {merchant.is_open ? 'Buka' : 'Tutup'}
              </div>
            </section>

            <section className="mb-6">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Menu ({menu.length})</h3>
              {menu.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada menu.</p>
              ) : (
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {menu.map((m) => (
                    <li key={m.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                      <div>
                        <div className="text-sm font-semibold">{m.name}</div>
                        <div className="text-xs text-slate-500">Rp{Number(m.price).toLocaleString('id-ID')}</div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {m.is_available ? 'Tersedia' : 'Habis'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Pesanan Masuk</h3>
              {orders.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada pesanan.</p>
              ) : (
                <ul className="space-y-2">
                  {orders.map((o) => (
                    <li key={o.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                      <div>
                        <div className="text-sm font-semibold">#{String(o.id).slice(0, 8)}</div>
                        <div className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString('id-ID')}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">Rp{Number(o.subtotal ?? o.total).toLocaleString('id-ID')}</div>
                        <div className="text-xs text-brand-600">{o.status}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

function DemoBanner() {
  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
      <b>Demo mode.</b> Data di halaman ini adalah contoh — isi <code>.env.local</code> dengan
      kredensial Supabase untuk pakai database beneran.
    </div>
  );
}
