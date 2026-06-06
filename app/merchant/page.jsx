import { getCurrentUser } from '@/lib/auth/session';
import { getMerchantByOwner, getMenu, getMerchantOrders } from '@/lib/db/queries';
import TopBar from '@/components/layout/TopBar';
import MerchantOrders from '@/components/merchant/MerchantOrders';
import MenuManager from '@/components/merchant/MenuManager';

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
            </section>

            <section className="mb-6">
              <MenuManager menu={menu} isOpen={merchant.is_open} />
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
