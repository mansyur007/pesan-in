import { getCurrentUser } from '@/lib/auth/session';
import { getMerchantByOwner, getMerchantStats, countNewOrders } from '@/lib/db/queries';
import MerchantShell from '@/components/merchant/MerchantShell';
import StoreToggle from '@/components/merchant/StoreToggle';
import NoStore from '@/components/merchant/NoStore';
import LogoutButton from '@/components/layout/LogoutButton';
import FoodThumb from '@/components/ui/FoodThumb';
import Stars from '@/components/ui/Stars';
import { fmtRp } from '@/lib/format';

export const dynamic = 'force-dynamic';

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-3.5 text-center shadow-sm ring-1 ring-slate-100">
      <div className="text-lg font-extrabold leading-tight">{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-500">{label}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <li className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 last:border-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-base">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{label}</div>
        <div className="truncate text-xs text-slate-500">{value}</div>
      </div>
    </li>
  );
}

export default async function MerchantStorePage() {
  const user = await getCurrentUser();
  const merchant = getMerchantByOwner(user?.id);

  if (!merchant) {
    return (
      <MerchantShell title="Toko">
        <NoStore />
      </MerchantShell>
    );
  }

  const stats = getMerchantStats(merchant.id);

  return (
    <MerchantShell title="Toko" subtitle="Profil & pengaturan" newCount={countNewOrders(merchant.id)}>
      <section className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <FoodThumb label={`banner · ${merchant.name}`} accent={merchant.accent} className="h-24 w-full" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold">{merchant.name}</h2>
              <p className="text-xs text-slate-500">{merchant.address}</p>
              <div className="mt-1">
                <Stars rating={merchant.rating} count={merchant.rating_count} />
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                merchant.is_open ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {merchant.is_open ? 'Buka' : 'Tutup'}
            </span>
          </div>
        </div>
      </section>

      <StoreToggle isOpen={merchant.is_open} />

      <section className="mb-4 grid grid-cols-3 gap-3">
        <Stat label="Pesanan hari ini" value={stats.orders} />
        <Stat label="Pendapatan selesai" value={fmtRp(stats.revenue)} />
        <Stat label="Rating" value={`★ ${merchant.rating}`} />
      </section>

      <ul className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <InfoRow icon="👤" label={user?.full_name || 'Pemilik'} value={user?.email || ''} />
        <InfoRow
          icon="💳"
          label="Wallet"
          value={`${fmtRp(user?.idr_balance)} · ${Number(user?.matic_balance || 0).toFixed(1)} MATIC`}
        />
        <InfoRow icon="🕑" label="Estimasi siap" value={`${merchant.eta} menit`} />
        <InfoRow icon="🏷️" label="Kategori" value={merchant.tags.join(' · ') || merchant.cat || '—'} />
      </ul>

      <div className="mt-4">
        <LogoutButton className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-red-500 hover:bg-red-50" />
      </div>
    </MerchantShell>
  );
}
