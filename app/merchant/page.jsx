import { getCurrentUser } from '@/lib/auth/session';
import { getMerchantByOwner, getMenu, getMerchantOrders } from '@/lib/db/queries';
import TopBar from '@/components/layout/TopBar';
import MerchantOrders from '@/components/merchant/MerchantOrders';
import { fmtRp } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function MerchantDashboard() {
  const user = await getCurrentUser();
  const merchant = getMerchantByOwner(user?.id);
  const menu = merchant ? getMenu(merchant.id) : [];
  const orders = merchant ? getMerchantOrders(merchant.id) : [];

  return (
    <>
      <TopBar user={user} title="Merchant" />
      <main className="mx-auto max-w-4xl px-4 py-6">
        {!merchant ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <p className="mb-4 text-slate-600">Kamu belum punya toko terdaftar.</p>
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
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {menu.map((m) => (
                  <li key={m.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                    <div>
                      <div className="text-sm font-semibold">{m.name}</div>
                      <div className="text-xs text-slate-500">{fmtRp(m.price)}</div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {m.is_available ? 'Tersedia' : 'Habis'}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Pesanan Masuk</h3>
              <MerchantOrders orders={orders} />
            </section>
          </>
        )}
      </main>
    </>
  );
}
