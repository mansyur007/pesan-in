import { getCurrentUser } from '@/lib/auth/session';
import BuyerTabBar from '@/components/buyer/BuyerTabBar';
import AccountRows from '@/components/buyer/AccountRows';
import { fmtRp } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AccountScreen() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-brand-500 px-4 pb-6 pt-5 text-white">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white/20 text-2xl">{user?.avatar || '👤'}</div>
          <div>
            <div className="text-lg font-extrabold">{user?.full_name}</div>
            <div className="text-sm text-white/80">{user?.email}</div>
          </div>
        </div>
      </header>
      <main className="mx-auto -mt-4 max-w-4xl px-4">
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div>
            <div className="text-xs text-slate-400">Saldo Wallet</div>
            <div className="text-xl font-extrabold">
              {fmtRp(user?.idr_balance)}{' '}
              <span className="text-sm font-semibold text-slate-400">≈ {Number(user?.matic_balance || 0).toFixed(1)} MATIC</span>
            </div>
          </div>
          <button className="rounded-xl bg-brand-50 px-4 py-2 text-sm font-bold text-brand-600">Top Up</button>
        </div>

        <AccountRows address={user?.address || 'Belum diatur'} />
      </main>
      <BuyerTabBar />
    </div>
  );
}
