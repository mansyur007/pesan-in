import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { getActiveOrdersForBuyer, getOrderHistoryForBuyer } from '@/lib/db/queries';
import FoodThumb from '@/components/ui/FoodThumb';
import BuyerTabBar from '@/components/buyer/BuyerTabBar';
import { fmtRp, STATUS_LABEL } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function OrdersScreen() {
  const user = await getCurrentUser();
  const activeOrders = user ? getActiveOrdersForBuyer(user.id) : [];
  const history = user ? getOrderHistoryForBuyer(user.id) : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-3.5 backdrop-blur">
        <h1 className="mx-auto max-w-4xl text-lg font-extrabold">Pesanan</h1>
      </header>
      <main className="mx-auto max-w-4xl space-y-5 px-4 py-4">
        {activeOrders.length > 0 && (
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              Sedang berjalan ({activeOrders.length})
            </h2>
            <ul className="space-y-3">
              {activeOrders.map((active) => (
                <li key={active.id}>
                  <Link
                    href={`/orders/${active.id}`}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-sm ring-1 ring-brand-200"
                  >
                    <FoodThumb label={active.merchant?.cat} accent={active.merchant?.accent} className="h-14 w-14 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold">{active.merchant?.name}</div>
                      <div className="text-xs text-brand-600">{STATUS_LABEL[active.status]}</div>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {active.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-brand-600">Lacak ›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Riwayat</h2>
          {history.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Belum ada pesanan selesai.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((h) => (
                <li key={h.id} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-100">
                  <FoodThumb label="resto" accent={h.merchant?.accent || '#f97316'} className="h-14 w-14 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-bold">{h.merchant?.name || 'Merchant'}</span>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">Selesai</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {h.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-700">{fmtRp(h.total)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <BuyerTabBar />
    </div>
  );
}
